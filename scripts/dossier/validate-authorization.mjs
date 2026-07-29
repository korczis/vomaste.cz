#!/usr/bin/env node
/*
 * Enforces the authorization gate described in AGENTS.md: no dossier may
 * exist without a real, dated authorization record, and no context entity
 * may be silently presented as a subject worth its own dossier.
 *
 * This cannot fully validate free-text scope by regex — what it CAN check
 * mechanically:
 *   - every dossier's [extra.authorization] references real, existing
 *     entries in data/authorizations.toml (which is itself a transcription
 *     of AGENTS.md's actual, append-only, human-authored log — this script
 *     trusts that transcription's accuracy, it does not re-derive it)
 *   - every entity referenced as a dossier's `subject_entities` is itself
 *     marked publication_role = "subject" and dossier_enabled = true
 *   - no entity is marked dossier_enabled = true while publication_role
 *     is "context" (a context entity can never claim to be dossier-worthy)
 *   - every authorization record's subjects actually appear as entities
 *
 * A human reviewer is still the actual authority on whether dossier
 * *content* stays within its declared scope — this script only catches
 * structural violations of the subject/context distinction, not prose.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const ENTITIES_ROOT = join(ROOT, "content/entities");
const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");

const errors = [];
const err = (msg) => errors.push(msg);

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
}
function extractBoolField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*(true|false)`, "m");
  const found = text.match(re);
  return found ? found[1] === "true" : null;
}

// --- load the authorization ledger ---
const authText = readFileSync(AUTHORIZATIONS_TOML, "utf8");
const authRe = /\[\[authorizations\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g;
const authorizations = new Map();
let m;
while ((m = authRe.exec(authText))) {
  const block = m[1];
  const id = extractField(block, "id");
  if (!id) continue;
  authorizations.set(id, {
    authorizedAt: extractField(block, "authorized_at"),
    subjects: extractArrayField(block, "subjects"),
    agentsMdSection: extractField(block, "agents_md_section"),
  });
}
if (authorizations.size === 0) err("data/authorizations.toml: no [[authorizations]] entries found.");

// --- load every global entity ---
const entityFiles = readdirSync(ENTITIES_ROOT).filter((f) => f !== "_index.md" && f.endsWith(".md"));
const entityById = new Map();
for (const file of entityFiles) {
  const text = readFileSync(join(ENTITIES_ROOT, file), "utf8");
  const fmEnd = text.indexOf("\n+++", 3);
  if (!text.startsWith("+++") || fmEnd === -1) continue;
  const fm = text.slice(0, fmEnd);
  const id = extractField(fm, "entity_id");
  if (!id) continue;
  const publicationRole = extractField(fm, "publication_role");
  const dossierEnabled = extractBoolField(fm, "dossier_enabled");
  const dossierStatus = extractField(fm, "dossier_status");
  if (!["subject", "context", "referenced"].includes(publicationRole)) {
    err(`entities/${file}: publication_role "${publicationRole}" is not one of subject|context|referenced`);
  }
  if (!["authorized", "not_authorized"].includes(dossierStatus)) {
    err(`entities/${file}: dossier_status "${dossierStatus}" is not one of authorized|not_authorized`);
  }
  if (publicationRole === "context" && dossierEnabled === true) {
    err(`entities/${file}: publication_role is "context" but dossier_enabled is true — a context entity can never be presented as dossier-worthy without a separate, explicit authorization to promote it.`);
  }
  if (publicationRole === "context" && dossierStatus === "authorized") {
    err(`entities/${file}: publication_role is "context" but dossier_status is "authorized" — automation must never self-authorize a dossier for a context entity.`);
  }
  if (publicationRole === "subject" && dossierStatus !== "authorized") {
    err(`entities/${file}: publication_role is "subject" but dossier_status is "${dossierStatus}", not "authorized" — a subject entity must belong to an actually-authorized dossier.`);
  }
  entityById.set(id, { file, publicationRole, dossierEnabled, dossierStatus });
}

// --- check every dossier ---
const dossierSlugs = readdirSync(DOSSIERS_ROOT).filter((f) =>
  statSync(join(DOSSIERS_ROOT, f)).isDirectory(),
);
for (const slug of dossierSlugs) {
  const text = readFileSync(join(DOSSIERS_ROOT, slug, "_index.md"), "utf8");
  const fmEnd = text.indexOf("\n+++", 3);
  const fm = text.slice(0, fmEnd);

  const authBlockMatch = fm.match(/\[extra\.authorization\]\n([\s\S]*?)(?=\n\[|\n*$)/);
  if (!authBlockMatch) {
    err(`[${slug}] has no [extra.authorization] block — every dossier must reference a real authorization record.`);
    continue;
  }
  const authBlock = authBlockMatch[1];
  const authorized = extractBoolField(authBlock, "authorized");
  const recordIds = extractArrayField(authBlock, "record_ids");
  if (authorized !== true) err(`[${slug}] extra.authorization.authorized is not true.`);
  if (recordIds.length === 0) err(`[${slug}] extra.authorization.record_ids is empty — no authorization actually referenced.`);
  for (const rid of recordIds) {
    if (!authorizations.has(rid)) err(`[${slug}] references authorization record "${rid}", which does not exist in data/authorizations.toml.`);
  }

  const subjectEntities = extractArrayField(fm, "subject_entities");
  if (subjectEntities.length === 0) err(`[${slug}] has no extra.subject_entities — cannot verify which entities this dossier is authorized to be about.`);
  for (const eid of subjectEntities) {
    const entity = entityById.get(eid);
    if (!entity) { err(`[${slug}] subject_entities references "${eid}", which has no global entity page.`); continue; }
    if (entity.publicationRole !== "subject") err(`[${slug}] lists "${eid}" as a subject_entity, but entities/${entity.file} has publication_role "${entity.publicationRole}", not "subject".`);
    if (entity.dossierEnabled !== true) err(`[${slug}] lists "${eid}" as a subject_entity, but entities/${entity.file} has dossier_enabled = ${entity.dossierEnabled}, not true.`);
  }

  // Cross-check: the referenced authorization records' own subjects should
  // overlap with this dossier's subject_entities — catches a dossier
  // quietly citing an authorization that was actually about someone else.
  for (const rid of recordIds) {
    const record = authorizations.get(rid);
    if (!record) continue;
    const overlap = record.subjects.some((s) => subjectEntities.includes(s));
    if (!overlap) err(`[${slug}] cites authorization "${rid}" (subjects: ${record.subjects.join(", ")}), which shares no subject with this dossier's own subject_entities (${subjectEntities.join(", ")}).`);
  }
}

// --- report ---
if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — ${dossierSlugs.length} dossier(s) all reference valid authorization records; ${entityFiles.length} entities checked for subject/context consistency.`);
