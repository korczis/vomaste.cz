#!/usr/bin/env node
/*
 * Referential-integrity and modeling-rule check for data/dossier/graph.toml.
 * Not a general TOML parser — tailored to this file's flat [[nodes]] /
 * [[edges]] / [[clusters]] / [[source_families]] shape, matching the same
 * approach as validate-dossier.mjs. No network access; deterministic;
 * exits non-zero on any hard error. Some checks are warnings only (see
 * WARN vs ERR below) where the site's existing claims registry already
 * uses a looser convention than the strict rule would imply.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const GRAPH_TOML = join(ROOT, "data/dossier/graph.toml");
const UPDATES_TOML = join(ROOT, "data/dossier/updates.toml");
const DOSSIER_MD = join(ROOT, "content/dossier/_index.md");
const SRC_DIR = join(ROOT, "content/dossier/zdroje");
const GAP_DIR = join(ROOT, "content/dossier/mezery");

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

const ALLOWED_NODE_TYPES = new Set([
  "person", "political_party", "public_institution", "company", "organization",
  "event", "controversy", "role", "legal_or_administrative_process",
]);
const ALLOWED_EDGE_STATUS = new Set(["corroborated", "disputed", "quote", "contextual"]);
const ALLOWED_RELATIONS = new Set([
  "HOLDS_ROLE", "MEMBER_OF", "APPOINTED_AS", "DEFENDED", "DENIED",
  "ASSOCIATED_WITH_EVENT", "RESPONDED_TO", "DONATED_TO",
  "UNDISCLOSED_INTEREST_IN", "SUBJECT_OF_PROCEEDING", "INVESTIGATED_BY",
  "PROCEDURALLY_CLOSED_BY", "WARNED_BY", "FOLLOWED_BY",
]);
const AUTHORIZED_SUBJECT_LABELS = new Set(["Petr Macinka", "Filip Turek"]);

// --- load real CLM/SRC/GAP ids so graph references can be checked against
//     the actual registries, not just against each other ---------------
const dossierText = readFileSync(DOSSIER_MD, "utf8");
const realClaims = new Set([...dossierText.matchAll(/<a id="(clm-\d+)">/g)].map((m) => m[1].toUpperCase()));
const realSources = new Set(
  readdirSync(SRC_DIR).filter((f) => /^src-\d+\.md$/.test(f)).map((f) => f.replace(/^src-(\d+)\.md$/, "SRC-$1")),
);
const realGaps = new Set(
  readdirSync(GAP_DIR).filter((f) => /^gap-\d+\.md$/.test(f)).map((f) => f.replace(/^gap-(\d+)\.md$/, "GAP-$1")),
);

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

const graphText = readFileSync(GRAPH_TOML, "utf8");
const { nodes, edges, clusters, source_families: sourceFamilies } = parseBlocks(graphText);

if (nodes.length === 0) err("No [[nodes]] found — file format may have changed.");
if (edges.length === 0) err("No [[edges]] found — file format may have changed.");

function checkClaimsSources(refPrefix, claims, sources) {
  for (const c of claims || []) {
    if (!realClaims.has(c)) err(`${refPrefix}: references ${c}, which does not exist in the claims registry.`);
  }
  for (const s of sources || []) {
    if (!realSources.has(s)) err(`${refPrefix}: references ${s}, which does not exist in the sources registry.`);
  }
}

// --- nodes ---------------------------------------------------------------
const nodeIds = new Set();
const nodeById = new Map();
let subjectCount = 0;

for (const n of nodes) {
  if (!n.id) { err("A node is missing an id."); continue; }
  if (nodeIds.has(n.id)) err(`Duplicate node id: "${n.id}"`);
  nodeIds.add(n.id);
  nodeById.set(n.id, n);

  if (!n.label || !n.label.trim()) err(`Node "${n.id}": empty label.`);
  if (!ALLOWED_NODE_TYPES.has(n.type)) err(`Node "${n.id}": type "${n.type}" is not an allowed node type.`);
  if (![0, 1, 2, 3].includes(n.depth)) err(`Node "${n.id}": depth "${n.depth}" is not 0-3.`);

  if (n.subject) {
    subjectCount++;
    if (n.depth !== 0) err(`Node "${n.id}": subject=true but depth is ${n.depth}, expected 0.`);
    if (!AUTHORIZED_SUBJECT_LABELS.has(n.label)) {
      err(`Node "${n.id}": marked subject=true with label "${n.label}", which is not in the authorized subject list (AGENTS.md). Adding a new dossier subject requires a separate, explicit, on-record owner authorization.`);
    }
  } else if (n.depth === 0) {
    err(`Node "${n.id}": depth 0 is reserved for subject=true nodes.`);
  }

  checkClaimsSources(`Node "${n.id}"`, n.claims, n.sources);
  if (n.cluster) {
    // validated below once clusters are parsed
  }
}
if (subjectCount !== 2) err(`Expected exactly 2 subject nodes (Petr Macinka, Filip Turek), found ${subjectCount}.`);

// --- edges -----------------------------------------------------------
const edgeIds = new Set();
const seenPairs = new Set();
const adjacency = new Map(); // undirected, for connectivity check
for (const id of nodeIds) adjacency.set(id, new Set());

for (const e of edges) {
  if (!e.id) { err("An edge is missing an id."); continue; }
  if (edgeIds.has(e.id)) err(`Duplicate edge id: "${e.id}"`);
  edgeIds.add(e.id);

  if (!nodeIds.has(e.source)) err(`Edge "${e.id}": source "${e.source}" does not exist.`);
  if (!nodeIds.has(e.target)) err(`Edge "${e.id}": target "${e.target}" does not exist.`);
  if (e.source === e.target) err(`Edge "${e.id}": self-loop (source === target === "${e.source}"), not explicitly supported.`);

  if (!ALLOWED_RELATIONS.has(e.relation)) err(`Edge "${e.id}": relation "${e.relation}" is not in the allowed vocabulary.`);
  if (!ALLOWED_EDGE_STATUS.has(e.status)) err(`Edge "${e.id}": status "${e.status}" is not one of corroborated|disputed|quote|contextual.`);

  const pairKey = [e.source, e.target, e.relation].join("::");
  if (seenPairs.has(pairKey)) err(`Edge "${e.id}": duplicate edge (same source/target/relation as another edge).`);
  seenPairs.add(pairKey);

  if (e.status !== "contextual") {
    if (!e.claims || e.claims.length === 0) err(`Edge "${e.id}": status "${e.status}" requires at least one CLM-## reference.`);
    if (!e.sources || e.sources.length === 0) err(`Edge "${e.id}": status "${e.status}" requires at least one SRC-## reference.`);
  }
  checkClaimsSources(`Edge "${e.id}"`, e.claims, e.sources);

  if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
    const sd = nodeById.get(e.source).depth;
    const td = nodeById.get(e.target).depth;
    if (typeof sd === "number" && typeof td === "number" && Math.abs(sd - td) > 1) {
      err(`Edge "${e.id}": connects depth ${sd} to depth ${td} — depth must not jump by more than 1 without explanation (split the path through an intermediate node).`);
    }
    adjacency.get(e.source).add(e.target);
    adjacency.get(e.target).add(e.source);
  }

  // Soft check: a "corroborated" edge whose sources all belong to the same
  // source family isn't independently confirmed — matches the site's own
  // "poznámka k nezávislosti" convention, but kept as a warning (not a
  // hard failure) since several pre-existing CLM-## in the claims
  // registry itself are single-sourced and still marked CORROBORATED.
  if (e.status === "corroborated" && e.sources && e.sources.length) {
    const familyOf = new Map();
    for (const fam of sourceFamilies) for (const s of fam.sources || []) familyOf.set(s, fam.id);
    const effectiveFamilies = new Set(e.sources.map((s) => familyOf.get(s) || s));
    if (effectiveFamilies.size < 2) {
      warn(`Edge "${e.id}": status "corroborated" but all sources (${e.sources.join(", ")}) belong to the same source family — not independently confirmed by this file's own standard.`);
    }
  }
}

// --- clusters ----------------------------------------------------------
const clusterIds = new Set();
for (const c of clusters) {
  if (!c.id) { err("A cluster is missing an id."); continue; }
  if (clusterIds.has(c.id)) err(`Duplicate cluster id: "${c.id}"`);
  clusterIds.add(c.id);
  if (!c.label) err(`Cluster "${c.id}": missing label.`);
  checkClaimsSources(`Cluster "${c.id}"`, c.claims, c.sources);
  for (const nid of c.nodes || []) {
    if (!nodeIds.has(nid)) err(`Cluster "${c.id}": references unknown node "${nid}".`);
  }
  for (const g of c.gaps || []) {
    if (!realGaps.has(g)) err(`Cluster "${c.id}": references ${g}, which does not exist in the gaps registry.`);
  }
}
for (const n of nodes) {
  if (n.cluster && !clusterIds.has(n.cluster)) err(`Node "${n.id}": references unknown cluster "${n.cluster}".`);
}

// --- source families -----------------------------------------------------
for (const fam of sourceFamilies) {
  if (!fam.id) { err("A source_family is missing an id."); continue; }
  for (const s of fam.sources || []) {
    if (!realSources.has(s)) err(`Source family "${fam.id}": references ${s}, which does not exist in the sources registry.`);
  }
}

// --- update history (data/dossier/updates.toml) -------------------------
// Every claim/gap the changelog says it added/updated/closed must be real.
let updateCount = 0;
try {
  const updatesText = readFileSync(UPDATES_TOML, "utf8");
  const { updates } = parseBlocks(updatesText);
  updateCount = updates.length;
  for (const u of updates) {
    if (!u.date || !/^\d{4}-\d{2}-\d{2}$/.test(u.date)) err(`Update entry: missing or malformed date "${u.date}".`);
    if (!u.summary || !u.summary.trim()) err(`Update entry "${u.date}": empty summary.`);
    for (const c of [...(u.added_claims || []), ...(u.updated_claims || [])]) {
      if (!realClaims.has(c)) err(`Update entry "${u.date}": references ${c}, which does not exist in the claims registry.`);
    }
    for (const g of [...(u.added_gaps || []), ...(u.closed_gaps || [])]) {
      if (!realGaps.has(g)) err(`Update entry "${u.date}": references ${g}, which does not exist in the gaps registry.`);
    }
    for (const s of u.reviewed_sources || []) {
      if (!realSources.has(s)) err(`Update entry "${u.date}": references ${s}, which does not exist in the sources registry.`);
    }
  }
} catch (e) {
  if (e.code !== "ENOENT") throw e;
  // No changelog file yet is fine — it's optional.
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
    if (!reachable.has(id)) err(`Node "${id}": no path to any subject node — orphaned from the dossier's main subjects.`);
  }
}

console.log(`Checked ${nodes.length} nodes, ${edges.length} edges, ${clusters.length} clusters, ${sourceFamilies.length} source families, ${updateCount} changelog entries.`);
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
console.log("\nOK — graph data model passes all referential-integrity and modeling checks.");
