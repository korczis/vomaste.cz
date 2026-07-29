#!/usr/bin/env node
// One-time migration: generate GLOBAL content/entities/<id>.md pages and
// dossier-scoped content/dossiers/<slug>/relations/<edge-id>.md pages from
// data/dossiers/<slug>/graph.toml. Re-runnable: always regenerates from the
// current graph.toml, so that file remains the single source of truth (see
// AGENTS.md "Graph data nesmí být ručně duplicitní" discipline) and these
// pages can never independently drift.
//
// Entities are GLOBAL (content/entities/), not owned by any one dossier —
// the same real-world person/institution can appear in more than one
// dossier, so this script MERGES into an existing entity page (unioning
// `dossiers`/`claims`/`sources`) rather than overwriting it, if a second
// dossier's graph.toml is ever migrated. Relations stay dossier-scoped
// (a dossier's local graph), referencing global entity ids by id only.
//
// Deliberately reuses each node's/edge's own stable id (already unique-
// checked by validate-graph.mjs) as the entity/relation id, rather than
// inventing a parallel "REL-001"-style numbering — one id per object, not
// two. Context (non-subject) entities get a deliberately thin body: no
// invented biography/profile beyond what AGENTS.md's context-node rules
// already authorize (role in the dossier + its own claims/sources).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SLUG = process.argv[2] || "macinka-turek";
const GRAPH_TOML = path.join(ROOT, "data", "dossiers", SLUG, "graph.toml");
const ENTITIES_DIR = path.join(ROOT, "content", "entities");
const RELATIONS_DIR = path.join(ROOT, "content", "dossiers", SLUG, "relations");

function tomlEscape(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function tomlArray(arr) {
  return "[" + (arr || []).map((s) => `"${tomlEscape(s)}"`).join(", ") + "]";
}
function tomlUnescape(str) {
  return str.replace(/\\(.)/g, "$1");
}
function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? tomlUnescape(found[1]) : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => tomlUnescape(x[1]));
}
function union(...arrays) {
  return [...new Set(arrays.flat())];
}

// Same tailored block parser as scripts/dossier/validate-graph.mjs. Must
// recognize every block tag that can appear in graph.toml (not just the
// two this script reads) so block boundaries are computed correctly —
// otherwise the LAST [[edges]] block's body swallows every subsequent
// [[clusters]]/[[source_families]] block's text, corrupting its fields.
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
    if (blocks[kind]) blocks[kind].push(obj);
  }
  return blocks;
}

