// Static network-prohibition gate (PHASE_002.md §20.5, §1.5). Phase 2 must
// work completely offline — this scans every non-test module under
// scripts/intake/ for the specific primitives that would give it network
// or shell-out access, and fails the build if any appear. Deliberately
// narrow (exact tokens, not a broad heuristic) to stay maintainable and
// avoid false positives on unrelated words.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const INTAKE_DIR = dirname(fileURLToPath(import.meta.url));

const FORBIDDEN_PATTERNS = [
  { name: "fetch(", pattern: /\bfetch\s*\(/ },
  { name: "http.request", pattern: /\bhttp\.request\b/ },
  { name: "https.request", pattern: /\bhttps\.request\b/ },
  { name: "node:http import", pattern: /from\s+["']node:https?["']/ },
  { name: "node:dns import", pattern: /from\s+["']node:dns/ },
  { name: "child_process exec of curl/wget/gh", pattern: /\b(curl|wget|\bgh\b)\b.*(execSync|exec\(|spawn\()/ },
  { name: "execFileSync/execSync/spawn invoking curl/wget/gh", pattern: /(execFileSync|execSync|spawnSync|spawn)\s*\(\s*["'](curl|wget|gh)["']/ },
];

function listSourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (name.endsWith(".mjs") && !name.endsWith(".test.mjs")) {
      out.push(full);
    }
  }
  return out;
}

test("no module under scripts/intake/ (excluding tests) contains a network or shell-exec primitive", () => {
  const files = listSourceFiles(INTAKE_DIR);
  assert.ok(files.length > 5, "sanity check: expected to find several intake source files");
  const offenders = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const { name, pattern } of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) offenders.push(`${file}: ${name}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("process-issue.mjs's git commit lookup uses execFileSync with a fixed argv array, not a shell string", () => {
  const content = readFileSync(join(INTAKE_DIR, "process-issue.mjs"), "utf8");
  assert.match(content, /execFileSync\("git",\s*\["rev-parse",\s*"HEAD"\]/);
  // No template-literal command interpolation anywhere near a shell call.
  assert.doesNotMatch(content, /exec\(`/);
});
