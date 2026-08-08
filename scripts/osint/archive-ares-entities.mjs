#!/usr/bin/env node

/**
 * Archive the public ARES identity response for every canonical CZ entity
 * carrying an IČO. Output is intentionally limited to the basic search
 * endpoint: unlike the VR branch it does not disclose birth dates or home
 * addresses of natural persons.
 *
 * Networked archive pass:
 *   node scripts/osint/archive-ares-entities.mjs --fetch
 * Offline integrity check:
 *   node scripts/osint/archive-ares-entities.mjs --check
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const ENTITY_DIR = join(ROOT, "data/dossiers/_shared/entities");
const ARCHIVE_DIR = join(ROOT, "static/documents/registry/ares");
const MANIFEST_PATH = join(ROOT, "data/document-archive.json");
const MANUAL_PATH = join(ROOT, "data/document-archive-manual.json");
const ENDPOINT = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat";
const ARES_ENTITY_TYPES = new Set(["company", "organization", "political_party", "public_institution"]);
const mode = process.argv.includes("--fetch") ? "fetch" : process.argv.includes("--check") ? "check" : null;

if (!mode) {
  console.error("usage: node scripts/osint/archive-ares-entities.mjs --fetch|--check");
  process.exit(1);
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const jsonFiles = readdirSync(ENTITY_DIR).filter((name) => name.endsWith(".json")).sort();
const entities = jsonFiles.map((name) => JSON.parse(readFileSync(join(ENTITY_DIR, name), "utf8")));
const eligible = entities
  .map((entity) => ({
    id: entity.entityId ?? entity.identifier,
    title: entity.title,
    entityType: entity.entityType,
    ico: entity.externalIds?.ico ?? entity.externalIds?.ares ?? null,
    dossiers: [...(entity.dossiers ?? [])].sort(),
  }))
  .filter((entity) => ARES_ENTITY_TYPES.has(entity.entityType) && /^\d{8}$/.test(entity.ico ?? ""))
  .sort((a, b) => a.ico.localeCompare(b.ico));

const forbiddenKey = /(rodne|narozen|bydliste|pobyt|domaciAdresa|homeAddress)/i;
function assertPublicBusinessOnly(value, trail = []) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const next = [...trail, key];
    if (forbiddenKey.test(key)) throw new Error(`sensitive ARES field refused: ${next.join(".")}`);
    assertPublicBusinessOnly(child, next);
  }
}

function fetchAres(ico) {
  const request = JSON.stringify({ ico: [ico], pocet: 1, start: 0 });
  return execFileSync("curl", [
    "-L", "--fail", "--silent", "--show-error",
    "-H", "Content-Type: application/json", "-H", "Accept: application/json",
    "--data", request, ENDPOINT,
  ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
}

if (mode === "fetch") {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
  const retrieved = new Date().toISOString().slice(0, 10);
  const records = [];
  for (const entity of eligible) {
    const raw = fetchAres(entity.ico);
    const response = JSON.parse(raw);
    assertPublicBusinessOnly(response);
    const archived = `${JSON.stringify({ retrieved, endpoint: ENDPOINT, request: { ico: [entity.ico], pocet: 1, start: 0 }, response }, null, 2)}\n`;
    const relativeFile = `documents/registry/ares/${entity.ico}.json`;
    writeFileSync(join(ROOT, "static", relativeFile), archived);
    records.push({
      identifier: `ares-${entity.ico}`,
      registry: "ARES",
      title: entity.title,
      ico: entity.ico,
      entity: entity.id,
      dossiers: entity.dossiers,
      retrieved,
      sourceUrl: ENDPOINT,
      file: `/${relativeFile}`,
      mediaType: "application/json",
      sha256: sha256(Buffer.from(archived)),
      found: (response.ekonomickeSubjekty ?? []).length > 0,
    });
  }
  const withoutIco = entities
    .filter((entity) => ARES_ENTITY_TYPES.has(entity.entityType) && !(entity.externalIds?.ico ?? entity.externalIds?.ares))
    .map((entity) => ({ entity: entity.entityId ?? entity.identifier, title: entity.title, dossiers: [...(entity.dossiers ?? [])].sort() }))
    .sort((a, b) => a.entity.localeCompare(b.entity));
  const manual = JSON.parse(readFileSync(MANUAL_PATH, "utf8")).records;
  for (const record of manual) {
    const bytes = readFileSync(join(ROOT, "static", record.file.replace(/^\//, "")));
    if (sha256(bytes) !== record.sha256) throw new Error(`manual archive hash mismatch: ${record.file}`);
  }
  const allRecords = [...manual, ...records].sort((a, b) => a.registry.localeCompare(b.registry) || a.title.localeCompare(b.title, "cs"));
  const manifest = {
    schemaVersion: 1,
    generatedAt: retrieved,
    policy: "Public business-registry identity responses only. Person birth dates, home addresses and personal identifiers are refused.",
    counts: { records: allRecords.length, aresSnapshots: records.length, found: allRecords.filter((r) => r.found).length, notFound: allRecords.filter((r) => !r.found).length, entitiesWithoutIco: withoutIco.length },
    records: allRecords,
    entitiesWithoutIco: withoutIco,
  };
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Document archive: ${allRecords.length} records (${records.length} ARES snapshots); ${manifest.counts.found} found, ${manifest.counts.notFound} not found; ${withoutIco.length} entities need IČO resolution.`);
} else {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  for (const record of manifest.records) {
    const bytes = readFileSync(join(ROOT, "static", record.file.replace(/^\//, "")));
    if (sha256(bytes) !== record.sha256) throw new Error(`hash mismatch: ${record.file}`);
    if (record.mediaType === "application/json") assertPublicBusinessOnly(JSON.parse(bytes));
  }
  const aresRecords = manifest.records.filter((record) => record.registry === "ARES");
  if (aresRecords.length !== eligible.length) throw new Error(`coverage mismatch: manifest=${aresRecords.length}, eligible=${eligible.length}`);
  console.log(`Document archive integrity OK: ${manifest.records.length} files; ${aresRecords.length} ARES snapshots, full eligible-entity coverage.`);
}
