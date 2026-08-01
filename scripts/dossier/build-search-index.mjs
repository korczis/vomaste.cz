#!/usr/bin/env node
/*
 * Builds a static, client-fetchable search index covering every routable
 * record across every dossier (sources, claims, cases, gaps, relations,
 * the dossier pages themselves and the global entity registry). Written
 * to static/search-index.json so Zola copies it verbatim to
 * public/search-index.json — assets/js/modules/global-search.js fetches
 * it at runtime. Deterministic, no network access.
 *
 * T-028 fáze G: zdrojem je COMPILED kanonický dataset, ne content/**
 * front matter. Jediný vstup mimo compiled model jsou popisky uzlů
 * z data/dossiers/<slug>/graph.toml — prezentanční titulek vztahu se
 * skládá „<label zdroje> — <label vztahu> — <label cíle>“ ze stejných
 * kurátorovaných popisků, ze kterých kdysi vznikly titulky relation
 * stránek (graph.toml zůstává do fáze H kanonickým kurátorovaným
 * zdrojem grafu).
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel, localPart, recordsOf } from "./lib/compiled-model.mjs";
import { readGraphToml } from "./lib/jsonld-shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT_FILE = join(ROOT, "static/search-index.json");

const compiled = getCompiledModel(ROOT);
const entries = [];

// Entities are GLOBAL — indexed once, not once per dossier.
for (const w of compiled.entities) {
  const r = w.record;
  entries.push({
    id: r.entityId,
    type: "entity",
    dossier: null,
    title: r.title ?? r.entityId,
    summary: r.entityType ?? "",
    extra: r.publicationRole ?? "",
    route: w.route,
  });
}

const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");
const dossierSlugs = dossierWrappers.map((w) => w.dossier).sort();
const dossierBySlug = new Map(dossierWrappers.map((w) => [w.dossier, w]));

for (const slug of dossierSlugs) {
  const d = dossierBySlug.get(slug).record;
  entries.push({
    id: `DOSSIER:${slug}`,
    type: "dossier",
    dossier: slug,
    // Kanonický titul (data/dossiers.toml → dossier.json). U macinka-turek
    // se liší od stránkového „Dossier — …“ — kanonický je autoritativní
    // (viz migrace, anomálie titulů), stránkový zůstává prezentační
    // vrstvou do fáze H.
    title: d.title ?? slug,
    summary: d.description ?? "",
    route: `/dossiers/${slug}/`,
  });

  // Popisky kurátorovaných uzlů pro titulky vztahů.
  const labelOf = new Map(readGraphToml(ROOT, slug).nodes.map((n) => [n.id, n.label]));

  // Stejné pořadí registrů jako dřívější sken: sources, claims, cases,
  // gaps, relations — na výsledné seřazené podobě nezáleží u unikátních
  // id, ale drží stabilní pořadí duplicitních id napříč dossiery.
  const push = (registry, build) => {
    for (const w of recordsOf(compiled, slug, registry)) entries.push(build(w, w.record));
  };
  push("sources", (w, r) => ({
    id: r.identifier,
    type: "source",
    dossier: slug,
    title: r.title ?? r.identifier,
    summary: r.description ?? r.outlet ?? "",
    extra: [r.outlet, r.sourceType].filter(Boolean).join(" "),
    route: w.route,
  }));
  push("claims", (w, r) => ({
    id: r.identifier,
    type: "claim",
    dossier: slug,
    title: r.identifier,
    summary: r.text ?? "",
    extra: [r.statusLabel].filter(Boolean).join(" "),
    route: w.route,
  }));
  push("cases", (w, r) => ({
    id: r.identifier,
    type: "case",
    dossier: slug,
    title: r.title ?? r.identifier,
    summary: r.summary ?? "",
    extra: [r.statusLabel].filter(Boolean).join(" "),
    route: w.route,
  }));
  push("gaps", (w, r) => ({
    id: r.identifier,
    type: "gap",
    dossier: slug,
    title: r.title ?? r.identifier,
    summary: r.description ?? "",
    extra: "",
    route: w.route,
  }));
  push("relations", (w, r) => {
    const from = localPart(r.sourceEntity?.["@id"]);
    const to = localPart(r.targetEntity?.["@id"]);
    return {
      id: r.identifier,
      type: "relation",
      dossier: slug,
      title: `${labelOf.get(from) ?? from} — ${r.label} — ${labelOf.get(to) ?? to}`,
      summary: r.label ?? "",
      extra: [r.label].filter(Boolean).join(" "),
      route: w.route,
    };
  });
}

entries.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(OUT_FILE, JSON.stringify(entries), "utf8");
console.log(`Wrote ${OUT_FILE}: ${entries.length} searchable record(s) across ${dossierSlugs.length} dossier(s).`);
