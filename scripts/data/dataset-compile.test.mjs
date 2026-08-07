// Testy normalizace, kompilace a CLI brány kanonického datasetu
// (T-028 fáze C) — nad syntetickým example-fixture.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compareIdentifiers, identifierSortKey, normalizeRecord, routeFor, REGISTRY_ORDER } from "./normalize.mjs";
import { compileDataset } from "./compile.mjs";
import { loadCanonicalDataset, validateCanonicalDataset, RECORDS_ROOT } from "./lib/dataset.mjs";
import { runCheck } from "./check.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURE = join(ROOT, "tests/fixtures/canonical/example-fixture");
const AUTHS = new Set(["AUTH-0000-00-00-TEST"]);

test("numerické řazení identifierů: CLM-2 < CLM-10 (ne lexikograficky)", () => {
  assert.ok(compareIdentifiers("CLM-2", "CLM-10") < 0);
  assert.ok(compareIdentifiers("CLM-10", "CLM-2") > 0);
  assert.ok(compareIdentifiers("SRC-09", "SRC-10") < 0);
  assert.equal(identifierSortKey("CLM-07").num, 7);
  // ne-numerické identifiery se řadí codepointově
  assert.ok(compareIdentifiers("edge-alpha", "edge-beta") < 0);
  assert.ok(compareIdentifiers("2026-01-01", "2026-01-02") < 0);
});

test("normalizeRecord doplní dokumentované defaulty a nemutuje vstup", () => {
  const rel = { recordType: "relation", identifier: "edge-x" };
  const normalized = normalizeRecord(rel);
  assert.equal(normalized.directed, true);
  assert.equal(rel.directed, undefined, "vstup zůstal nedotčený");
  assert.equal(normalizeRecord({ recordType: "relation", directed: false }).directed, false);
  assert.equal(normalizeRecord({ recordType: "gap", identifier: "GAP-1" }).status, "open");
  assert.equal(normalizeRecord({ recordType: "gap", status: "closed" }).status, "closed");
});

test("routeFor zrcadlí dnešní route tvary; updates veřejnou routu nemají", () => {
  assert.equal(routeFor({ registry: "dossier", dossier: "x", record: {} }), "/dossiers/x/");
  assert.equal(
    routeFor({ registry: "claims", dossier: "x", record: { identifier: "CLM-07" } }),
    "/dossiers/x/claims/clm-07/",
  );
  assert.equal(
    routeFor({ registry: "relations", dossier: "x", record: { identifier: "edge-a-b" } }),
    "/dossiers/x/relations/edge-a-b/",
  );
  assert.equal(routeFor({ registry: "entities", dossier: null, record: { identifier: "someone" } }), "/entities/someone/");
  assert.equal(routeFor({ registry: "updates", dossier: "x", record: { identifier: "2026-01-01" } }), null);
});

test("kompilace fixture: řazení, indexy, počty, routy, graf i manifest", async () => {
  const model = await loadCanonicalDataset(FIXTURE);
  const compiled = compileDataset(model);

  // řazení: dossier → claims → sources → cases → gaps → relations → updates
  assert.deepEqual(
    compiled.records.map((w) => w.registry),
    REGISTRY_ORDER,
  );

  // indexy podle @id i podle dossier+identifier
  const viaId = compiled.indexes.byId["https://vomaste.cz/id/dossiers/example-subject/claims/CLM-01"];
  assert.equal(viaId.record.identifier, "CLM-01");
  assert.equal(compiled.indexes.byDossierIdentifier["example-subject:CLM-01"], viaId);
  assert.equal(compiled.indexes.byDossierIdentifier["example-entity"].record.entityType, "person");

  // odvozené počty
  assert.equal(compiled.counts.dossiers, 1);
  assert.equal(compiled.counts.entities, 2);
  assert.deepEqual(compiled.counts.perDossier["example-subject"], {
    case: 1, claim: 1, dossier: 1, gap: 1, relation: 1, source: 1, update: 1, total: 7,
  });
  assert.equal(compiled.counts.perType.claim, 1);
  assert.equal(compiled.counts.perType.entity, 2);

  // routy — kompozitní klíče a tvary jako build-route-manifest.mjs
  assert.deepEqual(compiled.routes["DOSSIER:example-subject"], {
    type: "dossier", dossier: "example-subject", route: "/dossiers/example-subject/",
  });
  assert.deepEqual(compiled.routes["example-subject:CLM-01"], {
    type: "claim", dossier: "example-subject", local_id: "CLM-01", route: "/dossiers/example-subject/claims/clm-01/",
  });
  assert.equal(compiled.routes["example-entity"].route, "/entities/example-entity/");
  assert.ok(!Object.values(compiled.routes).some((r) => r.type === "update"), "updates nemají routu");

  // graf: uzly z entit, hrany z relations
  assert.deepEqual(compiled.graph.nodes.map((n) => n.id), ["example-entity", "example-org"]);
  assert.equal(compiled.graph.edges.length, 1);
  const edge = compiled.graph.edges[0];
  assert.equal(edge.from, "example-entity");
  assert.equal(edge.to, "example-org");
  assert.equal(edge.relationType, "MEMBER_OF");
  assert.equal(edge.directed, true);

  // manifest
  assert.equal(compiled.manifest.schemaVersion, 1);
  assert.equal(compiled.manifest.contextVersion, "https://vomaste.cz/context/v1.jsonld");
  assert.equal(compiled.manifest.counts.records, 7);
  assert.equal(compiled.manifest.graph.nodes, 2);
});

