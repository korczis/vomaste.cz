#!/usr/bin/env node
/*
 * Jednorázový backfill provenience entit (T-028 fáze H, krok 1).
 *
 * Z dnešních content/entities/<id>.md front matter (do fáze H poslední
 * místo, kde provenienční pole žila — viz „Inventář polí, která
 * kanonické schéma nepřenáší" v docs/migrations/json-first-migration-report.md)
 * doplní do kanonických záznamů data/dossiers/_shared/entities/<id>.json
 * aditivní pole:
 *
 *   description            ← top-level `description` (meta description stránky)
 *   provenance.discoveredAt  ← extra.discovered_at
 *   provenance.discoveredVia ← extra.discovered_via
 *   provenance.claimRefs     ← extra.claims   (LOKÁLNÍ id, kontext = entity.dossiers)
 *   provenance.sourceRefs    ← extra.sources  (dtto)
 *   provenance.cluster       ← extra.cluster
 *   provenance.depth         ← extra.depth
 *
 * Vědomě se NEpřenáší:
 *   subject            — derivát publicationRole === "subject" (skript to ověřuje)
 *   government_office/government_party/government_snapshot — kanonický
 *                        vlastník je data/government.toml (skript ověřuje shodu)
 *   generated/record_id/view_model — obálka adaptéru, ne data
 *
 * Idempotentní: druhé spuštění nezmění jediný bajt. Fidelity: každá
 * odchylka derivátů (subject, government pole) je tvrdá chyba — skript
 * nikdy nic „neopraví" tiše.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ENTITIES_MD = join(ROOT, "content/entities");
const ENTITIES_JSON = join(ROOT, "data/dossiers/_shared/entities");
const GOVERNMENT_TOML = join(ROOT, "data/government.toml");

const str = (text, key) =>
  (text.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;
const arr = (text, key) => {
  const m = text.match(new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m"));
  if (!m) return null;
  return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\(.)/g, "$1"));
};
const int = (text, key) => {
  const m = text.match(new RegExp(`^${key}\\s*=\\s*(-?\\d+)\\s*$`, "m"));
  return m ? parseInt(m[1], 10) : null;
};
const bool = (text, key) => {
  const m = text.match(new RegExp(`^${key}\\s*=\\s*(true|false)\\s*$`, "m"));
  return m ? m[1] === "true" : null;
};

// Vládní roster — jen pro fidelity kontrolu (kanonický vlastník government
// polí zůstává data/government.toml, do provenience se neduplikují).
function loadRoster() {
  const text = readFileSync(GOVERNMENT_TOML, "utf8");
  const out = new Map();
  for (const block of text.split(/\n\[\[members\]\]/).slice(1)) {
    const id = str(block, "entity_id");
    if (id) out.set(id, { office: str(block, "office"), party: str(block, "party") ?? "" });
  }
  return out;
}

const roster = loadRoster();
const errors = [];
let updated = 0;
let unchanged = 0;

for (const file of readdirSync(ENTITIES_MD).filter((f) => f !== "_index.md" && f.endsWith(".md"))) {
  const entityId = file.replace(/\.md$/, "");
  const mdText = readFileSync(join(ENTITIES_MD, file), "utf8");
  const fmEnd = mdText.indexOf("\n+++", 3);
  const fm = mdText.slice(0, fmEnd);
  const topFm = fm.slice(0, fm.indexOf("\n[extra]"));

  const jsonPath = join(ENTITIES_JSON, `${entityId}.json`);
  if (!existsSync(jsonPath)) {
    errors.push(`${file}: kanonický záznam ${jsonPath} neexistuje`);
    continue;
  }
  const record = JSON.parse(readFileSync(jsonPath, "utf8"));

  // --- fidelity: deriváty musí sedět, jinak stop -------------------------
  const subject = bool(fm, "subject");
  if (subject !== null && subject !== (record.publicationRole === "subject")) {
    errors.push(`${file}: subject=${subject} nesedí s publicationRole="${record.publicationRole}" — derivace by lhala`);
  }
  const govOffice = str(fm, "government_office");
  if (govOffice !== null) {
    const member = roster.get(entityId);
    if (!member) errors.push(`${file}: government_office bez záznamu v data/government.toml`);
    else if (member.office !== govOffice || (str(fm, "government_party") ?? "") !== member.party) {
      errors.push(`${file}: government_office/party se liší od data/government.toml — kanonický vlastník by lhal`);
    }
  }

  // --- aditivní pole -----------------------------------------------------
  const description = str(topFm, "description");
  const provenance = {};
  const discoveredAt = str(fm, "discovered_at");
  if (discoveredAt !== null) provenance.discoveredAt = discoveredAt;
  const discoveredVia = arr(fm, "discovered_via");
  if (discoveredVia !== null) provenance.discoveredVia = discoveredVia;
  const claims = arr(fm, "claims");
  if (claims !== null) provenance.claimRefs = claims;
  const sources = arr(fm, "sources");
  if (sources !== null) provenance.sourceRefs = sources;
  const cluster = str(fm, "cluster");
  if (cluster !== null) provenance.cluster = cluster;
  const depth = int(fm, "depth");
  if (depth !== null) provenance.depth = depth;

  // --- zápis se stabilním pořadím klíčů: description za title,
  //     provenance před content ------------------------------------------
  const next = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === "description" || key === "provenance") continue; // re-insert níž (idempotence)
    if (key === "content" && Object.keys(provenance).length) next.provenance = provenance;
    next[key] = value;
    if (key === "title" && description !== null) next.description = description;
  }
  if (!("content" in next) && Object.keys(provenance).length) next.provenance = provenance;

  const text = `${JSON.stringify(next, null, 2)}\n`;
  const prev = readFileSync(jsonPath, "utf8");
  if (text === prev) {
    unchanged++;
  } else {
    writeFileSync(jsonPath, text);
    updated++;
  }
}

if (errors.length) {
  console.error(`backfill-entity-provenance: ${errors.length} chyb(a):`);
  for (const e of errors) console.error(`  ERROR ${e}`);
  process.exit(1);
}
console.log(`backfill-entity-provenance: ${updated} záznamů doplněno, ${unchanged} beze změny.`);
