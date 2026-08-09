#!/usr/bin/env node

/**
 * Verify the local Justice/Sbírka-listin Zone B archive without publishing it.
 *
 * Default mode validates every stored file against inventory.sha256 and every
 * manifest hash. --write-inventory rebuilds that inventory atomically after a
 * trusted local download. --require-complete additionally requires every
 * document ID present in the private raw Justice metadata to be archived.
 * This command is intentionally absent from CI and the public build: Zone B
 * must live on persistent, access-controlled local storage.
 */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";

const PRIVATE_ROOT = process.env.VOMASTE_JUSTICE_ARCHIVE_ROOT || join(homedir(), "dev", "vomaste-archive");
const RAW_DIR = join(PRIVATE_ROOT, "justice-api-metadata");
const DOCUMENT_DIR = join(PRIVATE_ROOT, "sbirka-listin");
const INVENTORY_PATH = join(DOCUMENT_DIR, "inventory.sha256");
const WRITE = process.argv.includes("--write-inventory");
const REQUIRE_COMPLETE = process.argv.includes("--require-complete");

if (!existsSync(DOCUMENT_DIR)) throw new Error(`private Zone B archive missing: ${DOCUMENT_DIR}`);

function walk(dir) {
  return readdirSync(dir).sort().flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function sha256File(path) {
  return new Promise((accept, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => accept(hash.digest("hex")));
  });
}

const allFiles = walk(DOCUMENT_DIR);
const partials = allFiles.filter((path) => path.endsWith(".part"));
if (partials.length) throw new Error(`private Zone B archive contains ${partials.length} partial download(s)`);
const archiveFiles = allFiles.filter((path) => path !== INVENTORY_PATH && !path.endsWith("/manifest.json"));

if (WRITE) {
  const lines = [];
  for (const path of archiveFiles) {
    lines.push(`${await sha256File(path)}  ${relative(DOCUMENT_DIR, path)}`);
  }
  const temporary = `${INVENTORY_PATH}.tmp`;
  writeFileSync(temporary, `${lines.join("\n")}\n`);
  renameSync(temporary, INVENTORY_PATH);
}
if (!existsSync(INVENTORY_PATH)) throw new Error(`private Zone B inventory missing: ${INVENTORY_PATH}`);

const inventory = readFileSync(INVENTORY_PATH, "utf8").trim().split("\n").filter(Boolean).map((line) => {
  const match = /^([a-f0-9]{64})\s{2}(.+)$/.exec(line);
  if (!match) throw new Error(`invalid inventory line: ${line}`);
  const path = isAbsolute(match[2]) ? resolve(match[2]) : resolve(DOCUMENT_DIR, match[2]);
  const rel = relative(DOCUMENT_DIR, path);
  if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`inventory path escapes Zone B: ${match[2]}`);
  return { sha256: match[1], path };
});
const expectedPaths = archiveFiles.map((path) => resolve(path)).sort();
const inventoryPaths = inventory.map((item) => item.path).sort();
if (JSON.stringify(expectedPaths) !== JSON.stringify(inventoryPaths)) {
  throw new Error(`inventory coverage mismatch: files=${expectedPaths.length}, inventory=${inventoryPaths.length}`);
}
for (const item of inventory) {
  if (await sha256File(item.path) !== item.sha256) throw new Error(`private Zone B hash mismatch: ${item.path}`);
}

const rawByIco = new Map();
if (existsSync(RAW_DIR)) {
  for (const name of readdirSync(RAW_DIR).filter((value) => /^\d{8}\.json$/.test(value)).sort()) {
    const raw = JSON.parse(readFileSync(join(RAW_DIR, name), "utf8"));
    const ids = new Set();
    for (const filing of raw.response?.vysledekdetail?.prehledlistin ?? []) {
      for (const detail of filing.detail ?? []) {
        const id = detail.obsah?.digitalnipodoba?.documentid;
        if (id) ids.add(String(id));
      }
    }
    rawByIco.set(name.slice(0, 8), ids);
  }
}

let manifests = 0;
let archivedDocuments = 0;
let unarchivedManifestEntries = 0;
const archivedByIco = new Map();
for (const path of allFiles.filter((value) => value.endsWith("/manifest.json"))) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  if (!/^\d{8}$/.test(manifest.ico ?? "")) throw new Error(`invalid private manifest IČO: ${path}`);
  manifests += 1;
  const ids = new Set();
  for (const document of manifest.documents ?? []) {
    const documentId = document.documentId ?? document.dokument ?? null;
    const local = document.localFile
      ? resolve(join(path, "..", document.localFile))
      : document.localPath
        ? resolve(document.localPath)
        : null;
    const explicitlyIncomplete = document.archived === false || document.downloaded === false;
    if (explicitlyIncomplete) {
      unarchivedManifestEntries += 1;
      continue;
    }
    if (!documentId || !local || !document.sha256) {
      throw new Error(`incomplete private manifest entry: ${path} / ${documentId ?? "unknown"}`);
    }
    if (relative(join(path, ".."), local).startsWith("..")) throw new Error(`manifest path escape: ${path}`);
    if (!existsSync(local)) throw new Error(`manifest file missing: ${local}`);
    if (await sha256File(local) !== document.sha256) throw new Error(`manifest hash mismatch: ${local}`);
    ids.add(String(documentId));
    archivedDocuments += 1;
  }
  archivedByIco.set(manifest.ico, ids);
}

let indexedDocuments = 0;
let missingDocuments = 0;
for (const [ico, ids] of rawByIco) {
  indexedDocuments += ids.size;
  const archived = archivedByIco.get(ico) ?? new Set();
  for (const id of ids) if (!archived.has(id)) missingDocuments += 1;
}
if (REQUIRE_COMPLETE && (missingDocuments || unarchivedManifestEntries)) {
  throw new Error(`private Zone B archive is not complete: ${missingDocuments}/${indexedDocuments} raw-indexed documents missing; ${unarchivedManifestEntries} manifest entries explicitly unarchived`);
}

console.log(`Private Zone B integrity OK: ${inventory.length} physical files, ${archivedDocuments} archived manifest entries, ${manifests} manifests; ${missingDocuments}/${indexedDocuments} raw-indexed documents and ${unarchivedManifestEntries} manifest entries remain unarchived${REQUIRE_COMPLETE ? " (complete required)" : " (reported, not hidden)"}.`);
