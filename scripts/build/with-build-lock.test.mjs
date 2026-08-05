// Testy acquireLock/releaseLock (scripts/build/with-build-lock.mjs).
//
// Přidáno 2026-08-06 po reálném nálezu ve stejné session (viz komentář
// „2026-08-06 widened" v with-build-lock.mjs): dva plné `npm run build`
// běhy ve stejném checkoutu se přetahovaly o data/generated/, protože
// zámek dřív chránil jen krok zola build. Oprava (zamykat celý `build`
// režim) byla ověřená jen ručně, živě, proti skutečnému checkoutu — tenhle
// soubor jí dává automatizovaný regresní test, aby příští refaktor
// zámku nerozbil právě to chování, které ho opravilo.
//
// Každý test běží proti VLASTNÍMU dočasnému `lockDir` (mkdtempSync), nikdy
// proti reálnému `<repo>/.build-lock` — ten může mezitím legitimně držet
// souběžný skutečný build (v tomhle repu se to prokazatelně děje, viz výše)
// a test by na něj nesměl sahat ani ho blokovat.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { acquireLock, releaseLock, LockTimeoutError } from "./with-build-lock.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const HOLDER = join(__dirname, "with-build-lock.holder-fixture.mjs");

// Returns { lockDir, cleanup() }. `cleanup` removes the whole temp parent
// (not just lockDir — releaseLock only ever touches lockDir itself, so the
// mkdtemp parent needs its own teardown or every test run leaks a tmp dir).
function tempLock() {
  const parent = mkdtempSync(join(tmpdir(), "build-lock-test-"));
  return { lockDir: join(parent, ".build-lock"), cleanup: () => rmSync(parent, { recursive: true, force: true }) };
}

test("acquireLock creates the lock dir with an owner file; releaseLock removes it", () => {
  const { lockDir, cleanup } = tempLock();
  try {
    assert.equal(existsSync(lockDir), false);
    acquireLock(["test command"], { lockDir });
    assert.equal(existsSync(lockDir), true);
    const owner = JSON.parse(readFileSync(join(lockDir, "owner.json"), "utf8"));
    assert.equal(owner.pid, process.pid);
    assert.deepEqual(owner.command, ["test command"]);
    assert.equal(typeof owner.startedAt, "number");
    releaseLock({ lockDir });
    assert.equal(existsSync(lockDir), false, "releaseLock must remove the directory");
  } finally {
    cleanup();
  }
});

test("releaseLock on an already-absent lockDir is a silent no-op, not a throw", () => {
  const { lockDir, cleanup } = tempLock(); // never acquired
  try {
    assert.doesNotThrow(() => releaseLock({ lockDir }));
  } finally {
    cleanup();
  }
});

test("acquireLock reclaims a lock whose owner process is dead, instead of waiting", () => {
  const { lockDir, cleanup } = tempLock();
  try {
    mkdirSync(lockDir, { recursive: true });
    // A PID guaranteed not to exist: spawn a short-lived child, let it exit,
    // then use its now-free pid — processAlive() will correctly say "gone".
    const dead = spawnSync(process.execPath, ["-e", "process.exit(0)"]);
    writeFileSync(
      join(lockDir, "owner.json"),
      JSON.stringify({ pid: dead.pid, startedAt: Date.now(), command: ["stale owner"] }),
    );

    const startedAt = Date.now();
    acquireLock(["new owner"], { lockDir, timeoutMs: 5_000 });
    const elapsedMs = Date.now() - startedAt;

    const owner = JSON.parse(readFileSync(join(lockDir, "owner.json"), "utf8"));
    assert.equal(owner.pid, process.pid, "the new owner must have overwritten the stale one");
    assert.ok(elapsedMs < 3_000, `reclaiming a dead owner's lock should be near-instant, took ${elapsedMs}ms`);
    releaseLock({ lockDir });
  } finally {
    cleanup();
  }
});

test("acquireLock blocks while a live, separate-process owner holds the lock, then acquires once it releases", async () => {
  const { lockDir, cleanup } = tempLock();
  const holdMs = 1_200;
  try {
    const holder = spawn(process.execPath, [HOLDER, lockDir, String(holdMs)], { stdio: ["ignore", "pipe", "inherit"] });
    // Wait for the holder's own "HELD" stdout line rather than a fixed
    // sleep — proves the assertion below waited on the LOCK, not on luck.
    await new Promise((resolve, reject) => {
      let out = "";
      holder.stdout.on("data", (chunk) => {
        out += chunk;
        if (out.includes("HELD")) resolve();
      });
      holder.on("error", reject);
      holder.on("exit", (code) => {
        if (!out.includes("HELD")) reject(new Error(`holder exited (code ${code}) before reporting HELD`));
      });
    });

    const startedAt = Date.now();
    acquireLock(["waiter"], { lockDir, timeoutMs: 10_000 });
    const elapsedMs = Date.now() - startedAt;

    // We only started waiting after HELD, so elapsed must be well under
    // holdMs from the holder's own start — but still substantial, proving
    // this call genuinely blocked instead of racing straight past a
    // half-written lock dir.
    assert.ok(elapsedMs > 200, `acquireLock returned in ${elapsedMs}ms — did it wait for the holder at all?`);

    const owner = JSON.parse(readFileSync(join(lockDir, "owner.json"), "utf8"));
    assert.equal(owner.pid, process.pid, "this process must be the new owner after the holder released");
    releaseLock({ lockDir });

    await new Promise((resolve) => holder.on("exit", resolve)).catch(() => {});
  } finally {
    cleanup();
  }
});

test("acquireLock throws LockTimeoutError, never hangs silently, when the owner never releases in time", () => {
  const { lockDir, cleanup } = tempLock();
  try {
    mkdirSync(lockDir, { recursive: true });
    writeFileSync(
      join(lockDir, "owner.json"),
      JSON.stringify({ pid: process.pid, startedAt: Date.now(), command: ["self — permanently alive"] }),
    );
    assert.throws(() => acquireLock(["waiter"], { lockDir, timeoutMs: 1_200 }), LockTimeoutError);
    releaseLock({ lockDir });
  } finally {
    cleanup();
  }
});

test("BUILD_LOCK_SKIP=1 bypasses acquisition entirely (CI's fresh, isolated checkout)", () => {
  const { lockDir, cleanup } = tempLock();
  const prev = process.env.BUILD_LOCK_SKIP;
  process.env.BUILD_LOCK_SKIP = "1";
  try {
    acquireLock(["skip me"], { lockDir });
    assert.equal(existsSync(lockDir), false, "a skipped acquire must not create the lock dir");
  } finally {
    if (prev === undefined) delete process.env.BUILD_LOCK_SKIP;
    else process.env.BUILD_LOCK_SKIP = prev;
    cleanup();
  }
});
