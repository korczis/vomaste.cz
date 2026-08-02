#!/usr/bin/env node
// Unit testy pro scripts/dossier/lib/authorization-log.mjs — jediného
// vlastníka parsování append-only autorizačního logu a hash-kotvy.
// Kryjí nálezy auditu T-042:
//   B-2: rozpoznání VŠECH reálných tvarů nadpisů záznamů + fail-closed
//        na neznámý tvar (nikdy tiché ignorování),
//   B-3: cross-check data/authorizations.toml ↔ ukotvený log záznam.
// Navrch drží stráž nad SKUTEČNÝM AGENTS.md tohoto repa: musí být strict
// parsovatelný a každý TOML záznam musí být ukotvený — když někdo přidá
// nadpis nového tvaru do logu, tenhle test zčervená dřív než build.
//
// Usage: node --test scripts/dossier/authorization-log.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractLogEntries,
  hashEntryBlock,
  isEntryHeading,
  crossCheckTomlRecords,
  loadAnchor,
  LOG_SECTION_HEADING,
} from "./lib/authorization-log.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const FIXTURE = `# doc

### Doc heading before the log

## Content about real parties

### Authorized subject: Alice (on the record)

Body A.

### Scope extension, 2026-01-01: more

Body B.

## Later unrelated section

### Rozšíření rozsahu, 2026-01-02: česky

Body C.

### Authorized subjects, 2026-01-03: plural

Body D.

### Structural change, 2026-01-04: struct

Body E.

### Not authorized: Mallory (on the record)

Body F.
`;

test("recognizes every real-world entry heading shape (B-2)", () => {
  for (const h of [
    "### Authorized subject: Petr Pavel (on the record)",
    "### Authorized subjects, 2026-07-30: five further members of the government (on the record)",
    "### Scope extension, 2026-07-21: broader political profile",
    "### Rozšíření rozsahu, 2026-07-30: finanční a majetková vrstva",
    "### Structural change, 2026-07-29 (second): full physical decoupling of the entity dossiers",
    "### Not authorized: Radovan Krejčíř (on the record)",
  ]) {
    assert.equal(isEntryHeading(h), true, `měl být rozpoznán: ${h}`);
  }
  assert.equal(isEntryHeading("### Templates"), false);
});

test("extracts all six fixture entries; doc heading before the log is ignored", () => {
  const { entries, problems } = extractLogEntries(FIXTURE);
  assert.deepEqual(problems, []);
  assert.equal(entries.size, 6);
  assert.equal(
    entries.get("### Authorized subject: Alice (on the record)"),
    "### Authorized subject: Alice (on the record)\n\nBody A.",
  );
  // záznam za pozdější ## sekcí se také najde (log není souvislý region)
  assert.ok(entries.has("### Not authorized: Mallory (on the record)"));
});

test("fails closed on an unknown ### heading shape inside the log territory (B-2)", () => {
  const { problems } = extractLogEntries(`${FIXTURE}\n### Brand new shape, 2026-02-01\n\nX.\n`);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /neznámý tvar nadpisu/);
});

test("reports a duplicate entry heading instead of silently overwriting", () => {
  const dup = `${FIXTURE}\n### Authorized subject: Alice (on the record)\n\nSecond block same heading.\n`;
  const { problems } = extractLogEntries(dup);
  assert.equal(problems.filter((p) => p.includes("duplicitní")).length, 1);
});

test("reports a missing log section instead of returning an empty success", () => {
  const { problems } = extractLogEntries("# nothing here\n");
  assert.equal(problems.length, 1);
  assert.match(problems[0], new RegExp(LOG_SECTION_HEADING));
});

test("hash is stable across CRLF and trailing-whitespace noise, sensitive to content", () => {
  const a = "### Authorized subject: Alice (on the record)\n\nBody A.";
  assert.equal(hashEntryBlock(a), hashEntryBlock(`${a}\n`));
  assert.equal(hashEntryBlock(a), hashEntryBlock(a.replace(/\n/g, "\r\n")));
  assert.notEqual(hashEntryBlock(a), hashEntryBlock(a.replace("Body A.", "Body A!")));
});

