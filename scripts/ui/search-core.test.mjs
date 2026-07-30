#!/usr/bin/env node
// Regression tests for the command-bar search core (coop task T-020,
// assets/js/modules/search-core.js). Load-bearing behaviors: Czech
// diacritics-insensitive matching, ID-first ranking, stable group order,
// AND token semantics, per-group caps, and highlight offsets that stay
// correct on accented text (rendered via x-text spans, never x-html).
//
// Usage: node --test scripts/ui/search-core.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { normalize, searchRecords, highlight, GROUPS } = await import(
  path.join(__dirname, "..", "..", "assets", "js", "modules", "search-core.js")
);

const FIXTURE = [
  { id: "boris-stastny", type: "dossier", dossier: null, title: "Boris Šťastný", summary: "ministr pro sport", extra: "", route: "/dossiers/boris-stastny/" },
  { id: "stastny", type: "entity", dossier: null, title: "Boris Šťastný (ministr)", summary: "person", extra: "subject", route: "/entities/stastny/" },
  { id: "CLM-01", type: "claim", dossier: "boris-stastny", title: "Šťastný zastává funkci ministra", summary: "Šťastný zastává funkci ministra", extra: "", route: "/dossiers/boris-stastny/claims/clm-01/" },
  { id: "CLM-14", type: "claim", dossier: "macinka-turek", title: "Jiné tvrzení o vydavateli Echo24", summary: "Jiné tvrzení o vydavateli Echo24", extra: "", route: "/dossiers/macinka-turek/claims/clm-14/" },
  { id: "SRC-01", type: "source", dossier: "boris-stastny", title: "Vláda ČR (oficiální profil)", summary: "oficiální primární zdroj", extra: "Vláda České republiky (vlada.gov.cz)", route: "/dossiers/boris-stastny/sources/src-01/" },
  { id: "GAP-01", type: "gap", dossier: "boris-stastny", title: "Otevřená mezera", summary: "mezera", extra: "", route: "/dossiers/boris-stastny/gaps/gap-01/" },
];

test("diacritics-insensitive: 'stastny' finds Šťastný records", () => {
  const { flat } = searchRecords(FIXTURE, "stastny");
  assert.ok(flat.length >= 3, `expected ≥3 hits, got ${flat.length}`);
  assert.ok(flat.some((r) => r.title === "Boris Šťastný"));
});

test("normalize strips Czech diacritics without changing length", () => {
  assert.equal(normalize("Šťastný"), "stastny");
  assert.equal(normalize("Bednárik"), "bednarik");
  assert.equal(normalize("Šťastný").length, "Šťastný".length);
});

test("ID query ranks the ID match first and is case-insensitive", () => {
  const { flat } = searchRecords(FIXTURE, "clm-01");
  assert.equal(flat[0].id, "CLM-01");
});

test("groups keep the canonical order (dossier before entity before claim …)", () => {
  const { groups } = searchRecords(FIXTURE, "stastny");
  const order = groups.map((g) => g.type);
  const canonical = GROUPS.map(([t]) => t).filter((t) => order.includes(t));
  assert.deepEqual(order, canonical);
});

test("multi-token query uses AND semantics across fields", () => {
  const { flat } = searchRecords(FIXTURE, "vydavatel echo24");
  assert.equal(flat.length, 1);
  assert.equal(flat[0].id, "CLM-14");
  assert.equal(searchRecords(FIXTURE, "vydavatel neexistuje").flat.length, 0);
});

test("per-group cap limits items but total reports every match", () => {
  const many = Array.from({ length: 9 }, (_, i) => ({
    id: `CLM-${String(i + 1).padStart(2, "0")}`, type: "claim", dossier: "d",
    title: `Opakované tvrzení ${i}`, summary: "opakované", extra: "", route: `/x/${i}/`,
  }));
  const { groups, total } = searchRecords(many, "opakované", { perGroup: 5 });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].items.length, 5);
  assert.equal(total, 9);
});

test("highlight offsets survive accented text", () => {
  const h = highlight("Boris Šťastný", "stastny");
  assert.equal(h.before, "Boris ");
  assert.equal(h.match, "Šťastný");
  assert.equal(h.after, "");
});

test("empty query returns nothing and flat indexes are sequential", () => {
  assert.equal(searchRecords(FIXTURE, "   ").flat.length, 0);
  const { flat } = searchRecords(FIXTURE, "stastny");
  flat.forEach((r, i) => assert.equal(r.flatIndex, i));
});
