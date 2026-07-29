#!/usr/bin/env node
/*
 * One-time (re-runnable) migration: stamps every canonical claim, source,
 * case, gap, entity and relation record under content/dossiers/<slug>/
 * with `subjects = [...]` — which of the dossier's entity-subjects
 * (currently "macinka", "turek", or both) the record concerns.
 *
 * This is what lets content/dossiers/petr-macinka/ and
 * content/dossiers/filip-turek/ exist as real, separately-routable
 * entity dossiers WITHOUT any physical duplication of claims/sources/
 * cases/entities/relations: those dossiers' registry pages are generated
 * views that filter the single canonical macinka-turek record set by
 * this `subjects` tag and link to the canonical detail page. See
 * AGENTS.md's "Entity dossiers vs. the aggregate view" section.
 *
 * Claim and entity/relation subject membership is an editorial judgment
 * (who is this specific fact actually about), not something mechanically
 * derivable from graph.toml alone — CLAIM_SUBJECTS and RELATION_SUBJECTS
 * below were derived by reading every claim and every edge in
 * data/dossiers/macinka-turek/graph.toml and, where a claim wasn't wired
 * into the graph at all (CLM-34, CLM-35), by reading the claim text
 * itself. Sources/gaps/cases are NOT independently judged — they
 * mechanically inherit the union of the subjects of the claims they
 * already reference, which is the existing, validated source of truth
 * for what a source/gap/case is "about".
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SLUG = process.argv[2] || "macinka-turek";
const BASE = join(ROOT, "content", "dossiers", SLUG);

const M = "macinka";
const T = "turek";
const SHARED = [M, T];

// Derived by reading each claim (see docstring above) — the authoritative
// per-claim editorial classification.
const CLAIM_SUBJECTS = {
  "CLM-01": [T], "CLM-02": [T], "CLM-03": [M], "CLM-04": [T], "CLM-05": [T],
  "CLM-06": SHARED, "CLM-07": [T], "CLM-08": [T], "CLM-09": [T], "CLM-10": [T],
  "CLM-11": [T], "CLM-12": [T], "CLM-13": SHARED, "CLM-14": [M], "CLM-15": [M],
  "CLM-16": [T], "CLM-17": [T], "CLM-18": [T], "CLM-19": [T], "CLM-20": [T],
  "CLM-21": [T], "CLM-22": [M], "CLM-23": [M], "CLM-24": [M], "CLM-25": [T],
  "CLM-26": [T], "CLM-27": [T], "CLM-28": [T], "CLM-29": [T], "CLM-30": [T],
  "CLM-31": [T], "CLM-32": [T], "CLM-33": [T], "CLM-34": [T], "CLM-35": SHARED,
  "CLM-36": SHARED, "CLM-37": SHARED, "CLM-38": [T], "CLM-39": [T], "CLM-40": [M],
  "CLM-41": [T], "CLM-42": [T], "CLM-43": [M], "CLM-44": [T],
  // CLM-45: odložení případu fotografie (hajlování) pro promlčení, 11/2024 — čistě Turek.
  "CLM-45": [T],
};

// Entity (graph node) classification: SHARED iff the entity has a direct
// edge to BOTH "macinka" and "turek" in graph.toml; otherwise the single
// subject it directly connects to. Nodes with no direct subject edge
// (policie, statni-zastupitelstvi, mzdrav, szpi, nemocnice-homolce) are
// classified by which subject's own matter they exclusively serve.
const ENTITY_SUBJECTS = {
  macinka: [M], turek: [T],
  motoriste: SHARED, vlada: SHARED, babis: SHARED, kauza2024: SHARED,
  nehoda2026: SHARED, mzp2026: SHARED, chlad: SHARED,
  gmrgas: [M], klubmotoristu: [M], cerveny: [M],
  ep: [T], greendeal: [T], pavel: [T], kauza2025: [T], trestniozn: [T],
  policie: [T], "statni-zastupitelstvi": [T], mzdrav: [T], szpi: [T],
  "zapper-club": [T], "nemocnice-homolce": [T],
};

// Relation (graph edge) classification. Edges whose source/target is
// literally "macinka" or "turek" default to that subject; the four
// cross-subject "one person acting on the other's matter" edges are
// SHARED; edges between two non-subject nodes are classified by which
// subject's matter they exclusively concern (see script docstring).
const RELATION_SUBJECTS = {
  "edge-macinka-motoriste": [M], "edge-turek-motoriste": [T],
  "edge-motoriste-vlada": SHARED, "edge-babis-vlada": SHARED,
  "edge-turek-ep": [T], "edge-turek-greendeal": [T],
  "edge-turek-kauza2024": [T], "edge-macinka-kauza2024": SHARED,
  "edge-turek-kauza2025": [T], "edge-turek-nehoda2026": [T],
  "edge-macinka-nehoda2026": SHARED, "edge-babis-nehoda2026": [T],
  "edge-macinka-gmrgas": [M], "edge-macinka-klubmotoristu": [M],
  "edge-klubmotoristu-motoriste": [M], "edge-turek-trestniozn": [T],
  "edge-chlad-motoriste": SHARED, "edge-turek-mzp2026": [T],
  "edge-pavel-mzp2026": [T], "edge-turek-pavel": [T],
  "edge-macinka-mzp2026": [M], "edge-cerveny-mzp2026": [M],
  "edge-macinka-cerveny": [M], "edge-nehoda2026-policie": [T],
  "edge-homolce-nehoda2026": [T], "edge-trestniozn-statnizastupitelstvi": [T],
  // Odložení trestního oznámení policií (audit 2026-07-29) — čistě Turek.
  "edge-trestniozn-policie": [T],
  "edge-kauza2025-policie": [T], "edge-turek-zapperclub": [T],
  "edge-zapperclub-mzdrav": [T], "edge-zapperclub-szpi": [T],
  "denik-cz-turek-ministr": [T],
};

function tomlArray(arr) {
  return "[" + arr.map((s) => `"${s}"`).join(", ") + "]";
}

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[(.*?)\\]\\s*$`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
}

function stampSubjects(filePath, subjects) {
  let text = readFileSync(filePath, "utf8");
  const line = `subjects = ${tomlArray(subjects)}`;
  if (/^subjects\s*=/m.test(text)) {
    text = text.replace(/^subjects\s*=.*$/m, line);
  } else {
    const anchorRe = /^(sources\s*=\s*\[.*?\]\s*)$/m;
    if (anchorRe.test(text)) {
      text = text.replace(anchorRe, `$1\n${line}`);
    } else {
      text = text.replace(/^\[extra\]\s*$/m, `[extra]\n${line}`);
    }
  }
  writeFileSync(filePath, text, "utf8");
}

function processRegistry(dir, idField, opts = {}) {
  const files = readdirSync(join(BASE, dir)).filter((f) => f !== "_index.md" && f.endsWith(".md"));
  let n = 0;
  for (const f of files) {
    const filePath = join(BASE, dir, f);
    const text = readFileSync(filePath, "utf8");
    const idMatch = text.match(new RegExp(`^${idField}\\s*=\\s*"([^"]+)"`, "m"));
    if (!idMatch) throw new Error(`${filePath}: missing ${idField}`);
    const recordId = idMatch[1];
    let subjects;
    if (opts.direct) {
      subjects = opts.direct[recordId];
      if (!subjects) throw new Error(`${filePath}: no direct subject mapping for ${recordId}`);
    } else {
      const claims = extractField(text, "claims");
      const set = new Set();
      for (const c of claims) {
        const s = CLAIM_SUBJECTS[c];
        if (!s) throw new Error(`${filePath}: claim ${c} has no subject classification`);
        s.forEach((x) => set.add(x));
      }
      subjects = set.size ? [...set].sort() : [];
      if (!subjects.length) {
        console.warn(`WARN ${filePath}: no claims to derive subjects from — leaving unset`);
        continue;
      }
    }
    stampSubjects(filePath, subjects);
    n++;
  }
  return n;
}

// Entities are global (content/entities/*.md), not dossier-namespaced, and
// already carry a `dossiers = [...]` array recording which dossier(s)
// reference them (see scripts/dossier/authorize-entity.mjs). Rather than
// invent a parallel `subjects` field, this appends "petr-macinka" and/or
// "filip-turek" to that existing array per ENTITY_SUBJECTS — the same
// single source of truth the new entity dossiers' registries filter by.
const DOSSIER_SLUG_FOR_SUBJECT = { macinka: "petr-macinka", turek: "filip-turek" };

function processEntities() {
  const entitiesDir = join(ROOT, "content", "entities");
  const files = readdirSync(entitiesDir).filter((f) => f !== "_index.md" && f.endsWith(".md"));
  let n = 0;
  for (const f of files) {
    const filePath = join(entitiesDir, f);
    const text = readFileSync(filePath, "utf8");
    const idMatch = text.match(/^entity_id\s*=\s*"([^"]+)"/m);
    if (!idMatch) continue;
    const entityId = idMatch[1];
    const subjects = ENTITY_SUBJECTS[entityId];
    if (!subjects) throw new Error(`${filePath}: no subject classification for entity ${entityId}`);
    const existing = extractField(text, "dossiers");
    const newSlugs = subjects.map((s) => DOSSIER_SLUG_FOR_SUBJECT[s]);
    const merged = [...new Set([...existing, ...newSlugs])];
    let newText = text;
    const dossiersLineRe = /^dossiers\s*=\s*\[.*?\]\s*$/m;
    const line = `dossiers = ${tomlArray(merged)}`;
    newText = dossiersLineRe.test(newText) ? newText.replace(dossiersLineRe, line) : newText.replace(/^\[extra\]\s*$/m, `[extra]\n${line}`);
    writeFileSync(filePath, newText, "utf8");
    n++;
  }
  return n;
}

function processRelations() {
  const files = readdirSync(join(BASE, "relations")).filter((f) => f !== "_index.md" && f.endsWith(".md"));
  let n = 0;
  for (const f of files) {
    const filePath = join(BASE, "relations", f);
    const text = readFileSync(filePath, "utf8");
    const idMatch = text.match(/^rel_id\s*=\s*"([^"]+)"/m);
    const relId = idMatch[1];
    const subjects = RELATION_SUBJECTS[relId];
    if (!subjects) throw new Error(`${filePath}: no subject classification for relation ${relId}`);
    stampSubjects(filePath, subjects);
    n++;
  }
  return n;
}

const claimsCount = processRegistry("claims", "clm_id", { direct: CLAIM_SUBJECTS });
const entitiesCount = processEntities();
const relationsCount = processRelations();
const sourcesCount = processRegistry("sources", "src_id");
const casesCount = processRegistry("cases", "case_id");
const gapsCount = processRegistry("gaps", "gap_id");

console.log(
  `[${SLUG}] Tagged ${claimsCount} claims, ${sourcesCount} sources, ${casesCount} cases, ` +
    `${gapsCount} gaps, ${entitiesCount} entities, ${relationsCount} relations with subjects.`,
);