function main() {
  const graphText = readFileSync(GRAPH_TOML, "utf8");
  const { nodes, edges } = parseBlocks(graphText);

  // Per-node relation ids, for discovered_via provenance — purely
  // descriptive (see docs/entity-discovery.md); never used to decide
  // whether something gets published.
  const relationsByNode = new Map();
  for (const e of edges) {
    for (const nid of [e.source, e.target]) {
      if (!relationsByNode.has(nid)) relationsByNode.set(nid, []);
      relationsByNode.get(nid).push(e.id);
    }
  }

  mkdirSync(ENTITIES_DIR, { recursive: true });
  mkdirSync(RELATIONS_DIR, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);

  nodes.forEach((n, i) => {
    const filePath = path.join(ENTITIES_DIR, `${n.id}.md`);
    let dossiers = [SLUG];
    let claims = n.claims || [];
    let sources = n.sources || [];
    let discoveredAt = today;
    if (existsSync(filePath)) {
      const existing = readFileSync(filePath, "utf8");
      const fmEnd = existing.indexOf("\n+++", 3);
      const fm = existing.slice(0, fmEnd);
      dossiers = union(extractArrayField(fm, "dossiers"), [SLUG]);
      claims = union(extractArrayField(fm, "claims"), n.claims || []);
      sources = union(extractArrayField(fm, "sources"), n.sources || []);
      // discovered_at is when this entity FIRST appeared — never overwritten
      // by a later re-run, the same way `claims`/`sources` accumulate rather
      // than reset.
      discoveredAt = extractField(fm, "discovered_at") || today;
    }

    const relationIds = relationsByNode.get(n.id) || [];
    // Purely descriptive coverage label for reporting — never an input to
    // any publishing decision. Subject entities (already human-authorized)
    // are labeled by the depth of their existing dossier; context entities
    // are capped at "referenced"/"discovered"/"contextual" — "developing"
    // and "full" only ever describe an *already-authorized* dossier, so
    // this label can never read as "on track to become one automatically".
    let coverageState;
    if (n.subject) {
      // Subject entities only ever reach dossier_status="authorized" via
      // scripts/dossier/authorize-entity.mjs, and a dossier's actual claims/
      // sources are authored separately afterward — by the time that's
      // happened, "full" describes it accurately. There is currently no
      // real case of a "developing" (authorized-but-still-being-written)
      // dossier, so this doesn't invent a threshold that isn't real yet.
      coverageState = "full";
    } else if (claims.length === 0) {
      coverageState = "referenced";
    } else if (relationIds.length <= 1) {
      coverageState = "discovered";
    } else {
      coverageState = "contextual";
    }

    const bodyLines = [];
    if (n.subject) {
      bodyLines.push(
        `Hlavní subjekt autorizovaného dossieru. Viz plné znění a kontext v [hlavním přehledu](@/dossiers/${SLUG}/_index.md#kdo).`,
      );
    } else {
      bodyLines.push(
        `Kontextová entita — uvedena, protože se přímo objevuje v citovaném zpravodajství o autorizovaném tématu. Tato stránka neobsahuje samostatný profil mimo tento kontext.`,
      );
      if (n.summary) bodyLines.push("", n.summary);
    }
    const front = `+++
title = "${tomlEscape(n.label)}"
template = "entity.html"
weight = ${i + 1}
aliases = ["/dossiers/${SLUG}/entities/${n.id}/"]

[extra]
record_type = "entity"
entity_id = "${n.id}"
entity_type = "${n.type}"
depth = ${n.depth}
subject = ${n.subject ? "true" : "false"}
publication_role = "${n.subject ? "subject" : "context"}"
dossier_enabled = ${n.subject ? "true" : "false"}
dossier_status = "${n.subject ? "authorized" : "not_authorized"}"
coverage_state = "${coverageState}"
discovered_at = "${discoveredAt}"
discovered_via = ${tomlArray(relationIds)}
dossiers = ${tomlArray(dossiers)}
${n.cluster ? `cluster = "${tomlEscape(n.cluster)}"\n` : ""}claims = ${tomlArray(claims)}
sources = ${tomlArray(sources)}
+++

${bodyLines.join("\n")}
`;
    writeFileSync(filePath, front, "utf8");
  });

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  edges.forEach((e, i) => {
    const sourceLabel = nodeById.get(e.source)?.label ?? e.source;
    const targetLabel = nodeById.get(e.target)?.label ?? e.target;
    const bodyLines = [];
    if (e.status === "contextual") {
      bodyLines.push(
        `Kontextový, strukturální vztah — dossier jej neuvádí jako vlastní doloženou investigaci, jen jako veřejně nesporné pozadí.`,
      );
      if (e.note) bodyLines.push("", e.note);
    } else {
      const statusText = { corroborated: "nezávisle potvrzený fakt", quote: "citovaný výrok, ne hodnocení tohoto webu", disputed: "sporné, neuzavřené tvrzení" }[e.status] || e.status;
      bodyLines.push(
        `Viz plné znění, kontext a sousední tvrzení v [hlavním přehledu](@/dossiers/${SLUG}/_index.md#graf-vztahu). Status: ${statusText}.`,
      );
    }
    const front = `+++
title = "${tomlEscape(sourceLabel)} — ${tomlEscape(e.label)} — ${tomlEscape(targetLabel)}"
template = "dossier-relation.html"
weight = ${i + 1}

[extra]
dossier = "${SLUG}"
record_type = "relation"
rel_id = "${e.id}"
source = "${e.source}"
target = "${e.target}"
relation_type = "${e.relation}"
label = "${tomlEscape(e.label)}"
status = "${e.status}"
${e.note ? `note = "${tomlEscape(e.note)}"\n` : ""}claims = ${tomlArray(e.claims)}
sources = ${tomlArray(e.sources)}
+++

${bodyLines.join("\n")}
`;
    writeFileSync(path.join(RELATIONS_DIR, `${e.id}.md`), front, "utf8");
  });

  console.log(`Generated/updated ${nodes.length} global entity page(s) in ${ENTITIES_DIR}`);
  console.log(`Generated ${edges.length} relation page(s) in ${RELATIONS_DIR}`);
}

main();
