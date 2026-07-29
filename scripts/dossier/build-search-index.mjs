#!/usr/bin/env node
/*
 * Builds a static, client-fetchable search index covering every routable
 * record across every dossier (sources, claims, cases, gaps, and the
 * dossier pages themselves). Written to static/search-index.json so Zola
 * copies it verbatim to public/search-index.json — assets/js/modules/
 * global-search.js fetches it at runtime. Deterministic, no network access.
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const ENTITIES_ROOT = join(ROOT, "content/entities");
const OUT_FILE = join(ROOT, "static/search-index.json");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}
function frontMatterOf(text) {
  const fmEnd = text.indexOf("\n+++", 3);
  return text.slice(0, fmEnd);
}

const REGISTRY = [
  { dir: "sources", filePattern: /^src-\d+\.md$/, idField: "src_id", type: "source", titleField: "outlet" },
  { dir: "claims", filePattern: /^clm-\d+\.md$/, idField: "clm_id", type: "claim", titleField: "summary" },
  { dir: "cases", filePattern: /^case-\d+\.md$/, idField: "case_id", type: "case", titleField: null },
  { dir: "gaps", filePattern: /^gap-\d+\.md$/, idField: "gap_id", type: "gap", titleField: null },
  { dir: "relations", filePattern: /^(?!_index\.md$).+\.md$/, idField: "rel_id", type: "relation", titleField: "label" },
];

const entries = [];

// Entities are GLOBAL — indexed once, not once per dossier.
for (const file of readdirSync(ENTITIES_ROOT).filter((f) => f !== "_index.md" && f.endsWith(".md")).sort()) {
  const text = readFileSync(join(ENTITIES_ROOT, file), "utf8");
  const fm = frontMatterOf(text);
  const id = extractField(fm, "entity_id");
  if (!id) continue;
  const titleMatch = text.match(/^title = "(.*)"$/m);
  entries.push({
    id,
    type: "entity",
    dossier: null,
    title: titleMatch ? titleMatch[1] : id,
    summary: extractField(fm, "entity_type") ?? "",
    extra: extractField(fm, "publication_role") ?? "",
    route: `/entities/${file.replace(/\.md$/, "")}/`,
  });
}

const dossierSlugs = readdirSync(DOSSIERS_ROOT)
  .filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory())
  .sort();

for (const slug of dossierSlugs) {
  const dossierText = readFileSync(join(DOSSIERS_ROOT, slug, "_index.md"), "utf8");
  const dossierFm = frontMatterOf(dossierText);
  const dossierTitleMatch = dossierText.match(/^title = "(.*)"$/m);
  entries.push({
    id: `DOSSIER:${slug}`,
    type: "dossier",
    dossier: slug,
    title: dossierTitleMatch ? dossierTitleMatch[1] : slug,
    summary: extractField(dossierFm, "description") ?? "",
    route: `/dossiers/${slug}/`,
  });

  for (const cfg of REGISTRY) {
    const dir = join(DOSSIERS_ROOT, slug, cfg.dir);
    const files = readdirSync(dir).filter((f) => cfg.filePattern.test(f)).sort();
    for (const file of files) {
      const text = readFileSync(join(dir, file), "utf8");
      const fm = frontMatterOf(text);
      const id = extractField(fm, cfg.idField);
      if (!id) continue;
      const titleMatch = text.match(/^title = "(.*)"$/m);
      const title = titleMatch ? titleMatch[1] : id;
      const summary =
        extractField(fm, "summary") ??
        extractField(fm, "description") ??
        (cfg.titleField ? extractField(fm, cfg.titleField) ?? "" : "");
      const extraSearchable = [
        extractField(fm, "outlet"),
        extractField(fm, "src_type"),
        extractField(fm, "status_label"),
        extractField(fm, "label"),
      ].filter(Boolean).join(" ");
      entries.push({
        id,
        type: cfg.type,
        dossier: slug,
        title,
        summary,
        extra: extraSearchable,
        route: `/dossiers/${slug}/${cfg.dir}/${file.replace(/\.md$/, "")}/`,
      });
    }
  }
}

entries.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(OUT_FILE, JSON.stringify(entries), "utf8");
console.log(`Wrote ${OUT_FILE}: ${entries.length} searchable record(s) across ${dossierSlugs.length} dossier(s).`);
