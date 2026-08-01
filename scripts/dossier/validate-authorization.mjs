#!/usr/bin/env node
/*
 * Enforces the authorization gate described in AGENTS.md: no dossier may
 * exist without a real, dated authorization record, and no context entity
 * may be silently presented as a subject worth its own dossier.
 *
 * T-028 fáze H: čte VÝHRADNĚ kanonický dataset (compiled model) +
 * data/authorizations.toml (transkripce append-only logu v AGENTS.md —
 * tento skript věří přesnosti transkripce, neodvozuje ji znovu).
 *
 * Mechanické kontroly:
 *   - každý dossier referencuje reálné, existující záznamy
 *     v data/authorizations.toml (authorization.records)
 *   - každá subjektová entita dossieru (dossier.subject, u agregátu
 *     subjekty agregovaných dossierů) je publicationRole = "subject"
 *     a dossierEnabled = true
 *   - žádná entita není dossierEnabled/authorized, dokud je context
 *     (zrcadlí validate-semantics S6 — dvojí jištění autorizační hranice
 *     je tu záměrně, S5/S6 se nikdy negrandfatherují)
 *   - subjekt ⇒ dossierStatus = "authorized"
 *   - kontext ⇒ coverageState ∉ {developing, full}
 *   - každá entita nese provenance.discoveredAt (auditní stopa objevení)
 *   - autorizační záznamy citované dossierem se subjekty překrývají se
 *     subjekty dossieru (dossier nesmí citovat cizí autorizaci)
 *
 * A human reviewer is still the actual authority on whether dossier
 * *content* stays within its declared scope — this script only catches
 * structural violations of the subject/context distinction, not prose.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
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

// --- every global entity (canonical) ---
const compiled = getCompiledModel(ROOT);
const entityById = new Map();
for (const w of compiled.entities) {
  const r = w.record;
  const tag = `entities/${r.entityId}`;
  if (!["subject", "context", "referenced"].includes(r.publicationRole)) {
    err(`${tag}: publicationRole "${r.publicationRole}" is not one of subject|context|referenced`);
  }
  if (!["authorized", "not_authorized"].includes(r.dossierStatus)) {
    err(`${tag}: dossierStatus "${r.dossierStatus}" is not one of authorized|not_authorized`);
  }
  if (r.publicationRole === "context" && r.dossierEnabled === true) {
    err(`${tag}: publicationRole is "context" but dossierEnabled is true — a context entity can never be presented as dossier-worthy without a separate, explicit authorization to promote it.`);
  }
  if (r.publicationRole === "context" && r.dossierStatus === "authorized") {
    err(`${tag}: publicationRole is "context" but dossierStatus is "authorized" — automation must never self-authorize a dossier for a context entity.`);
  }
  if (r.publicationRole === "subject" && r.dossierStatus !== "authorized") {
    err(`${tag}: publicationRole is "subject" but dossierStatus is "${r.dossierStatus}", not "authorized" — a subject entity must belong to an actually-authorized dossier.`);
  }
  const COVERAGE_STATES = ["discovered", "referenced", "contextual", "developing", "full"];
  if (!COVERAGE_STATES.includes(r.coverageState)) {
    err(`${tag}: coverageState "${r.coverageState}" is not one of ${COVERAGE_STATES.join("|")}`);
  }
  if (r.publicationRole === "context" && ["developing", "full"].includes(r.coverageState)) {
    err(`${tag}: publicationRole is "context" but coverageState is "${r.coverageState}" — those two states describe an already-authorized dossier only; a context entity's coverageState must be discovered|referenced|contextual.`);
  }
  if (!r.provenance?.discoveredAt) {
    err(`${tag}: missing provenance.discoveredAt — auditní stopa objevení je povinná.`);
  }
  entityById.set(r.entityId, r);
}

// --- every dossier (canonical) ---
const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");
const dossierBySlug = new Map(dossierWrappers.map((w) => [w.dossier, w.record]));
for (const w of dossierWrappers) {
  const record = w.record;
  const slug = w.dossier;
  const recordIds = record.authorization?.records ?? [];
  if (recordIds.length === 0) {
    err(`[${slug}] has no authorization.records — every dossier must reference a real authorization record.`);
    continue;
  }
  for (const rid of recordIds) {
    if (!authorizations.has(rid)) err(`[${slug}] references authorization record "${rid}", which does not exist in data/authorizations.toml.`);
  }

  // Subjektové entity: vlastní subject, u agregátu subjekty agregovaných
  // dossierů (dřívější front matter subject_entities).
  const subjectEntities = record.subject
    ? [record.subject]
    : (record.aggregates ?? []).map((s) => dossierBySlug.get(s)?.subject).filter(Boolean);
  if (subjectEntities.length === 0) err(`[${slug}] has no derivable subject entities — cannot verify which entities this dossier is authorized to be about.`);
  for (const eid of subjectEntities) {
    const entity = entityById.get(eid);
    if (!entity) { err(`[${slug}] subject entity "${eid}" has no canonical entity record.`); continue; }
    if (entity.publicationRole !== "subject") err(`[${slug}] lists "${eid}" as a subject entity, but its publicationRole is "${entity.publicationRole}", not "subject".`);
    if (entity.dossierEnabled !== true) err(`[${slug}] lists "${eid}" as a subject entity, but its dossierEnabled is ${entity.dossierEnabled}, not true.`);
  }

  // Cross-check: the referenced authorization records' own subjects should
  // overlap with this dossier's subject entities — catches a dossier
  // quietly citing an authorization that was actually about someone else.
  for (const rid of recordIds) {
    const authRecord = authorizations.get(rid);
    if (!authRecord) continue;
    const overlap = authRecord.subjects.some((s) => subjectEntities.includes(s));
    if (!overlap) err(`[${slug}] cites authorization "${rid}" (subjects: ${authRecord.subjects.join(", ")}), which shares no subject with this dossier's own subject entities (${subjectEntities.join(", ")}).`);
  }
}

// --- report ---
if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — ${dossierWrappers.length} dossier(s) all reference valid authorization records; ${compiled.entities.length} entities checked for subject/context consistency.`);
