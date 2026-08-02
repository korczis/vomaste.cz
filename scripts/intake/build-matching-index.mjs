#!/usr/bin/env node
// Read-only entity-matching index builder (PHASE_003.md §4, Variant B —
// no reusable generated index existed with matching-shaped fields, see
// reports/intake/phase-03-matching-inventory.md). Derives one flat,
// deterministically-sorted list from two canonical sources — entity
// dossiers (`data/dossiers/*/dossier.json`, `dossierType: "entity"`) and
// shared registry entities (`data/dossiers/_shared/entities/*.json`) —
// and writes nothing back to either. Matching-relevant fields only: no
// claim text, no source bodies, no narrative content (§4.1).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { normalizePersonName } from "./matching/normalize-person-name.mjs";
import { normalizeOrganizationName } from "./matching/normalize-organization-name.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_DIR = join(ROOT, "data/dossiers");
const ENTITIES_DIR = join(DOSSIERS_DIR, "_shared/entities");

// entityType values that name a "who/what" a candidate could resolve to.
// controversy/event/legal_or_administrative_process/role are excluded —
// they have a title but are not subjects a submitter would be matching
// against (§4.2's "bez nepotřebných narativních textů" extends to
// excluding record kinds that were never subjects in the first place).
const MATCHABLE_ENTITY_TYPES = new Set(["person", "political_party", "public_institution", "company", "organization"]);

function normalizedNameFor(entityType, title) {
  return entityType === "person" ? normalizePersonName(title).comparisonName : normalizeOrganizationName(title).comparisonName;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadDossierSubjects() {
  const rows = [];
  const slugs = readdirSync(DOSSIERS_DIR).filter((name) => statSync(join(DOSSIERS_DIR, name)).isDirectory() && name !== "_shared");
  for (const slug of slugs.sort()) {
    const dossierPath = join(DOSSIERS_DIR, slug, "dossier.json");
    let dossier;
    try {
      dossier = readJson(dossierPath);
    } catch {
      continue;
    }
    if (dossier.dossierType !== "entity") continue; // aggregate views are not a person/org
    rows.push({
      entity_id: dossier.slug,
      entity_type: "person",
      canonical_name: dossier.title,
      normalized_name: normalizedNameFor("person", dossier.title),
      legal_form: null,
      aliases: [],
      normalized_aliases: [],
      identifiers: {},
      dossier_ids: [dossier.slug],
      publication_role: "subject",
      dossier_status: Array.isArray(dossier.authorization?.records) && dossier.authorization.records.length > 0 ? "authorized" : "not_authorized",
    });
  }
  return rows;
}

function loadSharedEntities() {
  const rows = [];
  const files = readdirSync(ENTITIES_DIR).filter((name) => name.endsWith(".json"));
  for (const name of files.sort()) {
    const entity = readJson(join(ENTITIES_DIR, name));
    if (!MATCHABLE_ENTITY_TYPES.has(entity.entityType)) continue;
    const aliases = Array.isArray(entity.alternateNames) ? entity.alternateNames : [];
    const identifiers = entity.externalIds && typeof entity.externalIds === "object" ? entity.externalIds : {};
    const legalForm = entity.entityType === "person" ? null : normalizeOrganizationName(entity.title).legalForm;
    rows.push({
      entity_id: entity.entityId,
      entity_type: entity.entityType,
      canonical_name: entity.title,
      normalized_name: normalizedNameFor(entity.entityType, entity.title),
      legal_form: legalForm,
      aliases,
      normalized_aliases: aliases.map((alias) => normalizedNameFor(entity.entityType, alias)),
      identifiers,
      dossier_ids: Array.isArray(entity.dossiers) ? [...entity.dossiers].sort() : [],
      publication_role: entity.publicationRole ?? "context",
      dossier_status: entity.dossierStatus ?? "not_authorized",
    });
  }
  return rows;
}

function currentCommit() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

// Deterministic total order regardless of filesystem readdir ordering —
// entity_type first (so persons and organizations group together
// predictably), then entity_id ascending.
function sortRows(rows) {
  return [...rows].sort((a, b) => {
    if (a.entity_type !== b.entity_type) return a.entity_type < b.entity_type ? -1 : 1;
    return a.entity_id < b.entity_id ? -1 : a.entity_id > b.entity_id ? 1 : 0;
  });
}

export function buildMatchingIndex({ repositoryCommit } = {}) {
  const entities = sortRows([...loadDossierSubjects(), ...loadSharedEntities()]);
  return {
    schema_version: "1.0.0",
    generated_from_commit: repositoryCommit ?? currentCommit(),
    entity_count: entities.length,
    entities,
  };
}

const DEFAULT_OUT = join(ROOT, "data/generated/intake-matching-index.json");

function main() {
  const outArgIndex = process.argv.indexOf("--out");
  const outPath = outArgIndex >= 0 ? process.argv[outArgIndex + 1] : DEFAULT_OUT;
  const index = buildMatchingIndex({});
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`build-matching-index: wrote ${outPath} (${index.entity_count} entities, commit ${index.generated_from_commit.slice(0, 12)})`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
