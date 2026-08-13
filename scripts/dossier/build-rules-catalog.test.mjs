#!/usr/bin/env node
// Regresní testy katalogu pravidel.
//
// Katalog má jediný smysl: publikovaná pravidla se nesmí rozejít s těmi,
// která brána doopravdy vynucuje. Testuje se proto parser (ať se pravidlo
// nemůže ztratit zarovnáním), severita (ERROR vs WARNING není kosmetika)
// a drift gate (odkaz na neexistující pravidlo musí být chyba, ne překlep).
//
// Pinuje se PRAVIDLO, ne dnešní počet: konkrétní čísla se mění s každým
// novým validátorem a test vázaný na ně by za týden hlídal minulost.
//
// Použití: node --test scripts/dossier/build-rules-catalog.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  OWNERS,
  parseRules,
  severityOf,
  buildCatalog,
  findUnknownRuleMentions,
} from "./build-rules-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "build-rules-catalog.mjs");
const ROOT = path.join(__dirname, "..", "..");

test("parser sebere pravidlo bez ohledu na zarovnání sloupce", () => {
  // Hlavičky zarovnávají text, takže širší ID má před sebou méně mezer.
  // Přesně tímhle S10 i S10b jednou z katalogu vypadly.
  const rules = parseRules(
    ["//   S1  jednociferné", "//  S10  dvouciferné", "// S10b  s písmenem"].join("\n"),
  );
  assert.deepEqual(
    rules.map((r) => r.id),
    ["S1", "S10", "S10b"],
  );
});

test("pokračovací řádky se slepí do jednoho textu", () => {
  const [rule] = parseRules(["//   S1  první část", "//       druhá část"].join("\n"));
  assert.equal(rule.text, "první část druhá část");
});

test("běžný komentář se za pravidlo nepovažuje", () => {
  const rules = parseRules(
    ["// Baseline (T-028): tohle není pravidlo", "// S1–S4 a S10; výčet v próze"].join("\n"),
  );
  assert.deepEqual(rules, []);
});

test("severita se čte z hlavičky, ne odhaduje", () => {
  assert.equal(severityOf("něco (ERROR — zrcadlí jiné pravidlo)"), "error");
  assert.equal(severityOf("něco (WARNING)"), "warning");
  assert.equal(severityOf("hlavička severitu neuvádí"), "unspecified");
});

test("každý deklarovaný vlastník doopravdy nese aspoň jedno pravidlo", () => {
  const catalog = buildCatalog(ROOT);
  for (const group of catalog.groups) {
    assert.ok(group.count > 0, `${group.file} nenese žádné pravidlo ${group.namespace}#`);
  }
  assert.equal(catalog.groups.length, OWNERS.length);
});

test("ID pravidla patří svému namespace — cizí prefix se do skupiny nedostane", () => {
  const catalog = buildCatalog(ROOT);
  for (const group of catalog.groups) {
    for (const rule of group.rules) {
      assert.ok(
        rule.id.startsWith(group.namespace),
        `${rule.id} nepatří do skupiny ${group.namespace}`,
      );
    }
  }
});

test("drift gate najde odkaz na pravidlo, které nikdo nevlastní", () => {
  const root = mkdtempSync(path.join(tmpdir(), "rules-"));
  mkdirSync(path.join(root, "content/koncepty"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "Vynucuje to pravidlo S1 a taky pravidlo T99.\n");
  writeFileSync(path.join(root, "content/koncepty/x.md"), "viz (J1) a (R42)\n");

  const unknown = findUnknownRuleMentions(root, new Set(["S1", "J1"]));
  assert.deepEqual(
    unknown.map((u) => u.rule).sort(),
    ["R42", "T99"],
  );
});

test("drift gate mlčí, když všechna citovaná pravidla existují", () => {
  const root = mkdtempSync(path.join(tmpdir(), "rules-"));
  writeFileSync(path.join(root, "README.md"), "pravidlo S1, pravidlo S10b a (T4)\n");
  assert.deepEqual(findUnknownRuleMentions(root, new Set(["S1", "S10b", "T4"])), []);
});

test("reálné repo je konzistentní: --check projde a nic by nepřepsal", () => {
  const out = execFileSync("node", [SCRIPT, "--check"], { stdio: "pipe" }).toString();
  assert.match(out, /\nOK\n?$/);
});
