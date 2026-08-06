#!/usr/bin/env node
/*
 * Serialize work that writes to data/generated/ and public/.
 *
 * WHY THIS EXISTS — this is not hypothetical. On 2026-07-30 this checkout had
 * three zola processes running at once (a `zola serve` plus two `zola build`
 * from parallel agent sessions). The observable symptoms were NOT "another
 * build is running":
 *
 *   * "ERROR Couldn't delete output directory / Directory not empty (os error 66)"
 *   * a build killed mid-write (SIGTERM, exit 143)
 *   * and worst of all, post-build validators reading a public/ that zola was
 *     still writing, and reporting a DATA inconsistency that did not exist —
 *     "666 claim record file(s) on disk but 658 Claim node(s) in the built
 *     site". Re-running the validator against the finished output passed.
 *
 * That last one is the real cost. A concurrency bug wearing the costume of a
 * data-integrity failure sends someone hunting through the dossier registries
 * for a corruption that was never there.
 *
 * 2026-08-06 widened: the lock used to wrap ONLY the `zola build` step. That
 * left every earlier write step (data:views, data:generate-content,
 * data:sync-content — all of which rewrite data/generated/views/**) fully
 * unprotected, so two full `npm run build` runs in the same checkout still
 * raced on those and produced the exact same symptom the lock was built to
 * prevent: `load_data: .../clm-19.json doesn't exist` — a transient,
 * mid-regeneration read reported as if it were missing canonical data.
 * Reproduced live: two concurrent `npm run build` runs in one checkout, ~5
 * minutes apart, each hit a different missing-view-model error, and each
 * file existed fine moments later. `.githooks/post-commit` (2026-08-05) made
 * this more likely, not less — it runs a full `npm run build` automatically
 * on every commit to `master`, so two people/agents committing minutes apart
 * in the same checkout now reliably triggers it. Fix: `pipeline.mjs` now
 * acquires this SAME lock for the whole `build` mode (data:views through
 * verify:export) via `acquireLock`/`releaseLock` below, not just the zola
 * step — see pipeline.mjs's `main()` for where.
 *
 * macOS ships no flock(1), so the lock is an atomically-created directory:
 * mkdir is atomic on POSIX and fails if the target exists, which is exactly
 * the primitive needed. A PID file inside lets a stale lock (owner died
 * without cleaning up, e.g. the SIGTERM above) be detected and reclaimed
 * rather than blocking the repo forever.
 *
 * Usage (CLI — wraps a single command's lifetime):
 *   node scripts/build/with-build-lock.mjs <command> [args...]
 *   node scripts/build/with-build-lock.mjs zola build
 *
 * Usage (programmatic — wraps an arbitrary in-process span, see pipeline.mjs):
 *   import { acquireLock, releaseLock } from "./with-build-lock.mjs";
 *   acquireLock(["npm run build (full pipeline)"]);
 *   try { ... } finally { releaseLock(); }
 *
 * Environment:
 *   BUILD_LOCK_TIMEOUT_MS  how long to wait for the lock (default 900000, 15m)
 *   BUILD_LOCK_SKIP=1      bypass entirely; for CI, which builds in a fresh
 *                          isolated checkout where contention cannot occur.
 */
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const LOCK_DIR = path.join(ROOT, ".build-lock");
const PID_FILE = path.join(LOCK_DIR, "owner.json");
const TIMEOUT_MS = Number(process.env.BUILD_LOCK_TIMEOUT_MS ?? 900_000);
const POLL_MS = 1_000;
// A lock older than this whose owner is gone is presumed abandoned.
const STALE_MS = 30 * 60 * 1000;

function processAlive(pid) {
  try {
    // Signal 0 tests for existence without delivering anything.
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM means it exists but belongs to another user — still alive.
    return err.code === "EPERM";
  }
}

function readOwner(pidFile) {
  try {
    return JSON.parse(readFileSync(pidFile, "utf8"));
  } catch {
    return null;
  }
}

