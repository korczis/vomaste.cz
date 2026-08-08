#!/usr/bin/env node

/**
 * Check current Justice-sector noticeboards only by docket numbers already
 * present in canonical dossier records. Name/birth-data lustration is out of
 * scope. A non-empty response is refused until a human reviews every posting.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildDocumentArchive, sha256 } from "./lib/document-archive.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const QUERY_PATH = join(ROOT, "data/court-noticeboard-queries.json");
const SOURCE_PATH = join(ROOT, "data/document-archive-court-noticeboards.json");
const ARCHIVE_DIR = join(ROOT, "static/documents/court-noticeboards");
const ENDPOINT = "https://infodeska.gov.cz/eudpub/api/v1/vyveseni/vyhledej";
const PORTAL = "https://infodeska.gov.cz/eudpub/";
const allowedRequestKeys = new Set(["kodSubjektu", "cisloSenat", "rejstrik", "cisloBezne", "rocnik"]);
const mode = process.argv.includes("--fetch") ? "fetch" : process.argv.includes("--check") ? "check" : null;

if (!mode) {
  console.error("usage: node scripts/osint/archive-court-noticeboards.mjs --fetch|--check");
  process.exit(1);
}

const queries = JSON.parse(readFileSync(QUERY_PATH, "utf8")).queries;
for (const query of queries) {
  for (const key of Object.keys(query.request)) {
    if (!allowedRequestKeys.has(key)) throw new Error(`noticeboard query contains forbidden field ${key}: ${query.identifier}`);
  }
}

function fetchNoticeboard(request) {
  return execFileSync("curl", [
    "-L", "--fail", "--silent", "--show-error",
    "-H", "Content-Type: application/json", "-H", "Accept: application/json",
    "--data", JSON.stringify(request), ENDPOINT,
  ], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
}

if (mode === "fetch") {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
  const retrieved = new Date().toISOString().slice(0, 10);
  const records = [];
  for (const query of queries) {
    const response = JSON.parse(fetchNoticeboard(query.request));
    if (!Array.isArray(response)) throw new Error(`unexpected noticeboard response: ${query.identifier}`);
    if (response.length > 0) throw new Error(`noticeboard postings require individual privacy review before archival: ${query.identifier} (${response.length})`);
    const archived = `${JSON.stringify({ retrieved, endpoint: ENDPOINT, docket: query.docket, request: query.request, response }, null, 2)}\n`;
    const relativeFile = `documents/court-noticeboards/${query.identifier}.json`;
    writeFileSync(join(ROOT, "static", relativeFile), archived);
    records.push({
      identifier: query.identifier,
      registry: "Soudní úřední deska – kontrola",
      title: `${query.subject} – ${query.docket}`,
      docket: query.docket,
      entity: query.entity,
      dossiers: query.dossiers,
      retrieved,
      sourceUrl: PORTAL,
      file: `/${relativeFile}`,
      mediaType: "application/json",
      sha256: sha256(Buffer.from(archived)),
      found: false,
      matchCount: 0,
    });
  }
  writeFileSync(SOURCE_PATH, `${JSON.stringify({ schemaVersion: 1, generatedAt: retrieved, records }, null, 2)}\n`);
  const manifest = buildDocumentArchive({ write: true });
  console.log(`Court noticeboards: ${records.length} docket-only checks archived; no current postings found.`);
} else {
  const source = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
  if (source.records.length !== queries.length) throw new Error(`court-board coverage mismatch: archive=${source.records.length}, queries=${queries.length}`);
  const expected = queries.map((query) => query.identifier).sort();
  const archived = source.records.map((record) => record.identifier).sort();
  if (JSON.stringify(expected) !== JSON.stringify(archived)) throw new Error("court-board query coverage mismatch");
  for (const record of source.records) {
    const value = JSON.parse(readFileSync(join(ROOT, "static", record.file.replace(/^\//, "")), "utf8"));
    if (!Array.isArray(value.response) || value.response.length !== 0) throw new Error(`unreviewed noticeboard response: ${record.identifier}`);
  }
  buildDocumentArchive({ check: true });
  console.log(`Court-noticeboard archive integrity OK: ${source.records.length} docket-only checks preserved.`);
}
