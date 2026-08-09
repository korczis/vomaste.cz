#!/usr/bin/env node

/**
 * Check current Justice-sector noticeboards only by docket numbers already
 * present in canonical dossier records. Name/birth-data lustration is out of
 * scope. A non-empty response is refused until a human reviews every posting.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { buildDocumentArchive, sha256 } from "./lib/document-archive.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const QUERY_PATH = join(ROOT, "data/court-noticeboard-queries.json");
const INVENTORY_PATH = join(ROOT, "data/court-docket-inventory.json");
const SOURCE_PATH = join(ROOT, "data/document-archive-court-noticeboards.json");
const ARCHIVE_DIR = join(ROOT, "static/documents/court-noticeboards");
const PRIVATE_ROOT = process.env.VOMASTE_JUSTICE_ARCHIVE_ROOT || join(homedir(), "dev", "vomaste-archive");
const RAW_DIR = join(PRIVATE_ROOT, "court-noticeboards-raw");
const ENDPOINT = "https://infodeska.gov.cz/eudpub/api/v1/vyveseni/vyhledej";
const PORTAL = "https://infodeska.gov.cz/eudpub/";
const allowedRequestKeys = new Set(["kodSubjektu", "cisloSenat", "rejstrik", "cisloBezne", "rocnik"]);
const mode = process.argv.includes("--fetch") ? "fetch" : process.argv.includes("--check") ? "check" : null;

if (!mode) {
  console.error("usage: node scripts/osint/archive-court-noticeboards.mjs --fetch|--check");
  process.exit(1);
}

const queries = JSON.parse(readFileSync(QUERY_PATH, "utf8")).queries;
const inventory = JSON.parse(readFileSync(INVENTORY_PATH, "utf8")).entries;
const normalizeDocket = (value) => value.replace(/\s+/g, " ").trim().replace(/-\d+$/, "");

function jsonFiles(dir) {
  return readdirSync(dir).sort().flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? jsonFiles(path) : path.endsWith(".json") ? [path] : [];
  });
}

function documentedDockets() {
  const found = new Set();
  const patterns = [
    /\b(\d+\s+(?:T|To|Cm|C|Co|Nc|Nt|INS|VZV|A|Af|Ad|Afs|As|Ads|Azs|Ao|Ans|Aprk|Komp|Nad|Na|Pst|Vol|E|EXE|EPR|Cdo|Tdo|Tz)\s+\d+\/\d{2,4}(?:-\d+)?)\b/gu,
    /\b((?:I|II|III|IV|Pl)\.\s*ÚS\s*\d+\/\d{2,4})\b/gu,
  ];
  for (const path of jsonFiles(join(ROOT, "data/dossiers"))) {
    const text = readFileSync(path, "utf8");
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) found.add(normalizeDocket(match[1]));
    }
  }
  return [...found].sort((a, b) => a.localeCompare(b, "cs"));
}

function validateInventory() {
  const queryIds = new Set();
  const queryDockets = new Set();
  for (const query of queries) {
    if (queryIds.has(query.identifier)) throw new Error(`duplicate noticeboard query identifier: ${query.identifier}`);
    if (queryDockets.has(normalizeDocket(query.docket))) throw new Error(`duplicate noticeboard docket: ${query.docket}`);
    queryIds.add(query.identifier);
    queryDockets.add(normalizeDocket(query.docket));
    const reconstructed = `${query.request.cisloSenat} ${query.request.rejstrik} ${query.request.cisloBezne}/${query.request.rocnik}`;
    if (normalizeDocket(reconstructed) !== normalizeDocket(query.docket)) {
      throw new Error(`noticeboard request does not match docket ${query.identifier}: ${reconstructed}`);
    }
  }

  const inventoryDockets = new Set();
  for (const item of inventory) {
    const docket = normalizeDocket(item.docket);
    if (inventoryDockets.has(docket)) throw new Error(`duplicate court-docket inventory entry: ${docket}`);
    inventoryDockets.add(docket);
    if (item.status === "queried") {
      const query = queries.find((candidate) => candidate.identifier === item.queryIdentifier);
      if (!query || normalizeDocket(query.docket) !== docket) throw new Error(`inventory query mismatch: ${docket}`);
    } else if (item.status === "external-system") {
      if (!item.reason || !/^https:\/\//.test(item.sourceUrl ?? "")) throw new Error(`external-system inventory entry lacks reason/sourceUrl: ${docket}`);
      if (queryDockets.has(docket)) throw new Error(`external-system docket is also queried: ${docket}`);
    } else {
      throw new Error(`unknown court-docket inventory status: ${item.status}`);
    }
  }
  const documented = documentedDockets();
  const inventoried = [...inventoryDockets].sort((a, b) => a.localeCompare(b, "cs"));
  if (JSON.stringify(documented) !== JSON.stringify(inventoried)) {
    const missing = documented.filter((value) => !inventoryDockets.has(value));
    const stale = inventoried.filter((value) => !documented.includes(value));
    throw new Error(`court-docket inventory mismatch; missing=[${missing.join(", ")}], stale=[${stale.join(", ")}]`);
  }
}

validateInventory();
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
    mkdirSync(RAW_DIR, { recursive: true });
    writeFileSync(join(RAW_DIR, `${query.identifier}-${retrieved}.json`), `${JSON.stringify({ retrieved, endpoint: ENDPOINT, docket: query.docket, request: query.request, response }, null, 2)}\n`);
    if (response.length > 0) throw new Error(`noticeboard postings preserved in private Zone B and require individual privacy review before publication: ${query.identifier} (${response.length})`);
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
  console.log(`Court noticeboards: ${records.length} docket-only checks archived; no current postings found; raw responses preserved outside Git in ${RAW_DIR}.`);
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
  console.log(`Court-noticeboard archive integrity OK: ${source.records.length} docket-only checks preserved; ${inventory.length} documented dockets inventoried across noticeboard and external official systems.`);
}
