#!/usr/bin/env node
/*
 * Jednorázová migrace kurátorované grafové vrstvy (T-028 fáze H, krok 3):
 * data/dossiers/<slug>/graph.toml → pole `graph` kanonického
 * data/dossiers/<slug>/dossier.json.
 *
 * Co se přenáší (lossless):
 *   [[nodes]]           → graph.nodes (pořadí souboru = kurátorské pořadí;
 *                         entity/label/subject(true)/cluster/summary/claims/sources)
 *   pořadí [[edges]]    → graph.edges (id kanonických relations — data hran
 *                         nesou relation záznamy, tady žije jen pořadí)
 *   [[clusters]]        → graph.clusters (verbatim, pořadí klíčů zachováno)
 *   [[source_families]] → graph.sourceFamilies
 *   edge note           → relation.note (kanonický záznam vztahu)
 *
 * Co se VĚDOMĚ zahazuje (s tvrdou kontrolou konzistence před zahozením):
 *   node.type  — je to entityType globální entity (parita se ověří, nesoulad = chyba)
 *   node.depth — od fáze H se počítá deterministicky BFS od subjektu
 *                (scripts/data/lib/graph-depth.mjs); kurátorovaná hodnota
 *                objevení žije v entity.provenance.depth
 *   pole hran (source/target/label/status/relation/claims/sources) —
 *                nesou je kanonické relations; PŘED zahozením se ověřuje
 *                1:1 shoda (mirror gate fáze G, naposledy zde)
 *
 * Idempotentní: druhé spuštění nezmění jediný bajt.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readGraphTomlBlocks } from "./lib/legacy-graph-toml.mjs";
import { loadCanonicalTree } from "../../data/load.mjs";
import { compileDataset } from "../../data/compile.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);
const localIds = (refs) => (refs ?? []).map((r) => localPart(r["@id"]));
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

const compiled = compileDataset(loadCanonicalTree(join(ROOT, "data/dossiers")));
const entityById = new Map(compiled.entities.map((w) => [w.record.entityId, w.record]));

const errors = [];
let migrated = 0;
let unchanged = 0;

for (const w of compiled.records.filter((x) => x.registry === "dossier")) {
  const slug = w.dossier;
  const tomlFile = join(ROOT, "data/dossiers", slug, "graph.toml");
  if (!existsSync(tomlFile)) continue;
  const blocks = readGraphTomlBlocks(ROOT, slug);
  const relations = compiled.records.filter((x) => x.dossier === slug && x.registry === "relations");
  const relationById = new Map(relations.map((x) => [x.record.identifier, x]));

  // --- mirror gate: hrany musí 1:1 sedět na kanonické relations ----------
  if (blocks.edges.length !== relationById.size || blocks.edges.some((e) => !relationById.has(e.id))) {
    errors.push(`[${slug}] hrany graph.toml (${blocks.edges.length}) a relations (${relationById.size}) nejsou 1:1`);
    continue;
  }
  for (const e of blocks.edges) {
    const r = relationById.get(e.id).record;
    const mismatches = [];
    if (e.source !== localPart(r.sourceEntity?.["@id"])) mismatches.push("source");
    if (e.target !== localPart(r.targetEntity?.["@id"])) mismatches.push("target");
    if (e.label !== r.label) mismatches.push("label");
    if (e.status !== r.status) mismatches.push("status");
    if (e.relation !== r.relationType) mismatches.push("relationType");
    if (!sameList(e.claims ?? [], localIds(r.claims))) mismatches.push("claims");
    if (!sameList(e.sources ?? [], localIds(r.sources))) mismatches.push("sources");
    if (mismatches.length) errors.push(`[${slug}] hrana ${e.id}: nesoulad s relation záznamem (${mismatches.join(", ")})`);
    // edge note → relation.note
    if (e.note) {
      const relPath = join(ROOT, "data/dossiers", slug, "relations", `${e.id.toLowerCase()}.json`);
      const rec = JSON.parse(readFileSync(relPath, "utf8"));
      if (rec.note !== e.note) {
        const next = {};
        for (const [k, v] of Object.entries(rec)) {
          if (k === "note") continue;
          if (k === "content") next.note = e.note;
          next[k] = v;
        }
        if (!("note" in next)) next.note = e.note;
        writeFileSync(relPath, `${JSON.stringify(next, null, 2)}\n`);
        console.log(`[${slug}] relation ${e.id}: doplněn note z graph.toml hrany`);
      }
    }
  }

  // --- uzly: parita type/entity, lossless přenos -------------------------
  const nodes = blocks.nodes.map((n) => {
    const entity = entityById.get(n.id);
    if (!entity) {
      errors.push(`[${slug}] uzel ${n.id}: nemá kanonický entity záznam`);
      return null;
    }
    if (entity.entityType !== n.type) {
      errors.push(`[${slug}] uzel ${n.id}: type "${n.type}" ≠ entityType "${entity.entityType}" — nelze zahodit bez ztráty`);
    }
    const out = { entity: n.id, label: n.label };
    if (n.subject === true) out.subject = true;
    if (n.cluster !== undefined) out.cluster = n.cluster;
    if (n.summary !== undefined) out.summary = n.summary;
    if (n.claims !== undefined) out.claims = n.claims;
    if (n.sources !== undefined) out.sources = n.sources;
    return out;
  });

  const clusters = blocks.clusters.map((c) => {
    const out = {};
    for (const key of ["id", "label", "description", "claims", "sources", "nodes", "gaps"]) {
      if (c[key] !== undefined) out[key] = c[key];
    }
    for (const key of Object.keys(c)) {
      if (!(key in out)) errors.push(`[${slug}] cluster ${c.id}: neznámý klíč "${key}" — lossless pojistka`);
    }
    return out;
  });
  const sourceFamilies = blocks.source_families.map((f) => {
    const out = {};
    for (const key of ["id", "label", "sources"]) {
      if (f[key] !== undefined) out[key] = f[key];
    }
    for (const key of Object.keys(f)) {
      if (!(key in out)) errors.push(`[${slug}] source_family ${f.id}: neznámý klíč "${key}" — lossless pojistka`);
    }
    return out;
  });

  const graph = { nodes, edges: blocks.edges.map((e) => e.id) };
  if (clusters.length) graph.clusters = clusters;
  if (sourceFamilies.length) graph.sourceFamilies = sourceFamilies;

  // --- zápis do dossier.json (graph před contentBlocks) ------------------
  const dossierPath = join(ROOT, "data/dossiers", slug, "dossier.json");
  const rec = JSON.parse(readFileSync(dossierPath, "utf8"));
  const next = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === "graph") continue;
    if (k === "contentBlocks") next.graph = graph;
    next[k] = v;
  }
  if (!("graph" in next)) next.graph = graph;
  const text = `${JSON.stringify(next, null, 2)}\n`;
  const prev = readFileSync(dossierPath, "utf8");
  if (text === prev) unchanged++;
  else {
    writeFileSync(dossierPath, text);
    migrated++;
  }
}

if (errors.length) {
  console.error(`migrate-graph-curation: ${errors.length} chyb(a):`);
  for (const e of errors) console.error(`  ERROR ${e}`);
  process.exit(1);
}
console.log(`migrate-graph-curation: ${migrated} dossierů migrováno, ${unchanged} beze změny.`);
