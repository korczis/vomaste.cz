#!/usr/bin/env node
// Přegeneruje scripts/data/compiled-golden.snapshot.json z aktuálního
// compiled modelu. Toto je JEDINÝ podporovaný způsob, jak měnit golden
// počty — nikdy je needituj ručně v .mjs testu ani v JSON souboru.
//
// Proč tohle existuje (session 2026-08-05): dva souběžné agenti
// pravidelně přidávali záznamy do stejných dossierů a golden test
// (dřív hardcoded literál v compiled-golden.test.mjs) kolidoval na
// KAŽDÉM rebase — řešení bylo pokaždé stejné ruční kutění (spustit
// test, přepsat "actual" do "expected", dopočítat graf). Přesunutím
// čísel do samostatného JSON snapshotu a tohoto generátoru se z toho
// stal jeden příkaz namísto ruční aritmetiky, a to i po konfliktu:
//   git checkout --theirs scripts/data/compiled-golden.snapshot.json  # nebo ours, nezáleží
//   npm run test:update-golden
//   git add scripts/data/compiled-golden.snapshot.json
// Viz docs/coop/PROTOCOL.md, „Konflikty na generovaných souborech".
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalTree } from "./load.mjs";
import { compileDataset } from "./compile.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SNAPSHOT_PATH = join(__dirname, "compiled-golden.snapshot.json");

const compiled = compileDataset(loadCanonicalTree(join(ROOT, "data/dossiers")));

const snapshot = {
  $comment:
    "Generováno scripts/data/update-golden-snapshot.mjs (npm run test:update-golden) — needituj ručně. Čte compiled-golden.test.mjs.",
  countsPerType: compiled.counts.perType,
  countsDossiers: compiled.counts.dossiers,
  countsEntities: compiled.counts.entities,
  graphNodes: compiled.graph.nodes.length,
  graphEdges: compiled.graph.edges.length,
};

writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(`Golden snapshot přegenerován: ${SNAPSHOT_PATH}`);
console.log(
  `  case:${snapshot.countsPerType.case} claim:${snapshot.countsPerType.claim} dossier:${snapshot.countsPerType.dossier} entity:${snapshot.countsPerType.entity} gap:${snapshot.countsPerType.gap} relation:${snapshot.countsPerType.relation} source:${snapshot.countsPerType.source} update:${snapshot.countsPerType.update}`,
);
console.log(`  graf: ${snapshot.graphNodes} uzlů / ${snapshot.graphEdges} hran`);
