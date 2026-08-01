// Shared JSON-LD rules and helpers, used by THREE places that must stay
// consistent: templates emitting embedded JSON-LD (via generated data),
// build-jsonld-exports.mjs (the /data/*.jsonld exports) and the two
// verifiers (verify-jsonld.mjs for built HTML, verify-export.mjs for the
// export files). One definition of "forbidden truth-rating markup", one
// src_type → schema.org @type mapping, one citation-fingerprint formula.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Editorial rules 3 & 7 in mechanical form: claim statuses on this site
// describe SOURCING, not adjudicated truth — the structured data must
// not imply otherwise, in any output (HTML or export).
export const FORBIDDEN_KEYS = new Set(["reviewRating", "ratingValue", "bestRating", "worstRating", "reviewAspect"]);
export const FORBIDDEN_TYPES = new Set(["ClaimReview", "Review", "Rating", "AggregateRating"]);

// Mirror of the @type derivation in templates/macros/jsonld.html
// (ld_source_node). If you change one, change the other — the
// build-jsonld-exports regression test pins them together by comparing
// a sample of built HTML source nodes against export nodes.
export function sourceTypeToLdType(srcType) {
  const st = srcType ?? "";
  if (st.includes("komentář") || st.includes("názor")) return "OpinionNewsArticle";
  if (st.includes("rejstřík") || st.includes("databáze")) return "Dataset";
  if (st.includes("oficiální") || st.includes("primární")) return "Report";
  if (st.includes("zpravodajství") || st.includes("žurnalistika") || st.includes("tabloid") || st.includes("agentura")) return "NewsArticle";
  return "Article";
}

// Interim citation fingerprint per the T-010 ADR
// (docs/adr/dossier-jsonld-provenance-extension.md, "Adopt 1"): SHA-256
// over the url + retrieved + outlet tuple of a cited source. NOT a hash
// of archived page bytes (this project does not archive fetched pages
// yet); it fingerprints the citation itself, so a reader can verify a
// claim still points at exactly the source record it was built on.
// Recomputable by anyone from the visible fields — no secret input.
export function citationFingerprint({ url, retrieved, outlet }) {
  return createHash("sha256")
    .update(`${url ?? ""}\n${retrieved ?? ""}\n${outlet ?? ""}`, "utf8")
    .digest("hex");
}

export function sha256Hex(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

// Walk every {"@type": ...} node in a parsed JSON-LD document.
export function* jsonLdNodes(value) {
  if (Array.isArray(value)) {
    for (const v of value) yield* jsonLdNodes(v);
  } else if (value && typeof value === "object") {
    if (value["@type"]) yield value;
    for (const v of Object.values(value)) yield* jsonLdNodes(v);
  }
}

// base_url from config.toml — get_url() derives absolute URLs from this
// value in templates; scripts must derive @id IRIs from the same single
// source, never a hardcoded host.
export function readBaseUrl(root) {
  const text = readFileSync(join(root, "config.toml"), "utf8");
  const m = text.match(/^base_url\s*=\s*"([^"]+)"/m);
  if (!m) throw new Error("config.toml: base_url not found");
  return m[1].replace(/\/$/, "");
}

// Kurátorovaná grafová vrstva dossieru z KANONICKÉHO modelu (T-028 fáze
// H — dřívější data/dossiers/<slug>/graph.toml zaniklo; jeho obsah nese
// dossier.json `graph` + kanonické relations). Návratový tvar zůstává
// blokový (nodes/edges/clusters/source_families) kvůli dosavadním
// konzumentům (graph-projection, build-jsonld-exports, build-search-index):
//   uzly    — graph.nodes v kurátorském pořadí; type = entityType globální
//             entity (jediný zdroj), subject explicitní flag;
//   hrany   — kanonické relations dossieru v pořadí graph.edges
//             (kurátorské pořadí — stabilita layoutu);
//   clustery a rodiny zdrojů — verbatim z dossier.json (pořadí klíčů
//             zachováno, payloady je nesou beze změny).
import { getCompiledModel, localIds, localPart } from "./compiled-model.mjs";

export function readGraphTomlBlocks(root, slug) {
  const empty = { nodes: [], edges: [], clusters: [], source_families: [], updates: [] };
  const compiled = getCompiledModel(root);
  const record = compiled.records.find((w) => w.registry === "dossier" && w.dossier === slug)?.record;
  const graph = record?.graph;
  if (!graph) return empty;

  const entityById = new Map(compiled.entities.map((w) => [w.record.entityId, w.record]));
  const nodes = (graph.nodes ?? []).map((n) => {
    const entity = entityById.get(n.entity);
    const out = { id: n.entity, type: entity?.entityType ?? null, label: n.label };
    if (n.subject === true) out.subject = true;
    if (n.cluster !== undefined) out.cluster = n.cluster;
    if (n.summary !== undefined) out.summary = n.summary;
    if (n.claims !== undefined) out.claims = n.claims;
    if (n.sources !== undefined) out.sources = n.sources;
    return out;
  });

  const relationById = new Map(
    compiled.records
      .filter((w) => w.dossier === slug && w.registry === "relations")
      .map((w) => [w.record.identifier, w.record]),
  );
  // 1:1 úplnost graph.edges ↔ relations vlastní validate-references R7 —
  // tady se jen projektuje kurátorské pořadí.
  const edges = (graph.edges ?? [])
    .filter((id) => relationById.has(id))
    .map((id) => {
      const r = relationById.get(id);
      const out = {
        id: r.identifier,
        source: localPart(r.sourceEntity?.["@id"]),
        target: localPart(r.targetEntity?.["@id"]),
        relation: r.relationType,
        label: r.label,
        status: r.status,
      };
      const claims = localIds(r.claims);
      const sources = localIds(r.sources);
      if (claims.length || r.claims !== undefined) out.claims = claims;
      if (sources.length || r.sources !== undefined) out.sources = sources;
      if (r.note !== undefined) out.note = r.note;
      return out;
    });

  return {
    nodes,
    edges,
    clusters: structuredClone(graph.clusters ?? []),
    source_families: structuredClone(graph.sourceFamilies ?? []),
    updates: [],
  };
}

// Zpětně kompatibilní {nodes, edges} projekce (build-jsonld-exports).
export function readGraphToml(root, slug) {
  const blocks = readGraphTomlBlocks(root, slug);
  return { nodes: blocks.nodes, edges: blocks.edges };
}
