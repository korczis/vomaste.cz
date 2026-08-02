#!/usr/bin/env node
// Scans a workflow output directory before upload (PHASE_006.md §23) —
// the last gate between the local intake pipeline's output and a public
// GitHub Actions artifact. Deliberately pattern-based, not a full secret
// scanner: it checks for the specific things this pipeline could
// plausibly ever produce (a GitHub token pattern, an Authorization
// header, URL credentials, a private-key/bearer-token blob, an
// unexpected filename) — not a general-purpose tool.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_FILENAMES = new Set(["manifest.json", "report.md", "processing-result.json", "diagnostics.json", "_status.json"]);

const PATTERNS = [
  { name: "github_token", pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/ },
  { name: "github_fine_grained_pat", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "authorization_header", pattern: /\bAuthorization:\s*(Bearer|Basic|token)\s+\S+/i },
  { name: "bearer_token_field", pattern: /"(access_token|bearer_token|api_key|secret)"\s*:\s*"[^"]{8,}"/i },
  { name: "url_credentials", pattern: /https?:\/\/[^\/\s:@]+:[^\/\s:@]+@/ },
  { name: "private_key_block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "env_dump_marker", pattern: /^GITHUB_TOKEN=/m },
];

function listFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

// Returns { safe: boolean, findings: [{file, issue}] }. Never throws for
// content issues — only for a genuinely unreadable directory, which the
// caller should treat as a hard failure (can't upload what it can't
// verify).
export function validateArtifactSafety(dir) {
  const files = listFiles(dir);
  const findings = [];

  for (const file of files) {
    const rel = file.slice(dir.length + 1);
    const base = rel.split("/").pop();
    if (!EXPECTED_FILENAMES.has(base)) {
      findings.push({ file: rel, issue: `unexpected file (not one of: ${[...EXPECTED_FILENAMES].join(", ")})` });
      continue;
    }
    if (![".json", ".md"].includes(extname(base))) {
      findings.push({ file: rel, issue: "unexpected file extension" });
      continue;
    }
    const content = readFileSync(file, "utf8");
    for (const { name, pattern } of PATTERNS) {
      if (pattern.test(content)) findings.push({ file: rel, issue: name });
    }
  }

  return { safe: findings.length === 0, findings };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: node scripts/intake/validate-artifact-safety.mjs <output-dir>");
    process.exit(2);
  }
  const { safe, findings } = validateArtifactSafety(dir);
  if (!safe) {
    console.log(`${findings.length} finding(s):`);
    for (const f of findings) console.log(`  UNSAFE ${f.file}: ${f.issue}`);
    process.exit(1);
  }
  console.log(`OK — artifact directory ${dir} is safe to upload.`);
}
