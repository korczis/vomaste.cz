// Shared front-matter → row-table projection, extracted from
// build-data-exports.mjs so that the flat /data/*.json exports and the
// JSON-LD exports (build-jsonld-exports.mjs) are built from ONE parser
// instead of two drifting copies. Same contract as before: derived,
// never authored — every row comes from the same front matter the pages
// render from; no status is computed here, no score, no ranking.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadDossierRegistry } from "./dossier-registry.mjs";

const fm = (text) => (text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
const str = (b, k) => (b.match(new RegExp(`^${k}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;
const arr = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*\\[([^\\]]*)\\]`, "m"));
  return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]) : [];
};

export function buildRecordTables(root) {
  const registry = loadDossierRegistry();
  const rows = { claims: [], sources: [], cases: [], gaps: [], relations: [], entities: [], dossiers: [] };

  for (const d of registry) {
    rows.dossiers.push({
      slug: d.slug,
      title: d.title,
      dossier_type: d.dossierType,
      subject: d.subject,
      canonical_dossier: d.canonicalDossier,
      url: `/dossiers/${d.slug}/`,
    });
  }

  // Per-record pages of every dossier that physically owns records.
  for (const d of registry) {
    const base = join(root, "content/dossiers", d.slug);
    const read = (sub) => {
      const dir = join(base, sub);
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((f) => f.endsWith(".md") && f !== "_index.md")
        .map((f) => ({ slug: f.replace(/\.md$/, ""), block: fm(readFileSync(join(dir, f), "utf8")) }));
    };

    for (const { slug, block } of read("claims")) {
      const id = str(block, "clm_id");
      if (!id) continue;
      rows.claims.push({
        clm_id: id,
        dossier: d.slug,
        status: str(block, "status"),
        status_label: str(block, "status_label"),
        summary: str(block, "summary"),
        sources: arr(block, "sources"),
        source_count: arr(block, "sources").length,
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/claims/${slug}/`,
      });
    }

    for (const { slug, block } of read("sources")) {
      const id = str(block, "src_id");
      if (!id) continue;
      rows.sources.push({
        src_id: id,
        dossier: d.slug,
        title: str(block, "title"),
        outlet: str(block, "outlet"),
        src_type: str(block, "src_type"),
        published: str(block, "published"),
        retrieved: str(block, "retrieved"),
        claims: arr(block, "claims"),
        claim_count: arr(block, "claims").length,
        subjects: arr(block, "subjects"),
        source_url: str(block, "url"),
        url: `/dossiers/${d.slug}/sources/${slug}/`,
      });
    }

    for (const { slug, block } of read("cases")) {
      const id = str(block, "case_id");
      if (!id) continue;
      rows.cases.push({
        case_id: id,
        dossier: d.slug,
        title: str(block, "title"),
        period: str(block, "period"),
        status: str(block, "status"),
        label: str(block, "label"),
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/cases/${slug}/`,
      });
    }

    for (const { slug, block } of read("gaps")) {
      const id = str(block, "gap_id");
      if (!id) continue;
      rows.gaps.push({
        gap_id: id,
        dossier: d.slug,
        title: str(block, "title"),
        priority: str(block, "priority"),
        checked: str(block, "checked"),
        claims: arr(block, "claims"),
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/gaps/${slug}/`,
      });
    }

    for (const { slug, block } of read("relations")) {
      rows.relations.push({
        relation_id: slug,
        dossier: d.slug,
        relation_type: str(block, "relation_type"),
        source: str(block, "source"),
        target: str(block, "target"),
        label: str(block, "label"),
        status: str(block, "status"),
        claims: arr(block, "claims"),
        sources: arr(block, "sources"),
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/relations/${slug}/`,
      });
    }
  }

  // Global entity registry.
  const entDir = join(root, "content/entities");
  if (existsSync(entDir)) {
    for (const f of readdirSync(entDir).filter((f) => f.endsWith(".md") && f !== "_index.md")) {
      const block = fm(readFileSync(join(entDir, f), "utf8"));
      rows.entities.push({
        entity_id: str(block, "entity_id") ?? f.replace(/\.md$/, ""),
        title: str(block, "title"),
        entity_type: str(block, "entity_type"),
        role: str(block, "role"),
        dossiers: arr(block, "dossiers"),
        // Publication-state fields: what the entity actually IS in this
        // system, so a reader querying the export can tell a context entity
        // apart from an authorized dossier subject without reading prose.
        publication_role: str(block, "publication_role"),
        dossier_status: str(block, "dossier_status"),
        coverage_state: str(block, "coverage_state"),
        // Government-roster fields (data/government.toml via
        // build-government-roster.mjs). Null for every entity that isn't a
        // roster member — a public office held on the snapshot date, nothing
        // more. Deliberately NOT emitted as schema.org Person/Role in
        // JSON-LD: Person markup is restricted to authorized entity-dossier
        // main pages (verify-jsonld.mjs), and holding an office is not
        // dossier coverage.
        government_office: str(block, "government_office"),
        government_party: str(block, "government_party"),
        government_snapshot: str(block, "government_snapshot"),
        url: `/entities/${f.replace(/\.md$/, "")}/`,
      });
    }
  }

  return rows;
}
