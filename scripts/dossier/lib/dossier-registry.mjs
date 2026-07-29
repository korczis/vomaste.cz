// Shared reader for data/dossiers.toml — the registry that distinguishes
// "entity" dossiers (a real, primary-nav-worthy dossier about ONE person,
// but with no physical content of its own — its registries are generated,
// filtered views over a canonical dossier's records) from "aggregate"/
// canonical dossiers (own real content/dossiers/<slug>/{claims,sources,...}
// directories, the actual source of truth). See AGENTS.md's "Entity
// dossiers vs. the aggregate view" section for the full rationale.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DOSSIERS_TOML = join(ROOT, "data", "dossiers.toml");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
}
function extractBoolField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*(true|false)`, "m");
  const found = text.match(re);
  return found ? found[1] === "true" : null;
}

let cached = null;

export function loadDossierRegistry() {
  if (cached) return cached;
  const text = readFileSync(DOSSIERS_TOML, "utf8");
  const blockRe = /\[\[dossiers\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g;
  const records = [];
  let m;
  while ((m = blockRe.exec(text))) {
    const block = m[1];
    records.push({
      slug: extractField(block, "slug"),
      title: extractField(block, "title"),
      dossierType: extractField(block, "dossier_type"),
      subject: extractField(block, "subject"),
      canonicalDossier: extractField(block, "canonical_dossier"),
      sourceDossiers: extractArrayField(block, "source_dossiers"),
      showInPrimaryNavigation: extractBoolField(block, "show_in_primary_navigation"),
    });
  }
  cached = records;
  return records;
}

export function getDossierRecord(slug) {
  return loadDossierRegistry().find((d) => d.slug === slug) ?? null;
}

// A "canonical" dossier owns real physical content
// (content/dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md and
// data/dossiers/<slug>/graph.toml). Everything else (dossier_type ===
// "entity") is a generated, filtered view — falls back to true (canonical)
// for any slug not listed in the registry, so an unlisted/legacy dossier
// is never silently skipped by validators.
export function isCanonicalDossier(slug) {
  const record = getDossierRecord(slug);
  if (!record) return true;
  return record.dossierType !== "entity";
}
