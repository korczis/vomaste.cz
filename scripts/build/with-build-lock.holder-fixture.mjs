#!/usr/bin/env node
// Test helper for with-build-lock.test.mjs, NOT a test itself (no .test.mjs
// suffix — the npm run test glob would otherwise try to run it standalone
// and fail on missing argv). Acquires the lock at argv[2] for argv[3] ms,
// then exits — release happens via acquireLock's own exit-hook, exactly
// like a real build would release it.
//
// This has to be a separate OS process, not a same-process second
// acquireLock() call: the wait loop blocks on a synchronous Atomics.wait,
// so a single JS thread can never simultaneously hold the lock and wait
// for itself to release it. Cross-process is the only way to exercise the
// actual mutual-exclusion path this module exists for.
import { acquireLock } from "./with-build-lock.mjs";

const [, , lockDir, holdMs] = process.argv;
if (!lockDir || !holdMs) {
  console.error("usage: with-build-lock.test.hold-lock.mjs <lockDir> <holdMs>");
  process.exit(2);
}

acquireLock(["test holder"], { lockDir });
console.log("HELD"); // signals the parent test that acquisition succeeded
setTimeout(() => process.exit(0), Number(holdMs));
