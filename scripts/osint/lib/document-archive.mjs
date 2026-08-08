import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "../../..");
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const MANIFEST_PATH = join(ROOT, "data/document-archive.json");
const SOURCE_PATHS = [
  join(ROOT, "data/document-archive-manual.json"),
  join(ROOT, "data/document-archive-ares.json"),
  join(ROOT, "data/document-archive-justice.json"),
  join(ROOT, "data/document-archive-court-noticeboards.json"),
];
const forbiddenKey = /(rodne|narozen|bydliste|pobyt|domaciAdresa|homeAddress)/i;

export function assertPublicBusinessOnly(value, trail = []) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const next = [...trail, key];
    if (forbiddenKey.test(key)) throw new Error(`sensitive official-registry field refused: ${next.join(".")}`);
    assertPublicBusinessOnly(child, next);
  }
}

function readSource(path) {
  if (!existsSync(path)) return { records: [], entitiesWithoutIco: [] };
  const value = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(value.records)) throw new Error(`archive source lacks records[]: ${path}`);
  return value;
}

function recordSort(a, b) {
  return a.registry.localeCompare(b.registry, "cs") || a.title.localeCompare(b.title, "cs") || a.identifier.localeCompare(b.identifier);
}

export function buildDocumentArchive({ write = false, check = false } = {}) {
  const sources = SOURCE_PATHS.map(readSource);
  const records = sources.flatMap((source) => source.records).sort(recordSort);
  const entitiesWithoutIco = sources.find((source) => Array.isArray(source.entitiesWithoutIco) && source.entitiesWithoutIco.length)?.entitiesWithoutIco ?? [];
  const identifiers = new Set();
  const files = new Set();

  for (const record of records) {
    if (identifiers.has(record.identifier)) throw new Error(`duplicate archive identifier: ${record.identifier}`);
    if (files.has(record.file)) throw new Error(`duplicate archive file: ${record.file}`);
    identifiers.add(record.identifier);
    files.add(record.file);
    const bytes = readFileSync(join(ROOT, "static", record.file.replace(/^\//, "")));
    if (sha256(bytes) !== record.sha256) throw new Error(`archive hash mismatch: ${record.file}`);
    if (record.mediaType === "application/json") assertPublicBusinessOnly(JSON.parse(bytes));
  }

  const justiceRecords = records.filter((record) => record.registry === "Sbírka listin – metadata");
  const justiceDocumentBytes = justiceRecords.reduce((sum, record) => sum + (record.documentBytes ?? 0), 0);
  const retrieved = records.map((record) => record.retrieved).filter(Boolean).sort().at(-1) ?? new Date().toISOString().slice(0, 10);
  const manifest = {
    schemaVersion: 1,
    generatedAt: retrieved,
    policy: "Public business-registry identity and filing metadata only. Person birth dates, home addresses and personal identifiers are refused; document PDFs are published only after individual review.",
    counts: {
      records: records.length,
      aresSnapshots: records.filter((record) => record.registry === "ARES").length,
      justiceMetadataSnapshots: justiceRecords.length,
      justiceDocuments: justiceRecords.reduce((sum, record) => sum + (record.documentCount ?? 0), 0),
      justiceDocumentBytes,
      justiceDocumentGigabytes: Number((justiceDocumentBytes / 1024 ** 3).toFixed(2)),
      courtBoardChecks: records.filter((record) => record.registry === "Soudní úřední deska – kontrola").length,
      found: records.filter((record) => record.found).length,
      notFound: records.filter((record) => !record.found).length,
      entitiesWithoutIco: entitiesWithoutIco.length,
    },
    records,
    entitiesWithoutIco,
  };
  const rendered = `${JSON.stringify(manifest, null, 2)}\n`;

  if (check) {
    const committed = readFileSync(MANIFEST_PATH, "utf8");
    if (committed !== rendered) throw new Error("data/document-archive.json is stale; regenerate the archive sources");
  }
  if (write) writeFileSync(MANIFEST_PATH, rendered);
  return manifest;
}
