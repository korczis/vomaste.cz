// Static network-prohibition gate (PHASE_002.md §20.5, §1.5; PHASE_004.md
// §28; PHASE_006.md §18/§20). Phase 2/3 must work completely offline;
// Phase 4's scripts/intake/preflight/ subsystem and Phase 6's GitHub API
// adapter are the deliberate exceptions — and even there, network
// primitives are pinned to exactly three designated transport-adapter
// modules (request-once.mjs, resolve-hostname.mjs,
// github/production-adapter.mjs), never scattered across policy/
// orchestration code. Every other scripts/intake/github/*.mjs module
// (comment lookup, label sync, notification policy, the publish
// orchestrator) takes an injected adapter object and is exercised only
// against the in-memory mock — see mock-github-adapter.mjs. Deliberately
// narrow (exact tokens, not a broad heuristic) to stay maintainable and
// avoid false positives on unrelated words.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const INTAKE_DIR = dirname(fileURLToPath(import.meta.url));
const PREFLIGHT_DIR = join(INTAKE_DIR, "preflight");
const PREFLIGHT_TESTING_DIR = join(PREFLIGHT_DIR, "testing");
const GITHUB_DIR = join(INTAKE_DIR, "github");

// scripts/intake/preflight/testing/* is test-only infra (a local mock
// HTTP server + mock DNS adapter, imported only from *.test.mjs files) —
// exempt from every network-primitive check in this file; never reachable
// from a production entrypoint (confirmed separately, see
// preflight-security-gates.test.mjs). mock-github-adapter.mjs (the
// equivalent test-only infra for the GitHub API surface) contains no
// network primitive at all — pure in-memory state — so it needs no
// allowlist entry here.
const ALLOWED_NETWORK_MODULES = new Set([join(PREFLIGHT_DIR, "request-once.mjs"), join(PREFLIGHT_DIR, "resolve-hostname.mjs"), join(GITHUB_DIR, "production-adapter.mjs")]);

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

test("no module under scripts/intake/ (excluding the three designated transport adapters and all test-only files) contains a network or shell-exec primitive", () => {
  const files = listSourceFiles(INTAKE_DIR).filter((f) => !f.startsWith(PREFLIGHT_TESTING_DIR) && !ALLOWED_NETWORK_MODULES.has(f));
  assert.ok(files.length > 5, "sanity check: expected to find several intake source files");
  const offenders = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const { name, pattern } of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) offenders.push(`${relative(INTAKE_DIR, file)}: ${name}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("network primitives inside scripts/intake/preflight/ exist in exactly the designated transport-adapter modules, nowhere else", () => {
  const preflightFiles = listSourceFiles(PREFLIGHT_DIR).filter((f) => !f.startsWith(PREFLIGHT_TESTING_DIR));
  const offenders = [];
  for (const file of preflightFiles) {
    if (ALLOWED_NETWORK_MODULES.has(file)) continue;
    const content = readFileSync(file, "utf8");
    for (const { name, pattern } of FORBIDDEN_PATTERNS) {
      if (pattern.test(content)) offenders.push(`${relative(INTAKE_DIR, file)}: ${name}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("the designated transport-adapter modules actually exist and actually do use the network primitives they're allow-listed for (the allowlist isn't vacuous)", () => {
  const requestOnce = readFileSync(join(PREFLIGHT_DIR, "request-once.mjs"), "utf8");
  const resolveHostname = readFileSync(join(PREFLIGHT_DIR, "resolve-hostname.mjs"), "utf8");
  const productionAdapter = readFileSync(join(GITHUB_DIR, "production-adapter.mjs"), "utf8");
  assert.match(requestOnce, /from\s+["']node:https?["']/);
  assert.match(resolveHostname, /from\s+["']node:dns/);
  assert.match(productionAdapter, /\bfetch\s*\(/);
});

test("process-issue.mjs's git commit lookup uses execFileSync with a fixed argv array, not a shell string", () => {
  const content = readFileSync(join(INTAKE_DIR, "process-issue.mjs"), "utf8");
  assert.match(content, /execFileSync\("git",\s*\["rev-parse",\s*"HEAD"\]/);
  // No template-literal command interpolation anywhere near a shell call.
  assert.doesNotMatch(content, /exec\(`/);
});