// `lockDir` defaults to the real repo lock so every production call site
// (pipeline.mjs, the CLI branch below) keeps working unchanged. Tests pass
// an explicit temp `lockDir` instead — this module always resolves ROOT to
// the actual checkout, so without this override a test would acquire and
// release the SAME `.build-lock` a concurrent real build might be holding,
// which is exactly the kind of collision this module exists to prevent.
export function releaseLock({ lockDir = LOCK_DIR } = {}) {
  try {
    rmSync(lockDir, { recursive: true, force: true });
  } catch {
    /* best effort — a leftover dir is reclaimable as stale */
  }
}

// Acquires the lock (blocking, synchronous) for the calling process. `label`
// is whatever should show up in another waiter's "another build holds the
// lock" message — a command array or a short description string.
// Registers exit/signal handlers so the lock is released even if the caller
// never explicitly calls releaseLock() (process.exit() mid-pipeline, Ctrl-C,
// a supervisor's SIGTERM) — an unreleased lock is how this stops being a fix
// and starts being a bug.
export function acquireLock(label, { lockDir = LOCK_DIR, timeoutMs = TIMEOUT_MS } = {}) {
  if (process.env.BUILD_LOCK_SKIP === "1") return;

  const pidFile = path.join(lockDir, "owner.json");
  const deadline = Date.now() + timeoutMs;
  let announced = false;

  for (;;) {
    try {
      mkdirSync(lockDir); // atomic: throws EEXIST if another build holds it
      // NOTE: startedAt is written for staleness math only. It is not build
      // output and never reaches a generated artifact, so it cannot introduce
      // the kind of per-build churn the metrics manifest deliberately avoids.
      writeFileSync(pidFile, JSON.stringify({ pid: process.pid, startedAt: Date.now(), command: label }));
      break;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    const owner = readOwner(pidFile);
    const ownerGone = owner?.pid ? !processAlive(owner.pid) : true;
    const ageMs = owner?.startedAt ? Date.now() - owner.startedAt : Infinity;

    if (ownerGone || ageMs > STALE_MS) {
      console.error(
        `with-build-lock: reclaiming stale lock (owner pid ${owner?.pid ?? "unknown"} ` +
          `${ownerGone ? "is gone" : `has held it for ${Math.round(ageMs / 60000)}m`}).`,
      );
      releaseLock({ lockDir });
      continue;
    }

    if (!announced) {
      console.error(
        `with-build-lock: another build holds the lock (pid ${owner.pid}: ${
          (Array.isArray(owner.command) ? owner.command.join(" ") : owner.command) || "unknown"
        }). Waiting — concurrent writes to data/generated/ and public/ produce failures that look like data corruption.`,
      );
      announced = true;
    }

    if (Date.now() > deadline) {
      console.error(
        `with-build-lock: timed out after ${Math.round(timeoutMs / 1000)}s waiting for pid ${owner.pid}.\n` +
          `If that process is dead, remove ${path.relative(ROOT, lockDir)} and retry.`,
      );
      throw new LockTimeoutError(`timed out waiting for lock held by pid ${owner.pid}`);
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, POLL_MS);
  }

  let released = false;
  const release = () => {
    if (!released) {
      released = true;
      releaseLock({ lockDir });
    }
  };
  process.on("exit", release);
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      release();
      process.exit(1);
    });
  }
}

export class LockTimeoutError extends Error {}

// --- CLI: wrap a single command's lifetime --------------------------------

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const command = process.argv.slice(2);
  if (command.length === 0) {
    console.error("with-build-lock: usage: node scripts/build/with-build-lock.mjs <command> [args...]");
    process.exit(1);
  }

  function run() {
    const result = spawnSync(command[0], command.slice(1), { stdio: "inherit", cwd: ROOT });
    if (result.error) {
      console.error(`with-build-lock: failed to run ${command[0]}: ${result.error.message}`);
      return 1;
    }
    // Propagate signal deaths as a non-zero exit rather than silently 0.
    if (result.signal) {
      console.error(`with-build-lock: ${command[0]} was killed by ${result.signal}`);
      return 1;
    }
    return result.status ?? 1;
  }

  if (process.env.BUILD_LOCK_SKIP === "1") {
    process.exit(run());
  } else {
    try {
      acquireLock(command);
    } catch (err) {
      if (err instanceof LockTimeoutError) process.exit(1);
      throw err;
    }
    process.exit(run());
  }
}
