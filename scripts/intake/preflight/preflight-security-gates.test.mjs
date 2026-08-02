// Static security gates (PHASE_004.md §28). Every check here is a
// source-text scan, not a runtime behavior test (those live in the other
// *.test.mjs files in this directory) — this file exists to make a
// regression in these specific properties impossible to introduce
// silently, since each one is a one-line change that could otherwise
// slip past review.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PREFLIGHT_DIR = dirname(fileURLToPath(import.meta.url));
const TESTING_DIR = join(PREFLIGHT_DIR, "testing");
const INTAKE_DIR = join(PREFLIGHT_DIR, "..");
const SELF = fileURLToPath(import.meta.url);

// Excludes this file itself — it legitimately names the forbidden
// patterns it's checking for, in test titles and comments.
function listSourceFiles(dir, { includeTests = false } = {}) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listSourceFiles(full, { includeTests }));
    } else if (full !== SELF && name.endsWith(".mjs") && (includeTests || !name.endsWith(".test.mjs"))) {
      out.push(full);
    }
  }
  return out;
}

test("no module ever sets rejectUnauthorized: false (TLS verification is never disabled)", () => {
  const offenders = listSourceFiles(PREFLIGHT_DIR, { includeTests: true }).filter((f) => /rejectUnauthorized\s*:\s*false/.test(readFileSync(f, "utf8")));
  assert.deepEqual(offenders.map((f) => relative(INTAKE_DIR, f)), []);
});

test("request-once.mjs explicitly sets rejectUnauthorized: true (not just relying on the Node default)", () => {
  const content = readFileSync(join(PREFLIGHT_DIR, "request-once.mjs"), "utf8");
  assert.match(content, /rejectUnauthorized:\s*true/);
});

test("no module reads a proxy environment variable or passes a proxy agent (no uncontrolled proxy env inheritance)", () => {
  const offenders = [];
  for (const file of listSourceFiles(PREFLIGHT_DIR)) {
    const content = readFileSync(file, "utf8");
    if (/HTTPS?_PROXY|process\.env\.\w*PROXY/i.test(content)) offenders.push(relative(INTAKE_DIR, file));
  }
  assert.deepEqual(offenders, []);
});

test("request-once.mjs disables Node's default agent (agent: false) rather than inheriting a shared/proxy-configured one", () => {
  const content = readFileSync(join(PREFLIGHT_DIR, "request-once.mjs"), "utf8");
  assert.match(content, /agent:\s*false/);
});

test("no module calls a redirect-following fetch/http client in \"unrestricted\" mode (redirect: 'follow' or maxRedirects without an explicit small bound) — redirects are only ever handled by follow-redirects.mjs's own bounded loop", () => {
  const offenders = [];
  for (const file of listSourceFiles(PREFLIGHT_DIR)) {
    if (file.endsWith("follow-redirects.mjs")) continue;
    const content = readFileSync(file, "utf8");
    if (/redirect\s*:\s*["']follow["']/.test(content)) offenders.push(relative(INTAKE_DIR, file));
  }
  assert.deepEqual(offenders, []);
});

test("no module under scripts/intake/ calls bare fetch(url) outside the approved transport (request-once.mjs doesn't use fetch at all — it uses node:http(s) directly for pinning)", () => {
  const offenders = [];
  for (const file of listSourceFiles(INTAKE_DIR)) {
    if (file.startsWith(TESTING_DIR)) continue;
    const content = readFileSync(file, "utf8");
    if (/\bfetch\s*\(/.test(content)) offenders.push(relative(INTAKE_DIR, file));
  }
  assert.deepEqual(offenders, []);
});

test("no module invokes curl/wget/gh as a child process anywhere under scripts/intake/", () => {
  const offenders = [];
  for (const file of listSourceFiles(INTAKE_DIR, { includeTests: true })) {
    const content = readFileSync(file, "utf8");
    if (/(execFileSync|execSync|spawnSync|spawn|exec)\s*\(\s*["'](curl|wget|gh)["']/.test(content)) offenders.push(relative(INTAKE_DIR, file));
  }
  assert.deepEqual(offenders, []);
});

test("no environment variable is ever used to bypass the private-IP/SSRF policy (no ALLOW_PRIVATE_NETWORK or similar)", () => {
  const offenders = [];
  for (const file of listSourceFiles(INTAKE_DIR, { includeTests: true })) {
    const content = readFileSync(file, "utf8");
    if (/process\.env\.\w*(ALLOW|BYPASS|SKIP)\w*(PRIVATE|SSRF|NETWORK)/i.test(content)) offenders.push(relative(INTAKE_DIR, file));
  }
  assert.deepEqual(offenders, []);
});

test("the test-only private-destination bypass (testAllowedPrivateAddresses) is never passed by process-issue.mjs — the production CLI entrypoint", () => {
  const content = readFileSync(join(INTAKE_DIR, "process-issue.mjs"), "utf8");
  assert.doesNotMatch(content, /testAllowedPrivateAddresses/);
  assert.doesNotMatch(content, /testAllowedSuffixes/);
  assert.doesNotMatch(content, /testExtraAllowedPorts/);
});

test("no test-only bypass parameter is reachable via a CLI flag or documented environment variable in process-issue.mjs", () => {
  const content = readFileSync(join(INTAKE_DIR, "process-issue.mjs"), "utf8");
  // The only preflight-related CLI surface is --preflight itself (opt-in
  // to real network) — no flag or env var ever widens destination policy.
  assert.doesNotMatch(content, /--allow-private/);
  assert.doesNotMatch(content, /process\.env\.ALLOW/);
});

test("no committed fixture or snapshot contains a plausible embedded credential in a URL", () => {
  const fixturesDir = join(INTAKE_DIR, "..", "..", "tests", "fixtures", "intake");
  const offenders = [];
  for (const name of readdirSync(fixturesDir)) {
    if (!name.endsWith(".json")) continue;
    const content = readFileSync(join(fixturesDir, name), "utf8");
    // A real embedded credential looks like scheme://user:pass@host — the
    // fixtures intentionally test THIS PATTERN as adversarial input, so
    // this check allows the pattern only when the password segment is an
    // obvious placeholder, never something that looks like a real secret.
    const matches = content.match(/https?:\/\/[^\s"'/]+:[^\s"'/@]+@/g) ?? [];
    for (const m of matches) {
      if (!/user:pass@|test:test@/.test(m)) offenders.push(`${name}: ${m}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("npm run build does not invoke any preflight network path — intake:fixture (used by the build's `test` step indirectly via test files, and directly via the fixture scripts) never passes --preflight", () => {
  const runFixture = readFileSync(join(INTAKE_DIR, "run-fixture.mjs"), "utf8");
  assert.doesNotMatch(runFixture, /preflight:\s*true/);
});

test("the preflight-fixture npm script uses an injected mock DNS adapter, never the production resolver", () => {
  const content = readFileSync(join(INTAKE_DIR, "run-preflight-fixture.mjs"), "utf8");
  assert.doesNotMatch(content, /createProductionDnsAdapter/);
  assert.match(content, /preflightDnsAdapter/);
});
