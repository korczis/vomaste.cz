#!/usr/bin/env node
/*
 * Referential-integrity and modeling-rule check for every dossier's
 * data/dossiers/<slug>/graph.toml. Not a general TOML parser — tailored to
 * this file's flat [[nodes]] / [[edges]] / [[clusters]] / [[source_families]]
 * shape, matching the same approach as validate-dossier.mjs. No network
 * access; deterministic; exits non-zero on any hard error across any
 * dossier. Some checks are warnings only (see WARN vs ERR below) where the
 * site's existing claims registry already uses a looser convention than
 * the strict rule would imply.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const DATA_ROOT = join(ROOT, "data/dossiers");

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const ALLOWED_NODE_TYPES = new Set([
  "person", "political_party", "public_institution", "company", "organization",
  "event", "controversy", "role", "legal_or_administrative_process",
]);
// "single" mirrors the claims registry's own status-single ("1 ZDROJ"): an
// edge resting on exactly one cited source. Until it existed, such an edge
// had to be labelled either "corroborated" (overstating it) or "contextual"
// (understating it, and reserved for uncontested background carrying no
// source of its own) — collapsing two different evidentiary states into one,
// which the constitution's §2 explicitly forbids.
const ALLOWED_EDGE_STATUS = new Set(["corroborated", "single", "disputed", "quote", "contextual"]);
const ALLOWED_RELATIONS = new Set([
  "HOLDS_ROLE", "MEMBER_OF", "APPOINTED_AS", "DEFENDED", "DENIED",
  "ASSOCIATED_WITH_EVENT", "RESPONDED_TO", "DONATED_TO",
  "UNDISCLOSED_INTEREST_IN", "HOLDS_INTEREST_IN", "SUBJECT_OF_PROCEEDING",
  "INVESTIGATED_BY", "PROCEDURALLY_CLOSED_BY", "WARNED_BY", "FOLLOWED_BY",
]);

function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return null;
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
}
function tomlUnescape(str) {
  return str.replace(/\\(.)/g, "$1");
}
function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? tomlUnescape(found[1]) : null;
}
function extractBoolField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*(true|false)`, "m");
  const found = text.match(re);
  return found ? found[1] === "true" : null;
}
function extractIntField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*(-?\\d+)`, "m");
  const found = text.match(re);
  return found ? parseInt(found[1], 10) : null;
}

// --- tailored TOML block parser -----------------------------------------
function parseBlocks(text) {
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
    blocks[kind].push(obj);
  }
  return blocks;
}

function checkClaimsSources(refPrefix, claims, sources, realClaims, realSources) {
  for (const c of claims || []) {
    if (!realClaims.has(c)) err(`${refPrefix}: references ${c}, which does not exist in the claims registry.`);
  }
  for (const s of sources || []) {
    if (!realSources.has(s)) err(`${refPrefix}: references ${s}, which does not exist in the sources registry.`);
  }
}

function validateGraphFor(slug) {
  const BASE = join(DOSSIERS_ROOT, slug);
  const DOSSIER_MD = join(BASE, "_index.md");
  const SRC_DIR = join(BASE, "sources");
  const GAP_DIR = join(BASE, "gaps");
  const GRAPH_TOML = join(DATA_ROOT, slug, "graph.toml");
  const UPDATES_TOML = join(DATA_ROOT, slug, "updates.toml");
  const tag = (msg) => `[${slug}] ${msg}`;

  // --- load real CLM/SRC/GAP ids and this dossier's authorized subjects,
  //     so graph references can be checked against the actual registries
  //     and the actual, on-record authorization — never hardcoded here ---
  const dossierText = readFileSync(DOSSIER_MD, "utf8");
  const fmEnd = dossierText.indexOf("\n+++", 4);
  const authorizedSubjects = new Set(extractArrayField(dossierText.slice(0, fmEnd), "subjects") ?? []);
  if (authorizedSubjects.size === 0) {
    err(tag(`_index.md front matter has no extra.subjects — cannot verify graph subject nodes against an authorized list.`));
  }
  const realClaims = new Set([...dossierText.matchAll(/<a id="(clm-\d+)">/g)].map((m) => m[1].toUpperCase()));
  const realSources = new Set(
    readdirSync(SRC_DIR).filter((f) => /^src-\d+\.md$/.test(f)).map((f) => f.replace(/^src-(\d+)\.md$/, "SRC-$1")),
  );
  const realGaps = new Set(
    readdirSync(GAP_DIR).filter((f) => /^gap-\d+\.md$/.test(f)).map((f) => f.replace(/^gap-(\d+)\.md$/, "GAP-$1")),
  );

  const graphText = readFileSync(GRAPH_TOML, "utf8");
  const { nodes, edges, clusters, source_families: sourceFamilies } = parseBlocks(graphText);

  if (nodes.length === 0) err(tag("No [[nodes]] found — file format may have changed."));
  if (edges.length === 0) err(tag("No [[edges]] found — file format may have changed."));

  // --- nodes ---------------------------------------------------------------
  const nodeIds = new Set();
  const nodeById = new Map();
  let subjectCount = 0;

  for (const n of nodes) {
    if (!n.id) { err(tag("A node is missing an id.")); continue; }
    if (nodeIds.has(n.id)) err(tag(`Duplicate node id: "${n.id}"`));
    nodeIds.add(n.id);
    nodeById.set(n.id, n);

    if (!n.label || !n.label.trim()) err(tag(`Node "${n.id}": empty label.`));
    if (!ALLOWED_NODE_TYPES.has(n.type)) err(tag(`Node "${n.id}": type "${n.type}" is not an allowed node type.`));
    if (![0, 1, 2, 3].includes(n.depth)) err(tag(`Node "${n.id}": depth "${n.depth}" is not 0-3.`));

    if (n.subject) {
      subjectCount++;
      if (n.depth !== 0) err(tag(`Node "${n.id}": subject=true but depth is ${n.depth}, expected 0.`));
      if (!authorizedSubjects.has(n.label)) {
        err(tag(`Node "${n.id}": marked subject=true with label "${n.label}", which is not in this dossier's extra.subjects (AGENTS.md authorization). Adding a new dossier subject requires a separate, explicit, on-record owner authorization.`));
      }
    } else if (n.depth === 0) {
      err(tag(`Node "${n.id}": depth 0 is reserved for subject=true nodes.`));
    }

    checkClaimsSources(tag(`Node "${n.id}"`), n.claims, n.sources, realClaims, realSources);
  }
  if (authorizedSubjects.size > 0 && subjectCount !== authorizedSubjects.size) {
    err(tag(`Expected exactly ${authorizedSubjects.size} subject node(s) (${[...authorizedSubjects].join(", ")}), found ${subjectCount}.`));
  }

  // --- edges -----------------------------------------------------------
  const edgeIds = new Set();
  const seenPairs = new Set();
  const adjacency = new Map();
  for (const id of nodeIds) adjacency.set(id, new Set());

  for (const e of edges) {
    if (!e.id) { err(tag("An edge is missing an id.")); continue; }
    if (edgeIds.has(e.id)) err(tag(`Duplicate edge id: "${e.id}"`));
    edgeIds.add(e.id);

    if (!nodeIds.has(e.source)) err(tag(`Edge "${e.id}": source "${e.source}" does not exist.`));
    if (!nodeIds.has(e.target)) err(tag(`Edge "${e.id}": target "${e.target}" does not exist.`));
    if (e.source === e.target) err(tag(`Edge "${e.id}": self-loop (source === target === "${e.source}"), not explicitly supported.`));

    if (!ALLOWED_RELATIONS.has(e.relation)) err(tag(`Edge "${e.id}": relation "${e.relation}" is not in the allowed vocabulary.`));
    if (!ALLOWED_EDGE_STATUS.has(e.status)) err(tag(`Edge "${e.id}": status "${e.status}" is not one of corroborated|disputed|quote|contextual.`));

    const pairKey = [e.source, e.target, e.relation].join("::");
    if (seenPairs.has(pairKey)) err(tag(`Edge "${e.id}": duplicate edge (same source/target/relation as another edge).`));
    seenPairs.add(pairKey);

    if (e.status !== "contextual") {
      if (!e.claims || e.claims.length === 0) err(tag(`Edge "${e.id}": status "${e.status}" requires at least one CLM-## reference.`));
      if (!e.sources || e.sources.length === 0) err(tag(`Edge "${e.id}": status "${e.status}" requires at least one SRC-## reference.`));
    }
    checkClaimsSources(tag(`Edge "${e.id}"`), e.claims, e.sources, realClaims, realSources);

    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      const sd = nodeById.get(e.source).depth;
      const td = nodeById.get(e.target).depth;
      if (typeof sd === "number" && typeof td === "number" && Math.abs(sd - td) > 1) {
        err(tag(`Edge "${e.id}": connects depth ${sd} to depth ${td} — depth must not jump by more than 1 without explanation (split the path through an intermediate node).`));
      }
      adjacency.get(e.source).add(e.target);
      adjacency.get(e.target).add(e.source);
    }

    // Same rule the claims registry already enforces for status-single: the
    // badge says "1 ZDROJ", so it must actually be one. An edge citing two
    // sources under this status is either mislabelled or its sources are not
    // independent — both need fixing, not a looser check.
    if (e.status === "single" && e.sources && e.sources.length > 1) {
      err(tag(`Edge "${e.id}": status "single" but cites ${e.sources.length} sources (${e.sources.join(", ")}) — use "corroborated" if they are genuinely independent.`));
    }

    if (e.status === "corroborated" && e.sources && e.sources.length) {
      const familyOf = new Map();
      for (const fam of sourceFamilies) for (const s of fam.sources || []) familyOf.set(s, fam.id);
      const effectiveFamilies = new Set(e.sources.map((s) => familyOf.get(s) || s));
      if (effectiveFamilies.size < 2) {
        warn(tag(`Edge "${e.id}": status "corroborated" but all sources (${e.sources.join(", ")}) belong to the same source family — not independently confirmed by this file's own standard.`));
      }
    }
  }

  // --- clusters ----------------------------------------------------------
  const clusterIds = new Set();
  for (const c of clusters) {
    if (!c.id) { err(tag("A cluster is missing an id.")); continue; }
    if (clusterIds.has(c.id)) err(tag(`Duplicate cluster id: "${c.id}"`));
    clusterIds.add(c.id);
    if (!c.label) err(tag(`Cluster "${c.id}": missing label.`));
    checkClaimsSources(tag(`Cluster "${c.id}"`), c.claims, c.sources, realClaims, realSources);
    for (const nid of c.nodes || []) {
      if (!nodeIds.has(nid)) err(tag(`Cluster "${c.id}": references unknown node "${nid}".`));
    }
    for (const g of c.gaps || []) {
      if (!realGaps.has(g)) err(tag(`Cluster "${c.id}": references ${g}, which does not exist in the gaps registry.`));
    }
  }
  for (const n of nodes) {
    if (n.cluster && !clusterIds.has(n.cluster)) err(tag(`Node "${n.id}": references unknown cluster "${n.cluster}".`));
  }

  // --- source families -----------------------------------------------------
  for (const fam of sourceFamilies) {
    if (!fam.id) { err(tag("A source_family is missing an id.")); continue; }
    for (const s of fam.sources || []) {
      if (!realSources.has(s)) err(tag(`Source family "${fam.id}": references ${s}, which does not exist in the sources registry.`));
    }
  }

  // --- update history ------------------------------------------------------
  let updateCount = 0;
  try {
    const updatesText = readFileSync(UPDATES_TOML, "utf8");
    const { updates } = parseBlocks(updatesText);
    updateCount = updates.length;
    for (const u of updates) {
      if (!u.date || !/^\d{4}-\d{2}-\d{2}$/.test(u.date)) err(tag(`Update entry: missing or malformed date "${u.date}".`));
      if (!u.summary || !u.summary.trim()) err(tag(`Update entry "${u.date}": empty summary.`));
      for (const c of [...(u.added_claims || []), ...(u.updated_claims || [])]) {
        if (!realClaims.has(c)) err(tag(`Update entry "${u.date}": references ${c}, which does not exist in the claims registry.`));
      }
      for (const g of [...(u.added_gaps || []), ...(u.closed_gaps || [])]) {
        if (!realGaps.has(g)) err(tag(`Update entry "${u.date}": references ${g}, which does not exist in the gaps registry.`));
      }
      for (const s of u.reviewed_sources || []) {
        if (!realSources.has(s)) err(tag(`Update entry "${u.date}": references ${s}, which does not exist in the sources registry.`));
      }
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  // --- connectivity: every node must have a path to a subject node -------
  const subjectIds = nodes.filter((n) => n.subject).map((n) => n.id);
  if (subjectIds.length) {
    const reachable = new Set(subjectIds);
    const queue = [...subjectIds];
    while (queue.length) {
      const cur = queue.pop();
      for (const next of adjacency.get(cur) || []) {
        if (!reachable.has(next)) { reachable.add(next); queue.push(next); }
      }
    }
    for (const id of nodeIds) {
      if (!reachable.has(id)) err(tag(`Node "${id}": no path to any subject node — orphaned from the dossier's main subjects.`));
    }
  }

  // --- projection parity: every graph node/edge must have exactly one
  // matching, field-identical Zola page — entity pages and relation pages
  // are a projection of this file, not a second hand-maintained dataset
  // (AGENTS.md "Graph data nesmí být ručně duplicitní"). Entities are
  // GLOBAL (content/entities/), not owned by this one dossier — a node
  // here must have a global entity page whose `dossiers` array *contains*
  // this slug (not necessarily every entity page in the whole registry,
  // which may also belong to other dossiers). ---
  const ENTITIES_DIR = join(ROOT, "content", "entities");
  const RELATIONS_DIR = join(BASE, "relations");
  const allEntityFiles = readdirSync(ENTITIES_DIR).filter((f) => f !== "_index.md" && f.endsWith(".md"));
  const entityPageIds = new Set();
  let entitiesInThisDossier = 0;
  for (const file of allEntityFiles) {
    const text = readFileSync(join(ENTITIES_DIR, file), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) { err(tag(`entities/${file}: missing or malformed +++ front matter delimiters`)); continue; }
    const fm = text.slice(0, fmEnd);
    const entityId = extractField(fm, "entity_id");
    const expectedId = file.replace(/\.md$/, "");
    if (!entityId) { err(tag(`entities/${file}: missing required field entity_id`)); continue; }
    if (entityId !== expectedId) err(tag(`entities/${file}: entity_id "${entityId}" does not match filename (expected ${expectedId})`));
    entityPageIds.add(entityId);

    const node = nodeById.get(entityId);
    if (!node) continue; // belongs to a different dossier's graph, not this one
    const entityDossiers = extractArrayField(fm, "dossiers") ?? [];
    if (!entityDossiers.includes(slug)) { err(tag(`entities/${file}: ${entityId} is a node in this dossier's graph.toml but its dossiers list does not include "${slug}"`)); continue; }
    entitiesInThisDossier++;
    // A person can be the SUBJECT of their own dossier and simultaneously
    // appear as depth-1 CONTEXT in another dossier's graph (Andrej Babiš is
    // both: subject of andrej-babis, context in macinka-turek). The global
    // entity page carries exactly one depth/subject/publication_role, so it
    // cannot satisfy both graphs — and it must describe the dossier where
    // the person is the subject, that being the stronger publication state.
    // Depth/subject/role parity is therefore enforced only for the dossier
    // that owns them as its subject; elsewhere the node must merely not
    // claim subject status itself (already checked in the node loop).
    // entity_type / claims / sources parity still apply everywhere.
    const subjectElsewhere = extractField(fm, "publication_role") === "subject" && !node.subject;
    if (extractField(fm, "entity_type") !== node.type) err(tag(`entity "${entityId}": page entity_type does not match graph.toml node type "${node.type}"`));
    if (!subjectElsewhere && extractIntField(fm, "depth") !== node.depth) err(tag(`entity "${entityId}": page depth does not match graph.toml node depth ${node.depth}`));
    if (!subjectElsewhere && Boolean(extractBoolField(fm, "subject")) !== Boolean(node.subject)) err(tag(`entity "${entityId}": page subject flag does not match graph.toml`));
    const expectedRole = node.subject ? "subject" : "context";
    if (!subjectElsewhere && extractField(fm, "publication_role") !== expectedRole) err(tag(`entity "${entityId}": publication_role does not match subject flag (expected "${expectedRole}")`));
    const pageClaims = new Set(extractArrayField(fm, "claims") ?? []);
    const nodeClaims = new Set(node.claims ?? []);
    if ([...nodeClaims].some((c) => !pageClaims.has(c))) err(tag(`entity "${entityId}": page claims do not include all of graph.toml node claims`));
    const pageSources = new Set(extractArrayField(fm, "sources") ?? []);
    const nodeSources = new Set(node.sources ?? []);
    if ([...nodeSources].some((s) => !pageSources.has(s))) err(tag(`entity "${entityId}": page sources do not include all of graph.toml node sources`));
  }
  for (const id of nodeIds) {
    if (!entityPageIds.has(id)) err(tag(`Node "${id}": no matching global entities/${id}.md page — run scripts/dossier/migrate-graph-to-pages.mjs.`));
  }
  if (entitiesInThisDossier !== nodes.length) {
    err(tag(`${entitiesInThisDossier} global entity page(s) reference this dossier but graph.toml has ${nodes.length} node(s) — must match 1:1`));
  }

  const relationFiles = readdirSync(RELATIONS_DIR).filter((f) => f !== "_index.md" && f.endsWith(".md"));
  const relationPageIds = new Set();
  const edgeById = new Map(edges.map((e) => [e.id, e]));
  for (const file of relationFiles) {
    const text = readFileSync(join(RELATIONS_DIR, file), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) { err(tag(`relations/${file}: missing or malformed +++ front matter delimiters`)); continue; }
    const fm = text.slice(0, fmEnd);
    const relId = extractField(fm, "rel_id");
    const expectedId = file.replace(/\.md$/, "");
    if (!relId) { err(tag(`relations/${file}: missing required field rel_id`)); continue; }
    if (relId !== expectedId) err(tag(`relations/${file}: rel_id "${relId}" does not match filename (expected ${expectedId})`));
    if (extractField(fm, "dossier") !== slug) err(tag(`relations/${file}: extra.dossier does not match its own directory "${slug}"`));
    relationPageIds.add(relId);

    const edge = edgeById.get(relId);
    if (!edge) { err(tag(`relations/${file}: ${relId} has a relation page but no matching [[edges]] entry in graph.toml`)); continue; }
    if (extractField(fm, "source") !== edge.source) err(tag(`relation "${relId}": page source does not match graph.toml edge source "${edge.source}"`));
    if (extractField(fm, "target") !== edge.target) err(tag(`relation "${relId}": page target does not match graph.toml edge target "${edge.target}"`));
    if (extractField(fm, "relation_type") !== edge.relation) err(tag(`relation "${relId}": page relation_type does not match graph.toml edge relation "${edge.relation}"`));
    if (extractField(fm, "label") !== edge.label) err(tag(`relation "${relId}": page label does not match graph.toml edge label`));
    if (extractField(fm, "status") !== edge.status) err(tag(`relation "${relId}": page status does not match graph.toml edge status "${edge.status}"`));
    const pageClaims = new Set(extractArrayField(fm, "claims") ?? []);
    const edgeClaims = new Set(edge.claims ?? []);
    if (pageClaims.size !== edgeClaims.size || [...edgeClaims].some((c) => !pageClaims.has(c))) err(tag(`relation "${relId}": page claims do not match graph.toml edge claims`));
    const pageSources = new Set(extractArrayField(fm, "sources") ?? []);
    const edgeSources = new Set(edge.sources ?? []);
    if (pageSources.size !== edgeSources.size || [...edgeSources].some((s) => !pageSources.has(s))) err(tag(`relation "${relId}": page sources do not match graph.toml edge sources`));
    if (!entityPageIds.has(edge.source)) err(tag(`relation "${relId}": source entity "${edge.source}" has no entity page`));
    if (!entityPageIds.has(edge.target)) err(tag(`relation "${relId}": target entity "${edge.target}" has no entity page`));
  }
  for (const id of edgeIds) {
    if (!relationPageIds.has(id)) err(tag(`Edge "${id}": no matching relations/${id}.md page — run scripts/dossier/migrate-graph-to-pages.mjs.`));
  }
  if (relationFiles.length !== edges.length) {
    err(tag(`relations/ has ${relationFiles.length} page(s) but graph.toml has ${edges.length} edge(s) — must match 1:1`));
  }

  return { slug, nodesCount: nodes.length, edgesCount: edges.length, clustersCount: clusters.length, familiesCount: sourceFamilies.length, updateCount, entityPagesCount: entitiesInThisDossier, relationPagesCount: relationFiles.length };
}

// Kontroluje se KAŽDÝ dossier, který má vlastní graph.toml — ne jen
// kanonický. Filtr na `isCanonicalDossier` pocházel z doby, kdy entity
// dossiery nevlastnily žádné záznamy; od chvíle, kdy mají i vlastní graf,
// jejich data touhle bránou vůbec neprocházela.
const dossierSlugs = readdirSync(DOSSIERS_ROOT)
  .filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory())
  .filter((slug) => existsSync(join(DATA_ROOT, slug, "graph.toml")));
if (dossierSlugs.length === 0) {
  console.error("No dossiers found under content/dossiers/.");
  process.exit(1);
}

const results = dossierSlugs.map(validateGraphFor);
for (const r of results) {
  console.log(`[${r.slug}] Checked ${r.nodesCount} nodes, ${r.edgesCount} edges, ${r.clustersCount} clusters, ${r.familiesCount} source families, ${r.updateCount} changelog entries.`);
  console.log(`[${r.slug}] Checked ${r.entityPagesCount} entity page(s) and ${r.relationPagesCount} relation page(s) for parity with graph.toml.`);
}
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s) (non-fatal):`);
  for (const w of warnings) console.log(`  WARN ${w}`);
}
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`\nOK — graph data model passes all referential-integrity and modeling checks across ${dossierSlugs.length} dossier(s).`);
