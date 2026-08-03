// Golden testy compiled kanonického modelu (T-028 fáze H, krok 6).
//
// Nahrazují parity testy migrátoru fáze D (archivované ve
// scripts/migrations/archive/): migrace je hotová a její vstupy zanikly,
// takže kotvou už není „content == canonical", ale PŘÍMO compiled model —
// snapshot počtů a vzorky konkrétních záznamů. Když se golden hodnoty
// změní NEČEKANĚ (bez redakční změny dat), něco rozbilo loader/kompilátor;
// když se změní ČEKANĚ (nový záznam), commit aktualizuje čísla vědomě.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalTree } from "./load.mjs";
import { compileDataset } from "./compile.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const compiled = compileDataset(loadCanonicalTree(join(ROOT, "data/dossiers")));

test("golden: počty záznamů per typ (snapshot 2026-08-03: + CLM-55/SRC-41 adam-vojtech GAP-07)", () => {
  assert.deepEqual(compiled.counts.perType, {
    case: 89,
    claim: 889,
    dossier: 24,
    entity: 514,
    gap: 189,
    relation: 317,
    source: 577,
    update: 50,
  });
  assert.equal(compiled.counts.dossiers, 24);
  assert.equal(compiled.counts.entities, 514);
});

test("golden: graf — uzly z entit, hrany z relations", () => {
  assert.equal(compiled.graph.nodes.length, 514);
  assert.equal(compiled.graph.edges.length, 317);
});

test("golden: vzorek claim záznamu (andrej-babis CLM-01)", () => {
  const w = compiled.indexes.byDossierIdentifier["andrej-babis:CLM-01"];
  assert.equal(w.registry, "claims");
  assert.equal(w.record.status, "status-corroborated");
  assert.equal(w.record.statusLabel, "CORROBORATED");
  assert.equal(w.route, "/dossiers/andrej-babis/claims/clm-01/");
  assert.match(w.record.text, /Čapí hnízdo/);
});

test("golden: vzorek entity s proveniencí a registry pořadím", () => {
  const babis = compiled.indexes.byDossierIdentifier["babis"];
  assert.equal(babis.record.title, "Andrej Babiš");
  assert.equal(babis.record.order, 1);
  assert.equal(babis.record.provenance.discoveredAt, "2026-07-29");
  assert.deepEqual(babis.record.provenance.claimRefs.slice(0, 2), ["CLM-12", "CLM-04"]);
  assert.equal(babis.record.publicationRole, "subject");
});

test("golden: dossier nese registry order a kurátorovaný graf", () => {
  const pm = compiled.records.find((w) => w.registry === "dossier" && w.dossier === "petr-macinka");
  assert.equal(pm.record.order, 1); // historické autorizační pořadí registru
  const mt = compiled.records.find((w) => w.registry === "dossier" && w.dossier === "macinka-turek");
  assert.equal(mt.record.order, 19);
  assert.equal(mt.record.graph.nodes.length, 26);
  assert.equal(mt.record.graph.edges.length, 34);
  assert.equal(mt.record.graph.clusters.length, 8);
  assert.equal(mt.record.graph.sourceFamilies.length, 3);
  // Kurátorský popisek uzlu se liší od globálního title entity — přesně
  // to je důvod, proč graph vrstva existuje.
  const node = mt.record.graph.nodes.find((n) => n.entity === "babis");
  assert.equal(node.label, "Andrej Babiš (premiér)");
});

test("golden: relation.note přenesený z dřívější graph.toml hrany", () => {
  const w = compiled.indexes.byDossierIdentifier["macinka-turek:edge-babis-vlada"];
  assert.equal(w.record.status, "contextual");
  assert.match(w.record.note, /Nesporné veřejné pozadí/);
});