// --- B-3 cross-check TOML ↔ ukotvený log ---

function fixtureAnchor(entries, omitHeadings = []) {
  return {
    entries: [...entries]
      .filter(([heading]) => !omitHeadings.includes(heading))
      .map(([heading, block]) => ({ heading, sha256: hashEntryBlock(block) })),
  };
}

test("cross-check passes for a TOML record whose section exists and is anchored", () => {
  const { entries } = extractLogEntries(FIXTURE);
  const errors = crossCheckTomlRecords(
    [{ id: "AUTH-X", agentsMdSection: "Authorized subject: Alice (on the record)" }],
    entries,
    fixtureAnchor(entries),
  );
  assert.deepEqual(errors, []);
});

test("cross-check fails for a TOML record without agents_md_section", () => {
  const { entries } = extractLogEntries(FIXTURE);
  const errors = crossCheckTomlRecords([{ id: "AUTH-X", agentsMdSection: null }], entries, fixtureAnchor(entries));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /agents_md_section/);
});

test("cross-check fails for a TOML record with no matching log entry (B-3: hand-added TOML block)", () => {
  const { entries } = extractLogEntries(FIXTURE);
  const errors = crossCheckTomlRecords(
    [{ id: "AUTH-FAKE", agentsMdSection: "Authorized subject: Eve (on the record)" }],
    entries,
    fixtureAnchor(entries),
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /neodpovídá žádnému záznamu logu/);
});

test("cross-check fails for a log entry that exists but is not anchored (fail-closed on new records)", () => {
  const { entries } = extractLogEntries(FIXTURE);
  const heading = "### Authorized subject: Alice (on the record)";
  const errors = crossCheckTomlRecords(
    [{ id: "AUTH-X", agentsMdSection: "Authorized subject: Alice (on the record)" }],
    entries,
    fixtureAnchor(entries, [heading]),
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /authorization:anchor/);
});

// --- stráž nad skutečným repem ---

test("real AGENTS.md parses strictly: every ### in the log territory is a recognized entry", () => {
  const text = readFileSync(path.join(ROOT, "AGENTS.md"), "utf8");
  const { entries, problems } = extractLogEntries(text);
  assert.deepEqual(problems, [], `AGENTS.md log parse problems:\n${problems.join("\n")}`);
  // audit T-042: 26 záznamů (22 grantů + 3 strukturální + 1 zamítnutí);
  // log je append-only, počet smí jen růst
  assert.ok(entries.size >= 26, `čekáno ≥ 26 záznamů, nalezeno ${entries.size}`);
});

test("real authorizations.toml: every record maps to an anchored AGENTS.md log entry (B-3)", () => {
  const text = readFileSync(path.join(ROOT, "AGENTS.md"), "utf8");
  const { entries } = extractLogEntries(text);
  const anchor = loadAnchor(ROOT);
  assert.ok(anchor, "data/authorizations-log-anchor.json musí existovat");
  const toml = readFileSync(path.join(ROOT, "data/authorizations.toml"), "utf8");
  const records = [...toml.matchAll(/\[\[authorizations\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)].map((m) => ({
    id: m[1].match(/^id\s*=\s*"([^"]*)"/m)?.[1] ?? "<missing id>",
    agentsMdSection: m[1].match(/^agents_md_section\s*=\s*"((?:[^"\\]|\\.)*)"/m)?.[1]?.replace(/\\(.)/g, "$1") ?? null,
  }));
  assert.ok(records.length >= 22, `čekáno ≥ 22 TOML záznamů, nalezeno ${records.length}`);
  const errors = crossCheckTomlRecords(records, entries, anchor);
  assert.deepEqual(errors, [], errors.join("\n"));
});
