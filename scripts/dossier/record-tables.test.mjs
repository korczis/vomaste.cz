// Regression testy projekce record-tables (T-028 fáze G): řádky
// projektované z compiled kanonického modelu musí mít PŘESNĚ tvar,
// který měl dřívější front-matter parser — konzumenti (build-data-exports,
// build-jsonld-exports, validate-schemas, verify-jsonld,
// lint-source-outlets) na něm závisí beze změny.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRecordTables } from "./lib/record-tables.mjs";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = buildRecordTables(ROOT);

test("record-tables: tabulky mají legacy klíče v legacy pořadí", () => {
  assert.deepEqual(Object.keys(tables), ["claims", "sources", "cases", "gaps", "relations", "entities", "dossiers"]);
  assert.deepEqual(Object.keys(tables.claims[0]), ["clm_id", "dossier", "status", "status_label", "summary", "sources", "source_count", "subjects", "url"]);
  assert.deepEqual(Object.keys(tables.sources[0]), ["src_id", "dossier", "title", "outlet", "src_type", "published", "retrieved", "claims", "claim_count", "subjects", "source_url", "family", "url"]);
  assert.deepEqual(Object.keys(tables.cases[0]), ["case_id", "dossier", "title", "period", "status", "label", "subjects", "url"]);
  assert.deepEqual(Object.keys(tables.gaps[0]), ["gap_id", "dossier", "title", "priority", "checked", "claims", "subjects", "url"]);
  assert.deepEqual(Object.keys(tables.relations[0]), ["relation_id", "dossier", "relation_type", "source", "target", "label", "status", "claims", "sources", "subjects", "url"]);
  assert.deepEqual(Object.keys(tables.entities[0]), ["entity_id", "title", "entity_type", "role", "dossiers", "publication_role", "dossier_status", "coverage_state", "government_office", "government_party", "government_snapshot", "url"]);
  assert.deepEqual(Object.keys(tables.dossiers[0]), ["slug", "title", "dossier_type", "subject", "canonical_dossier", "url"]);
});

test("record-tables: vzorek řádků odpovídá dřívějšímu parseru byte-verně", () => {
  const clm = tables.claims.find((r) => r.dossier === "macinka-turek" && r.clm_id === "CLM-01");
  assert.deepEqual(clm, {
    clm_id: "CLM-01",
    dossier: "macinka-turek",
    status: "status-corroborated",
    status_label: "CORROBORATED",
    summary: "Turek zvolen europoslancem v červnu 2024 za společnou kandidátku Motoristů a Přísahy",
    sources: ["SRC-11", "SRC-12", "SRC-13"],
    source_count: 3,
    subjects: ["turek"],
    url: "/dossiers/macinka-turek/claims/clm-01/",
  });

  const src = tables.sources.find((r) => r.dossier === "macinka-turek" && r.src_id === "SRC-01");
  assert.equal(src.outlet, "Echo24");
  assert.equal(src.src_type, "zpravodajství");
  assert.equal(src.retrieved, "2026-07-21");
  assert.equal(src.published, "2026-07-15");
  assert.equal(src.family, "");
  assert.deepEqual(src.claims, ["CLM-13"]);
  assert.equal(src.url, "/dossiers/macinka-turek/sources/src-01/");
  assert.ok(src.source_url.startsWith("https://www.echo24.cz/"));

  const rel = tables.relations.find((r) => r.dossier === "macinka-turek" && r.relation_id === "edge-babis-nehoda2026");
  assert.deepEqual(rel, {
    relation_id: "edge-babis-nehoda2026",
    dossier: "macinka-turek",
    relation_type: "RESPONDED_TO",
    source: "babis",
    target: "nehoda2026",
    label: "vyzval k odpovědnosti",
    status: "corroborated",
    claims: ["CLM-12"],
    sources: ["SRC-06", "SRC-08"],
    subjects: ["turek"],
    url: "/dossiers/macinka-turek/relations/edge-babis-nehoda2026/",
  });
});

test("record-tables: government_* pole jdou z data/government.toml (roster), ne z modelu", () => {
  const babis = tables.entities.find((e) => e.entity_id === "babis");
  assert.equal(babis.government_office, "předseda vlády");
  assert.equal(babis.government_party, "ANO");
  assert.match(babis.government_snapshot, /^\d{4}-\d{2}-\d{2}$/);
  // entita mimo roster nese null — úřad se nevymýšlí
  const nonRoster = tables.entities.find((e) => e.entity_id === "agrofert");
  assert.equal(nonRoster.government_office, null);
  assert.equal(nonRoster.government_party, null);
  assert.equal(nonRoster.government_snapshot, null);
});

test("record-tables: pořadí dossierů = pořadí registru, záznamy numericky", () => {
  const registryOrder = loadDossierRegistry().map((d) => d.slug);
  const seen = [...new Set(tables.claims.map((r) => r.dossier))];
  const expected = registryOrder.filter((s) => seen.includes(s));
  assert.deepEqual(seen, expected, "claims musí jít v redakčním pořadí registru (dossier.order)");
  const mt = tables.claims.filter((r) => r.dossier === "macinka-turek").map((r) => r.clm_id);
  const sorted = [...mt].sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
  assert.deepEqual(mt, sorted, "claims uvnitř dossieru musí být numericky seřazené");
});

test("record-tables: projekce nečte content/** (pojistka fáze G)", () => {
  // Kód modulu nesmí sahat na content/ — record-tables je od fáze G
  // projekce compiled modelu, ne front-matter parser. Kontroluje se
  // KÓD (join/readFileSync/readdirSync s cestou content), ne komentáře.
  const source = readFileSync(join(ROOT, "scripts/dossier/lib/record-tables.mjs"), "utf8");
  assert.ok(!/(join|readFileSync|readdirSync|existsSync)\([^)]*["'`][^"'`]*content\//.test(source), "record-tables.mjs nesmí číst content/**");
});