test("řazení uvnitř registru je numerické (CLM-2 před CLM-10) — přes celý compile", async () => {
  const model = await loadCanonicalDataset(FIXTURE);
  const claim = model.records.find((w) => w.relPath === "example-subject/claims/clm-01.json");
  for (const n of [10, 2]) {
    const extra = structuredClone(claim);
    extra.record.identifier = `CLM-${n}`;
    extra.record["@id"] = `https://vomaste.cz/id/dossiers/example-subject/claims/CLM-${n}`;
    extra.relPath = `example-subject/claims/clm-${n}.json`;
    model.records.push(extra);
  }
  const compiled = compileDataset(model);
  assert.deepEqual(
    compiled.records.filter((w) => w.registry === "claims").map((w) => w.record.identifier),
    ["CLM-01", "CLM-2", "CLM-10"],
    "špatné (lexikografické) řazení by dalo CLM-01, CLM-10, CLM-2",
  );
});

test("plná pipeline nad fixture: load → validate (bez chyb) → compile", async () => {
  const model = await loadCanonicalDataset(FIXTURE);
  const { errors, warnings } = await validateCanonicalDataset(model, { authorizations: AUTHS });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  const compiled = compileDataset(model);
  assert.equal(compiled.records.length, 7);
});

test("validateCanonicalDataset zahrnuje i tvarovou vrstvu", async () => {
  const model = await loadCanonicalDataset(FIXTURE);
  delete model.records.find((w) => w.registry === "claims").record.text;
  const { errors } = await validateCanonicalDataset(model, { authorizations: AUTHS });
  assert.ok(errors.some((e) => e.includes("must have required property 'text'")), errors.join("\n"));
});

test("check nad reálným data/dossiers projde (51 balíčků, jiri-pospisil přidán)", async () => {
  // Do fáze D tady test přibíjel pre-migration hlášku (0 balíčků);
  // migrátor scripts/migrations/migrate-content-to-json.mjs kanonická
  // data vytvořil, takže brána teď validuje reálný dataset. Sémantická
  // porušení zděděná z obsahu smí projít jen přes baseline allowlist
  // (_shared/semantics-baseline.json) — jako warningy, nikdy chyby.
  // 51 = předchozích 50 + autorizovaný dossier jiri-pospisil.
  const lines = [];
  const code = await runCheck({ root: RECORDS_ROOT, log: (l) => lines.push(l) });
  assert.equal(code, 0, lines.join("\n"));
  assert.ok(!lines.some((l) => l.includes("0 dossier packages")), lines.join("\n"));
  assert.ok(lines.some((l) => l.includes("Načteno 51 dossier balíčků")), lines.join("\n"));
  assert.ok(lines.at(-1) === "OK");
});

test("check nad fixture rootem validuje i kompiluje (autorizace přes reálný registr selže → exit 1)", async () => {
  // Fixture cituje syntetický AUTH-0000-00-00-TEST, který v reálném
  // data/authorizations.toml záměrně není — CLI brána to musí chytit.
  const lines = [];
  const code = await runCheck({ root: FIXTURE, log: (l) => lines.push(l) });
  assert.equal(code, 1);
  assert.ok(lines.some((l) => l.includes("AUTH-0000-00-00-TEST")), lines.join("\n"));
});
