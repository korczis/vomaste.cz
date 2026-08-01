#!/usr/bin/env node
/*
 * Public JSON-LD export routes — the implementation of coop task T-010,
 * designed in docs/adr/dossier-jsonld-provenance-extension.md.
 *
 * Emits, entirely derived from the compiled canonical dataset (via
 * lib/record-tables.mjs, T-028 fáze G), the dossier registry and the
 * curated graph node layer — dossier.json `graph`, dřív graph.toml (derived, never authored):
 *
 *   static/data/dossiers/<slug>.jsonld  — one full-depth @graph per
 *     registry dossier: Dataset + Person (authorized subjects only) +
 *     every Claim (with `appearance` citations), Source (with
 *     citation fingerprint), Case, Gap and Relation, all cross-linked
 *     by stable @id so the graph is machine-walkable end to end.
 *   static/data/graph.jsonld            — the site-wide union graph,
 *     deduplicated by @id (records shared by entity views keep the
 *     canonical dossier's @id, so the union is loss-free).
 *   static/data/jsonld-manifest.json    — {route, sha256, bytes} per
 *     export, so a downloaded copy can be verified offline with
 *     scripts/dossier/verify-export.mjs ("zreprodukuj build a
 *     zpochybni výsledek").
 *   data/generated/source-fingerprints.json — citation fingerprints for
 *     templates/partials/jsonld.html, so embedded HTML citations carry
 *     the same fingerprint as the export.
 *
 * Editorial constraints honored (and mechanically re-checked by
 * verify-export.mjs): no ClaimReview / rating markup of any kind; no
 * numeric confidence — the categorical status labels are exported as
 * vomaste:status verbatim; schema.org Person is emitted ONLY for
 * authorized dossier subjects — every other person-shaped entity
 * (government roster, graph context nodes) stays a plain Thing with
 * vomaste:entityType, same restriction verify-jsonld.mjs enforces for
 * the built HTML.
 *
 * The vomaste:* vocabulary (@context prefix https://vomaste.cz/ns#) is
 * deliberately minimal and only contains terms actually emitted:
 * status, retrieved, citationFingerprint, entityType, relationType,
 * from/to (the invertible edge pair), basedOnClaim, priority, checked,
 * corroboratedBy/corroborates (the invertible corroboration pair,
 * emitted only where a claim really has ≥2 independent sources), and
 * the types Relation, Case, Gap. `supersedes`/`supersededBy` from the
 * ADR are reserved but NOT emitted — no data models supersession yet,
 * and declaring unused capability would be claimed-but-not-real.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";
import { buildRecordTables } from "./lib/record-tables.mjs";
import { citationFingerprint, readBaseUrl, readGraphToml, sha256Hex, sourceTypeToLdType } from "./lib/jsonld-shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const OUT_DIR = argValue("--out", join(ROOT, "static/data"));
const FINGERPRINTS_OUT = argValue("--fingerprints-out", join(ROOT, "data/generated/source-fingerprints.json"));
const CLAIM_SOURCES_OUT = argValue("--claim-sources-out", join(ROOT, "data/generated/claim-sources.json"));

const BASE = readBaseUrl(ROOT);
const NS = `${BASE}/ns#`;
const CONTEXT = ["https://schema.org", { vomaste: NS }];
const GLOBAL_ROUTE = "/data/graph.jsonld";

const registry = loadDossierRegistry();
const tables = buildRecordTables(ROOT);

// --- id helpers -----------------------------------------------------------

const abs = (path) => `${BASE}${path}`;
const personId = (dossierSlug) => `${abs(`/dossiers/${dossierSlug}/`)}#person`;
const datasetId = (dossierSlug) => abs(`/data/dossiers/${dossierSlug}.jsonld`);
const ref = (id) => ({ "@id": id });

// subject id ("macinka") -> entity dossier registry row
const dossierBySubject = new Map(registry.filter((d) => d.dossierType === "entity" && d.subject).map((d) => [d.subject, d]));
// entity_id -> global /entities/ page row (government roster + context entities)
const entityPageById = new Map(tables.entities.map((e) => [e.entity_id, e]));

// One canonical IRI per graph entity, stable across every export
// document: authorized subjects resolve to their dossier page's #person,
// entities with a real /entities/ page to that page, everything else to
// a fragment of the GLOBAL export document (never the per-dossier one,
// so two exports never mint two IRIs for the same entity).
function entityIri(entityId) {
  const subj = dossierBySubject.get(entityId);
  if (subj) return personId(subj.slug);
  const page = entityPageById.get(entityId);
  if (page) return `${abs(page.url)}#entity`;
  return `${abs(GLOBAL_ROUTE)}#entity-${entityId}`;
}

// --- record selection per dossier ----------------------------------------

// Which physical dossier's records this dossier renders, and how they
// are filtered — the same rule templates/entity-dossier-registry.html
// applies: an entity view includes exactly the canonical dossier's
// records whose `subjects` contain its subject id.
function recordsFor(d) {
  const ownerSlug = d.dossierType === "entity" && d.canonicalDossier && d.canonicalDossier !== d.slug ? d.canonicalDossier : d.slug;
  const owned = (rowsOfKind) => rowsOfKind.filter((r) => r.dossier === ownerSlug);
  const filter = (rowsOfKind) =>
    ownerSlug === d.slug ? owned(rowsOfKind) : owned(rowsOfKind).filter((r) => (r.subjects ?? []).includes(d.subject));
  return {
    ownerSlug,
    claims: filter(tables.claims),
    sources: filter(tables.sources),
    cases: filter(tables.cases),
    gaps: filter(tables.gaps),
    relations: filter(tables.relations),
  };
}

function subjectsOf(d) {
  if (d.dossierType === "entity" && d.subject) return [d.subject];
  if (d.sourceDossiers?.length) {
    return d.sourceDossiers.map((slug) => registry.find((r) => r.slug === slug)?.subject).filter(Boolean);
  }
  return [];
}

// --- node builders --------------------------------------------------------

const claimId = (c) => `${abs(c.url)}#claim`;
const sourceId = (s) => `${abs(s.url)}#source`;

const claimsById = new Map(tables.claims.map((c) => [`${c.dossier}/${c.clm_id}`, c]));
const sourcesById = new Map(tables.sources.map((s) => [`${s.dossier}/${s.src_id}`, s]));

function claimNode(c, ownerSlug, graphNodes) {
  const srcRefs = c.sources
    .map((sid) => sourcesById.get(`${ownerSlug}/${sid}`))
    .filter(Boolean)
    .map((s) => ref(sourceId(s)));
  const aboutRefs = (c.subjects ?? [])
    .filter((sid) => dossierBySubject.has(sid))
    .map((sid) => ref(entityIri(sid)));
  const mentions = graphNodes
    .filter((n) => !n.subject && (n.claims ?? []).includes(c.clm_id))
    .map((n) => ref(entityIri(n.id)));
  const node = {
    "@type": "Claim",
    "@id": claimId(c),
    name: c.clm_id,
    text: c.summary,
    inLanguage: "cs",
    url: abs(c.url),
    "vomaste:status": c.status_label ?? c.status,
    appearance: srcRefs,
    isPartOf: ref(datasetId(ownerSlug)),
  };
  if (aboutRefs.length) node.about = aboutRefs;
  if (mentions.length) node.mentions = mentions;
  // The invertible corroboration pair from the ADR — emitted only where
  // a claim really cites ≥2 sources (the site's own categorical
  // corroboration criterion), never as a computed score.
  if (srcRefs.length >= 2) node["vomaste:corroboratedBy"] = srcRefs;
  return node;
}

function sourceNode(s) {
  const node = {
    "@type": sourceTypeToLdType(s.src_type),
    "@id": sourceId(s),
    name: s.title ?? s.src_id,
    url: s.source_url,
    mainEntityOfPage: abs(s.url),
  };
  if (s.outlet) node.publisher = { "@type": "Organization", name: s.outlet };
  if (s.published) node.datePublished = s.published;
  if (s.retrieved) node["vomaste:retrieved"] = s.retrieved;
  node["vomaste:citationFingerprint"] = citationFingerprint({ url: s.source_url, retrieved: s.retrieved, outlet: s.outlet });
  const corroborates = s.claims
    .map((cid) => claimsById.get(`${s.dossier}/${cid}`))
    .filter((c) => c && c.source_count >= 2)
    .map((c) => ref(claimId(c)));
  if (corroborates.length) node["vomaste:corroborates"] = corroborates;
  return node;
}

function caseNode(k) {
  const node = {
    "@type": "vomaste:Case",
    "@id": `${abs(k.url)}#case`,
    name: k.title,
    url: abs(k.url),
    inLanguage: "cs",
  };
  if (k.period) node.temporalCoverage = k.period;
  if (k.label ?? k.status) node["vomaste:status"] = k.label ?? k.status;
  const aboutRefs = (k.subjects ?? []).filter((sid) => dossierBySubject.has(sid)).map((sid) => ref(entityIri(sid)));
  if (aboutRefs.length) node.about = aboutRefs;
  return node;
}

function gapNode(g, ownerSlug) {
  const node = {
    "@type": "vomaste:Gap",
    "@id": `${abs(g.url)}#gap`,
    name: g.title ?? g.gap_id,
    url: abs(g.url),
    inLanguage: "cs",
  };
  if (g.priority) node["vomaste:priority"] = g.priority;
  if (g.checked) node["vomaste:checked"] = g.checked;
  const based = (g.claims ?? [])
    .map((cid) => claimsById.get(`${ownerSlug}/${cid}`))
    .filter(Boolean)
    .map((c) => ref(claimId(c)));
  if (based.length) node["vomaste:basedOnClaim"] = based;
  return node;
}

function relationNode(r, ownerSlug) {
  const node = {
    "@type": "vomaste:Relation",
    "@id": `${abs(r.url)}#relation`,
    name: r.label,
    url: abs(r.url),
    "vomaste:from": ref(entityIri(r.source)),
    "vomaste:to": ref(entityIri(r.target)),
  };
  if (r.relation_type) node["vomaste:relationType"] = r.relation_type;
  if (r.status) node["vomaste:status"] = r.status;
  const based = (r.claims ?? [])
    .map((cid) => claimsById.get(`${ownerSlug}/${cid}`))
    .filter(Boolean)
    .map((c) => ref(claimId(c)));
  if (based.length) node["vomaste:basedOnClaim"] = based;
  return node;
}

function personNode(subjectId, records) {
  const d = dossierBySubject.get(subjectId);
  const node = {
    "@type": "Person",
    "@id": personId(d.slug),
    name: d.title,
    url: abs(`/dossiers/${d.slug}/`),
  };
  // Role facts only where the dossier's own claim-backed relation graph
  // states them (HOLDS_ROLE edge from the subject) — data-driven, never
  // authored here.
  const role = records.relations.find((r) => r.source === subjectId && r.relation_type === "HOLDS_ROLE");
  if (role) {
    if (role.label) node.jobTitle = role.label;
    node.memberOf = ref(entityIri(role.target));
  }
  return node;
}

function contextEntityNode(entityId, label, entityType) {
  const page = entityPageById.get(entityId);
  const node = {
    // Person markup is restricted to authorized dossier subjects — every
    // other entity (roster members, graph context nodes) is a plain
    // Thing, with its original graph type kept machine-readable in
    // vomaste:entityType. Same restriction verify-jsonld.mjs enforces
    // for built HTML.
    "@type": "Thing",
    "@id": entityIri(entityId),
    name: page?.title ?? label ?? entityId,
  };
  if (entityType) node["vomaste:entityType"] = entityType;
  if (page) {
    node.url = abs(page.url);
    // Fasety, podle kterých entity třídí registr entit v UI. Bez nich by
    // prohlížeč musel skupiny odvozovat z něčeho jiného než z exportu —
    // a „seskupeno podle role/dossieru" by nebylo doložitelné v datech,
    // jen v šabloně. Zdroj je front matter stránky entity, tedy tentýž,
    // ze kterého se generuje /data/entities.json.
    if (page.publication_role) node["vomaste:publicationRole"] = page.publication_role;
    const inDossier = (page.dossiers ?? []).map((slug) => ref(abs(`/dossiers/${slug}/`)));
    if (inDossier.length) node["vomaste:inDossier"] = inDossier;
  }
  return node;
}

// --- per-dossier document -------------------------------------------------

function buildDossierGraph(d) {
  const records = recordsFor(d);
  const graph = readGraphToml(ROOT, records.ownerSlug);
  const includedClaimIds = new Set(records.claims.map((c) => c.clm_id));
  const nodesById = new Map();
  const put = (node) => {
    if (!nodesById.has(node["@id"])) nodesById.set(node["@id"], node);
    return node;
  };

  const subjects = subjectsOf(d);
  for (const sid of subjects) put(personNode(sid, records));

  const graphNodes = graph.nodes.filter(
    (n) => n.subject || (n.claims ?? []).some((cid) => includedClaimIds.has(cid)),
  );
  for (const n of graphNodes) {
    if (dossierBySubject.has(n.id)) continue; // subjects already emitted as Person
    put(contextEntityNode(n.id, n.label, n.type));
  }

  for (const c of records.claims) put(claimNode(c, records.ownerSlug, graph.nodes));
  for (const s of records.sources) put(sourceNode(s));
  for (const k of records.cases) put(caseNode(k));
  for (const g of records.gaps) put(gapNode(g, records.ownerSlug));
  for (const r of records.relations) {
    put(relationNode(r, records.ownerSlug));
    // A relation may point at an entity that carries no claim of its own
    // in this view — still give the reference a resolvable node.
    for (const eid of [r.source, r.target]) {
      if (!dossierBySubject.has(eid) && !nodesById.has(entityIri(eid))) {
        const gn = graph.nodes.find((n) => n.id === eid);
        put(contextEntityNode(eid, gn?.label, gn?.type));
      }
    }
  }

  const parts = [
    ...records.claims.map((c) => ref(claimId(c))),
    ...records.sources.map((s) => ref(sourceId(s))),
    ...records.cases.map((k) => ref(`${abs(k.url)}#case`)),
    ...records.gaps.map((g) => ref(`${abs(g.url)}#gap`)),
    ...records.relations.map((r) => ref(`${abs(r.url)}#relation`)),
  ];
  const dataset = {
    "@type": "Dataset",
    "@id": datasetId(d.slug),
    name: `Dossier — ${d.title}`,
    description: `Strojově čitelný JSON-LD export dossieru „${d.title}“: tvrzení, zdroje, kauzy, mezery a vztahy, každý uzel s odkazem na svou zdrojovou stránku.`,
    url: abs(`/dossiers/${d.slug}/`),
    inLanguage: "cs",
    license: "https://unlicense.org/",
    publisher: { "@type": "Organization", name: "vomaste.cz", url: BASE },
    distribution: {
      "@type": "DataDownload",
      contentUrl: datasetId(d.slug),
      encodingFormat: "application/ld+json",
    },
    hasPart: parts,
  };
  if (subjects.length) dataset.about = subjects.map((sid) => ref(entityIri(sid)));

  const nodes = [dataset, ...[...nodesById.values()].sort((a, b) => a["@id"].localeCompare(b["@id"]))];
  return { "@context": CONTEXT, "@graph": nodes };
}

// --- build all documents --------------------------------------------------

mkdirSync(join(OUT_DIR, "dossiers"), { recursive: true });
mkdirSync(dirname(FINGERPRINTS_OUT), { recursive: true });

const manifest = [];
const write = (relPath, doc) => {
  const body = JSON.stringify(doc, null, 1) + "\n";
  writeFileSync(join(OUT_DIR, relPath), body);
  manifest.push({
    route: `/data/${relPath}`,
    sha256: sha256Hex(Buffer.from(body, "utf8")),
    bytes: Buffer.byteLength(body, "utf8"),
    nodes: doc["@graph"].length,
  });
};

const globalNodes = new Map();
for (const d of [...registry].sort((a, b) => a.slug.localeCompare(b.slug))) {
  const doc = buildDossierGraph(d);
  write(`dossiers/${d.slug}.jsonld`, doc);
  for (const node of doc["@graph"]) {
    // Dedup by @id: records shared between an entity view and its
    // canonical dossier carry identical canonical @ids, so the union is
    // loss-free. First writer wins; documents are built in sorted order,
    // so the result is deterministic.
    if (!globalNodes.has(node["@id"])) globalNodes.set(node["@id"], node);
  }
}

const globalDoc = {
  "@context": CONTEXT,
  "@graph": [
    {
      "@type": "Dataset",
      "@id": abs(GLOBAL_ROUTE),
      name: "vomaste.cz — globální dossier graf",
      description:
        "Sjednocený strojově čitelný JSON-LD graf všech dossierů: tvrzení, zdroje, kauzy, mezery, vztahy a entity, deduplikované podle @id.",
      url: `${BASE}/`,
      inLanguage: "cs",
      license: "https://unlicense.org/",
      publisher: { "@type": "Organization", name: "vomaste.cz", url: BASE },
      distribution: { "@type": "DataDownload", contentUrl: abs(GLOBAL_ROUTE), encodingFormat: "application/ld+json" },
      hasPart: [...registry].sort((a, b) => a.slug.localeCompare(b.slug)).map((d) => ref(datasetId(d.slug))),
    },
    ...[...globalNodes.values()].sort((a, b) => a["@id"].localeCompare(b["@id"])),
  ],
};
write("graph.jsonld", globalDoc);

writeFileSync(
  join(OUT_DIR, "jsonld-manifest.json"),
  JSON.stringify(
    {
      generated_by: "scripts/dossier/build-jsonld-exports.mjs",
      note: "sha256 is computed over the exact bytes of each exported file; verify offline with scripts/dossier/verify-export.mjs.",
      fingerprint_formula: "sha256(url + \"\\n\" + retrieved + \"\\n\" + outlet) per cited source — recomputable from the visible citation fields.",
      exports: manifest,
    },
    null,
    1,
  ) + "\n",
);

// Citation fingerprints for the embedded HTML JSON-LD
// (templates/partials/jsonld.html) — keyed by "<owner dossier>/<SRC-##>",
// exactly the fields a source page's front matter carries.
const fingerprints = {};
for (const s of [...tables.sources].sort((a, b) => `${a.dossier}/${a.src_id}`.localeCompare(`${b.dossier}/${b.src_id}`))) {
  fingerprints[`${s.dossier}/${s.src_id}`] = citationFingerprint({
    url: s.source_url,
    retrieved: s.retrieved,
    outlet: s.outlet,
  });
}
writeFileSync(FINGERPRINTS_OUT, JSON.stringify(fingerprints, null, 1) + "\n");

// Claim → cited source records, keyed "<owner dossier>/<CLM-##>".
// templates/partials/jsonld.html used to resolve this by walking every
// dossier's every registry section for every claim page — quadratic, and
// by far the largest cost in `zola build` once the site passed a few
// hundred claims. The mapping is already known here, so publish it and
// let the template look it up directly.
const claimSources = {};
for (const c of tables.claims) {
  const cited = c.sources
    .map((sid) => sourcesById.get(`${c.dossier}/${sid}`))
    .filter(Boolean)
    .map((s) => ({
      src_id: s.src_id,
      title: s.title,
      outlet: s.outlet,
      src_type: s.src_type,
      url: s.source_url,
      published: s.published,
      retrieved: s.retrieved,
      page_url: s.url,
      fingerprint: citationFingerprint({ url: s.source_url, retrieved: s.retrieved, outlet: s.outlet }),
    }));
  if (cited.length) claimSources[`${c.dossier}/${c.clm_id}`] = cited;
}
// data/generated/ is build output and gitignored, so it is absent from a
// fresh checkout and from the site copies verify-export.test.mjs builds.
// The generator creates its own output directory rather than depending on
// some earlier pipeline step having run first.
mkdirSync(dirname(CLAIM_SOURCES_OUT), { recursive: true });
writeFileSync(CLAIM_SOURCES_OUT, JSON.stringify(claimSources, null, 1) + "\n");

console.log(
  `Wrote ${manifest.length} JSON-LD export(s) to ${OUT_DIR}: ` +
    manifest.map((m) => `${m.route.replace("/data/", "")}=${m.nodes} nodes`).join(", ") +
    `; ${Object.keys(fingerprints).length} citation fingerprint(s) to ${FINGERPRINTS_OUT}.`,
);
