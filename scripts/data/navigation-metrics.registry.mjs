/*
 * Named aggregate metrics registry — DEFINITIONS ONLY, no execution.
 *
 * Definitions are deliberately separated from the mechanism that runs them
 * (scripts/data/build-navigation-metrics.mjs) so the execution layer can be
 * swapped later — e.g. for the DuckDB pre-query registry behind /data/ —
 * without touching a single metric ID, template, or test expectation.
 *
 * WHY THESE READ THE COLLECTION EXPORTS AND NOT `@type` TALLIES IN
 * static/data/graph.jsonld — this is the whole correctness argument, so it is
 * recorded here rather than in a commit message:
 *
 * Both static/data/graph.jsonld and static/data/<collection>.json are written
 * by the same generator (scripts/dossier/build-jsonld-exports.mjs), so both
 * are canonical projections of the same registries. They are NOT
 * interchangeable for counting. Measured 2026-07-30:
 *
 *   collection   @type tally in graph.jsonld   collection export   route shows
 *   claims       Claim = 666                   666                 666  ✅
 *   cases        vomaste:Case = 70             70                  70   ✅
 *   relations    vomaste:Relation = 75         75                  75   ✅
 *   gaps         vomaste:Gap = 154             154                 154  ✅
 *   dossiers     Dataset = 31                  22                  22   ❌
 *   entities     Person = 21                   60                  60   ❌
 *   sources      creative-work types = 418     387                 387  ❌
 *
 * The three mismatches are not bugs in the graph — they are category errors
 * in the naive tally:
 *   * `Dataset` covers the global dataset descriptor and per-dossier dataset
 *     descriptors, which are not themselves dossiers in the navigational
 *     sense;
 *   * `Person` is emitted only for entities that carry person semantics, so
 *     it silently drops organizations, public institutions and companies that
 *     /entities/ does list;
 *   * the creative-work types (NewsArticle, Report, OpinionNewsArticle,
 *     Article, Thing) also cover nodes that are not source records.
 *
 * Counting `@type` would therefore violate the "same route, same population"
 * rule: the badge would disagree with what the user can actually open. The
 * collection exports ARE the route population, so they are the source.
 *
 * Every metric still counts DISTINCT canonical `@id`, never array length, so
 * a record appearing twice in an export (or a node carrying several types)
 * is counted once.
 */

/**
 * Registry schema version. Bump when the SHAPE of a definition changes —
 * not when a value changes (values change on every content edit, by design).
 */
export const REGISTRY_VERSION = 1;

/**
 * @typedef {object} MetricDefinition
 * @property {string} id            Stable metric ID. Referenced from
 *                                  data/navigation.toml as `count_metric`.
 *                                  Never rename without a migration.
 * @property {string} description   Human description, surfaced in the
 *                                  generated manifest and on /data/.
 * @property {string} source        Repo-relative path of the canonical
 *                                  dataset this metric reads.
 * @property {string} semantics     Exact count semantics, in prose.
 * @property {string} dedupe        Deduplication rule.
 * @property {string} publication   How draft/unpublished records are treated.
 * @property {string} route         Route whose population this metric must
 *                                  match.
 */

/**
 * Every collection export is a flat array of records. `identity` says which
 * field carries the canonical identity used for deduplication; the runner
 * falls back through these in order, because the exports predate this
 * registry and do not all use `@id`.
 */
const IDENTITY_KEYS = ["@id", "id", "url", "slug"];

