#!/usr/bin/env node
// Points this checkout's git hooks at .githooks/ so the pre-commit fast
// validators (see .githooks/pre-commit) run automatically. Runs as
// `postinstall` on `npm ci`/`npm install`, and manually via
// `npm run hooks:install`.
//
// Best-effort and silent on failure: this must never break `npm ci` (CI
// runs it too, in a throwaway checkout that never commits) or block
// someone without git available. Fork checkouts get this for free —
// no per-fork setup step required, matching the constitution's
// forkability invariant (docs/constitution/OPEN_INTELLIGENCE_COMMONS.md,
// invariant 4).

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const HOOKS_DIR = path.join(ROOT, ".githooks");

try {
  if (!existsSync(path.join(ROOT, ".git"))) {
    // Not a git checkout (e.g. installed as a dependency, or a tarball
    // extraction) — nothing to configure.
    process.exit(0);
  }
  if (!existsSync(HOOKS_DIR)) {
    process.exit(0);
  }
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  console.log(
    "vomaste.cz: git hooks -> .githooks/ (pre-commit runs the fast validator subset; 'npm run build' is still the real gate before merge/push).",
  );
} catch {
  // Never fail the install because of this — hooks are a convenience,
  // not a requirement, and CI's throwaway checkout doesn't need them.
  process.exit(0);
}
