// Shared JSON-LD rules and helpers, used by THREE places that must stay
// consistent: templates emitting embedded JSON-LD (via generated data),
// build-jsonld-exports.mjs (the /data/*.jsonld exports) and the two
// verifiers (verify-jsonld.mjs for built HTML, verify-export.mjs for the
// export files). One definition of "forbidden truth-rating markup", one
// src_type → schema.org @type mapping, one citation-fingerprint formula.
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
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

// Minimal graph.toml reader — same line-oriented parsing as
// build-global-graph.mjs's parseBlocks (kept intentionally simple; the
// files are machine-validated by validate:graph). Reads wherever the
// file physically exists, regardless of dossier_type: self-canonical
// entity dossiers (oto-klempir, alena-schillerova, …) own a graph.toml
// of their own.
export function readGraphToml(root, slug) {
  const file = join(root, "data/dossiers", slug, "graph.toml");
  if (!existsSync(file)) return { nodes: [], edges: [] };
  const text = readFileSync(file, "utf8");
  const blocks = { nodes: [], edges: [], clusters: [], source_families: [], updates: [] };
  const re = /^\[\[(nodes|edges|clusters|source_families|updates)\]\]\s*$/gm;
  const matches = [...text.matchAll(re)];
  for (let i = 0; i < matches.length; i++) {
    const kind = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const body = text.slice(start, end);
    const obj = {};
    for (const m of body.matchAll(/^(\w+)\s*=\s*(.+)$/gm)) {
      const key = m[1];
      const raw = m[2].trim();
      if (raw.startsWith("[")) {
        obj[key] = [...raw.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
      } else if (raw.startsWith('"')) {
        obj[key] = raw.slice(1, -1).replace(/\\"/g, '"');
      } else if (raw === "true" || raw === "false") {
        obj[key] = raw === "true";
      } else if (/^-?\d+$/.test(raw)) {
        obj[key] = parseInt(raw, 10);
      } else {
        obj[key] = raw;
      }
    }
    if (blocks[kind]) blocks[kind].push(obj);
  }
  return { nodes: blocks.nodes, edges: blocks.edges };
}