/** @type {MetricDefinition[]} */
export const METRIC_DEFINITIONS = [
  {
    id: "dossiers.total",
    description: "Počet publikovaných dossierů",
    source: "static/data/dossiers.json",
    semantics:
      "COUNT(DISTINCT canonical id) over the published dossier registry — entity dossiers plus aggregate views, exactly the set listed under Dossiery in the navigation tree.",
    dedupe: "By canonical id; a dossier listed twice counts once.",
    publication:
      "The export only contains dossiers registered in data/dossiers.toml, which is the published set. Scaffolded-but-unregistered dossiers are absent by construction.",
    route: "/dossiers/",
  },
  {
    id: "entities.total",
    description: "Počet unikátních entit v globálním registru",
    source: "static/data/entities.json",
    semantics:
      "COUNT(DISTINCT canonical id) over the global entity registry — subjects and context entities alike, persons, organizations, public institutions and companies. A multi-typed node counts once.",
    dedupe:
      "By canonical entity id. The same real-world entity appearing in several dossiers has ONE global page and therefore counts once, not once per dossier.",
    publication:
      "Context entities are published pages and are counted. There is no draft state in the entity registry.",
    route: "/entities/",
  },
  {
    id: "claims.total",
    description: "Počet tvrzení napříč všemi dossiery",
    source: "static/data/claims.json",
    semantics:
      "COUNT(DISTINCT canonical id) over every claim record. Claim ids are per-dossier (CLM-01 exists in many dossiers), so identity is the composite/global id carried by the export, never the bare local id.",
    dedupe:
      "By canonical id. Deliberately NOT by summary text — two dossiers may legitimately record the same fact from their own sources.",
    publication: "All claim records in the export are published.",
    route: "/dossiers/",
  },
  {
    id: "sources.total",
    description: "Počet zdrojových záznamů",
    source: "static/data/sources.json",
    semantics:
      "COUNT(DISTINCT canonical id) over every source record. Counts SOURCE RECORDS, not distinct outlets and not distinct URLs — one outlet cited for three separate articles is three records.",
    dedupe:
      "By canonical id. Note this differs from the source-FAMILY grouping used by validate-dossier.mjs to decide corroboration; a family may span several records on purpose.",
    publication: "All source records in the export are published.",
    route: "/dossiers/",
  },
  {
    id: "cases.total",
    description: "Počet kauz",
    source: "static/data/cases.json",
    semantics:
      "COUNT(DISTINCT canonical id) over every case record across all dossiers.",
    dedupe: "By canonical id.",
    publication: "All case records in the export are published.",
    route: "/dossiers/",
  },
  {
    id: "relations.total",
    description: "Počet vztahů v globálním grafu",
    source: "static/data/relations.json",
    semantics:
      "COUNT(DISTINCT canonical id) over curated relation records — the edges hand-authored in data/dossiers/<slug>/graph.toml, each of which must be backed by claims and sources. This is the curated layer, NOT the derived full registry layer of the global graph, which materializes far more edges and is not what /map/ presents as relationships.",
    dedupe:
      "By canonical edge id. Direction is preserved: this project treats a relation as directed, so an inverse is a separate edge only when it is separately authored. The same edge supported by several sources is still one edge.",
    publication: "All relation records in the export are published.",
    route: "/map/",
  },
  {
    id: "gaps.total",
    description: "Počet evidovaných mezer",
    source: "static/data/gaps.json",
    semantics:
      "COUNT(DISTINCT canonical id) over gap records — things the project checked and could not document. Openness is not a finding in either direction; this is a count of recorded uncertainty, not of problems.",
    dedupe: "By canonical id.",
    publication: "All gap records in the export are published.",
    route: "/dossiers/",
  },
];

export const METRICS_BY_ID = new Map(METRIC_DEFINITIONS.map((m) => [m.id, m]));

/**
 * Navigation items that deliberately carry NO badge, with the reason.
 * Recorded here so "why has Dokumentace no number" has an answer in code
 * rather than in someone's memory, and so a future contributor does not
 * invent a decorative metric to fill the gap.
 */
export const INTENTIONALLY_UNMEASURED = {
  home: "Rozcestník, ne kolekce — žádná populace, kterou by číslo popisovalo.",
  docs: "Dokumentační stránky nejsou v kanonickém JSON-LD grafu; počet souborů v content/dokumentace/ není datová metrika a odpovídal by jinému modelu než ostatní badge.",
  concepts:
    "Koncepty jsou taxonomická vrstva mimo JSON-LD export; dokud pro ně neexistuje kolekce ve static/data/, badge by nešel odvodit ze stejného zdroje jako ostatní.",
  data: "Route /data/ prezentuje samotné exporty; počet kolekcí popisuje infrastrukturu, ne obsah, a mísil by dvě různé jednotky v jednom sloupci.",
};

/**
 * Pull the canonical identity out of an export record.
 * Exported for the tests, which assert the fallback order explicitly.
 */
export function canonicalIdentity(record, index) {
  if (record === null || typeof record !== "object") return `#scalar-${index}`;
  for (const key of IDENTITY_KEYS) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  // No identity field at all: fall back to positional identity so the record
  // is still counted exactly once rather than silently collapsing every
  // id-less record into a single bucket.
  return `#anonymous-${index}`;
}

/**
 * Count DISTINCT canonical identities in a collection export.
 * Order-independent by construction: a Set of identities cannot depend on
 * input ordering, which is what the determinism test pins down.
 */
export function countDistinct(records) {
  if (!Array.isArray(records)) {
    throw new TypeError(
      `navigation-metrics: expected a JSON array of records, got ${
        records === null ? "null" : typeof records
      }`,
    );
  }
  const seen = new Set();
  records.forEach((record, index) => seen.add(canonicalIdentity(record, index)));
  return seen.size;
}
