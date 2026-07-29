#!/usr/bin/env node
// Mechanically enforces AGENTS.md's most safety-critical rule: the
// "Content about real parties" authorization log is append-only. Every
// existing dated subsection (### heading) must survive byte-identically;
// only new subsections may be added. Until now this was prose-only
// ("never edit or remove an existing entry") — trusted to be followed,
// never checked. Per the project's own constitution (invariant 8: "a
// policy nothing enforces doesn't count as implemented"), that's a gap.
//
// Entries are identified by heading text, not by nesting under the
// "## Content about real parties" parent: later sections (the
// constitution summary, the co-op protocol) were inserted between
// existing entries and the file's end, so newer entries were correctly
// appended at end-of-file rather than end-of-section and now sit after
// unrelated "##" headings. Matching by heading prefix is what's actually
// robust here, not tree position.
//
// Usage: node scripts/dossier/verify-authorization-log-append-only.mjs
// Exit 0 = every previously-committed entry is intact; exit 1 = a prior
// entry was edited or removed.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const FILE = "AGENTS.md";

const ENTRY_HEADING = /^### (Authorized subject|Scope extension|Structural change)\b.*$/;

function extractEntries(text) {
  const lines = text.split("\n");
  const entries = new Map(); // heading line -> full block text
  let current = null;
  let buf = [];
  for (const line of lines) {
    if (ENTRY_HEADING.test(line)) {
      if (current !== null) entries.set(current, buf.join("\n").trimEnd());
      current = line;
      buf = [line];
      continue;
    }
    if (current !== null) {
      if (/^#{1,3} /.test(line)) {
        // next heading of any level closes the current entry's block
        entries.set(current, buf.join("\n").trimEnd());
        current = null;
        buf = [];
      } else {
        buf.push(line);
      }
    }
  }
  if (current !== null) entries.set(current, buf.join("\n").trimEnd());
  return entries;
}

function readOldVersion() {
  try {
    return execFileSync("git", ["show", `HEAD:${FILE}`], {
      cwd: ROOT,
      encoding: "utf8",
    });
  } catch {
    // No prior commit of AGENTS.md (e.g. very first commit ever) —
    // nothing to compare against.
    return null;
  }
}

const oldText = readOldVersion();
if (oldText === null) {
  console.log(
    "verify:authorization-log — no prior committed AGENTS.md to compare against, skipping.",
  );
  process.exit(0);
}

const newText = readFileSync(path.join(ROOT, FILE), "utf8");
const oldEntries = extractEntries(oldText);
const newEntries = extractEntries(newText);

const problems = [];
for (const [heading, oldBlock] of oldEntries) {
  if (!newEntries.has(heading)) {
    problems.push(`removed entirely: "${heading.replace(/^### /, "")}"`);
    continue;
  }
  if (newEntries.get(heading) !== oldBlock) {
    problems.push(`modified: "${heading.replace(/^### /, "")}"`);
  }
}

if (problems.length > 0) {
  console.error(
    `verify:authorization-log — ${FILE}'s append-only authorization log has ${problems.length} violation(s):\n`,
  );
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    "\nExisting dated entries under \"Content about real parties\" must never be edited or removed — only new dated subsections may be added. If this is a genuine, owner-approved correction (e.g. fixing a typo the owner explicitly asked to fix), get it on the record from the owner first, then note it here as a deliberate exception.",
  );
  process.exit(1);
}

console.log(
  `verify:authorization-log — OK (${oldEntries.size} prior entr${oldEntries.size === 1 ? "y" : "ies"} intact${newEntries.size > oldEntries.size ? `, ${newEntries.size - oldEntries.size} new` : ""}).`,
);
