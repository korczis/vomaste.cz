// Golden testy compiled kanonického modelu (T-028 fáze H, krok 6).
//
// Nahrazují parity testy migrátoru fáze D (archivované ve
// scripts/migrations/archive/): migrace je hotová a její vstupy zanikly,
// takže kotvou už není „content == canonical", ale PŘÍMO compiled model —
// snapshot počtů a vzorky konkrétních záznamů. Když se golden hodnoty
// změní NEČEKANĚ (bez redakční změny dat), něco rozbilo loader/kompilátor;
// když se změní ČEKANĚ (nový záznam), commit aktualizuje čísla vědomě.
//
// Počty (perType/graph) žijí v compiled-golden.snapshot.json, NE natvrdo
// v tomto souboru — při souběžné práci víc agentů na stejných dossierech
// mění tahle čísla skoro každý commit, a hardcoded literál kolidoval na
// KAŽDÉM rebase (session 2026-08-05). Po konfliktu ve snapshotu: vezmi
// libovolnou stranu (`git checkout --ours/--theirs`) a spusť
// `npm run test:update-golden` — přepočítá se z aktuálních dat, žádná
// ruční aritmetika. Vzorkové testy níž (konkrétní claim/entity/dossier)
// jsou naopak stabilní strukturální kontroly a hardcoded zůstávají —
// mění se jen při skutečné redakční změně toho konkrétního záznamu.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalTree } from "./load.mjs";
import { compileDataset } from "./compile.mjs";
import golden from "./compiled-golden.snapshot.json" with { type: "json" };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const compiled = compileDataset(loadCanonicalTree(join(ROOT, "data/dossiers")));

test("golden: počty záznamů per typ (viz compiled-golden.snapshot.json — npm run test:update-golden)", () => {
  assert.deepEqual(compiled.counts.perType, golden.countsPerType);
  assert.equal(compiled.counts.dossiers, golden.countsDossiers);
  assert.equal(compiled.counts.entities, golden.countsEntities);
});

test("golden: graf — uzly z entit, hrany z relations", () => {
  assert.equal(compiled.graph.nodes.length, golden.graphNodes);
  assert.equal(compiled.graph.edges.length, golden.graphEdges);
});

test("golden: vzorek claim záznamu (andrej-babis CLM-01; snapshot 2026-08-05, T-058: 1 ZDROJ → CORROBORATED, k oběma zdrojům rodiny ctk přibyla tisková zpráva Vrchního soudu v Praze SRC-75)", () => {
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
