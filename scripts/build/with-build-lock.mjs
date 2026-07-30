#!/usr/bin/env node
/*
 * Serialize builds that write to public/.
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
 * macOS ships no flock(1), so the lock is an atomically-created directory:
 * mkdir is atomic on POSIX and fails if the target exists, which is exactly
 * the primitive needed. A PID file inside lets a stale lock (owner died
 * without cleaning up, e.g. the SIGTERM above) be detected and reclaimed
 * rather than blocking the repo forever.
 *
 * Usage:
 *   node scripts/build/with-build-lock.mjs <command> [args...]
 *   node scripts/build/with-build-lock.mjs zola build
 *
 * Environment:
 *   BUILD_LOCK_TIMEOUT_MS  how long to wait for the lock (default 900000, 15m)
 *   BUILD_LOCK_SKIP=1      bypass entirely; for CI, which builds in a fresh
 *                          isolated checkout where contention cannot occur.
 */
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
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

function readOwner() {
  try {
    return JSON.parse(readFileSync(PID_FILE, "utf8"));
  } catch {
    return null;
  }
}

function releaseLock() {
  try {
    rmSync(LOCK_DIR, { recursive: true, force: true });
  } catch {
    /* best effort — a leftover dir is reclaimable as stale */
  }
}

if (process.env.BUILD_LOCK_SKIP === "1") {
  process.exit(run());
}

// --- acquire -------------------------------------------------------------

const deadline = Date.now() + TIMEOUT_MS;
let acquired = false;
let announced = false;

while (!acquired) {
  try {
    mkdirSync(LOCK_DIR); // atomic: throws EEXIST if another build holds it
    // NOTE: startedAt is written for staleness math only. It is not build
    // output and never reaches a generated artifact, so it cannot introduce
    // the kind of per-build churn the metrics manifest deliberately avoids.
    writeFileSync(PID_FILE, JSON.stringify({ pid: process.pid, startedAt: Date.now(), command }));
    acquired = true;
    break;
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  const owner = readOwner();
  const ownerGone = owner?.pid ? !processAlive(owner.pid) : true;
  const ageMs = owner?.startedAt ? Date.now() - owner.startedAt : Infinity;

  if (ownerGone || ageMs > STALE_MS) {
    console.error(
      `with-build-lock: reclaiming stale lock (owner pid ${owner?.pid ?? "unknown"} ` +
        `${ownerGone ? "is gone" : `has held it for ${Math.round(ageMs / 60000)}m`}).`,
    );
    releaseLock();
    continue;
  }

  if (!announced) {
    console.error(
      `with-build-lock: another build holds the lock (pid ${owner.pid}: ${
        (owner.command ?? []).join(" ") || "unknown"
      }). Waiting — concurrent writes to public/ produce failures that look like data corruption.`,
    );
    announced = true;
  }

  if (Date.now() > deadline) {
    console.error(
      `with-build-lock: timed out after ${Math.round(TIMEOUT_MS / 1000)}s waiting for pid ${owner.pid}.\n` +
        `If that process is dead, remove ${path.relative(ROOT, LOCK_DIR)} and retry.`,
    );
    process.exit(1);
  }

  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, POLL_MS);
}

// --- run under the lock --------------------------------------------------

// Release on every exit path, including Ctrl-C and a supervisor's SIGTERM —
// an unreleased lock is how this stops being a fix and starts being a bug.
let released = false;
const release = () => {
  if (!released) {
    released = true;
    releaseLock();
  }
};
process.on("exit", release);
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    release();
    process.exit(1);
  });
}

process.exit(run());
