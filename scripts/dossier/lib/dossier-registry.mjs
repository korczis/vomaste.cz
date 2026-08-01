// Shared reader of the dossier registry — which dossiers exist, which are
// "entity" dossiers (a real, primary-nav-worthy dossier about ONE person,
// possibly a generated, filtered view over a canonical dossier's records)
// and which are "aggregate"/canonical (own their records directly). See
// AGENTS.md's "Entity dossiers vs. the aggregate view" section.
//
// T-028 fáze H: registrem je KANONICKÝ dataset sám (data/dossiers/*/
// dossier.json přes compiled model) — data/dossiers.toml zanikl. Pořadí
// registru nese kanonické pole `order` (historické autorizační pořadí
// bloků bývalého TOML registru); veřejné API a tvar záznamů zůstávají
// beze změny, takže všichni konzumenti fungují dál.
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel } from "./compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

let cached = null;

export function loadDossierRegistry() {
  if (cached) return cached;
  const compiled = getCompiledModel(ROOT);
  cached = compiled.records
    .filter((w) => w.registry === "dossier")
    .slice()
    .sort((a, b) => (a.record.order ?? 0) - (b.record.order ?? 0))
    .map((w) => ({
      slug: w.record.slug,
      title: w.record.title,
      dossierType: w.record.dossierType,
      subject: w.record.subject ?? null,
      canonicalDossier: w.record.canonicalDossier ?? null,
      sourceDossiers: w.record.aggregates ?? [],
      showInPrimaryNavigation: w.record.navigationVisible ?? null,
    }));
  return cached;
}

export function getDossierRecord(slug) {
  return loadDossierRegistry().find((d) => d.slug === slug) ?? null;
}

// A "canonical" dossier owns real physical content
// (content/dossiers/<slug>/{claims,sources,cases,gaps,relations}/*.md).
// Everything else (dossierType === "entity") is a generated, filtered view
// — falls back to true (canonical) for any slug not listed in the
// registry, so an unlisted/legacy dossier is never silently skipped by
// validators.
export function isCanonicalDossier(slug) {
  const record = getDossierRecord(slug);
  if (!record) return true;
  return record.dossierType !== "entity";
}
