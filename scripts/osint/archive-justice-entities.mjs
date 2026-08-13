#!/usr/bin/env node

/**
 * Preserve the official Collection of Deeds index for every canonical Czech
 * legal entity carrying an IČO.
 *
 * The Ministry response and the linked files can contain personal data in
 * filenames or document bodies. Raw metadata and documents therefore stay in
 * the private local archive. The public repository receives only a sanitized
 * filing index without registered addresses, filenames or document IDs.
 *
 * Networked metadata pass:
 *   node scripts/osint/archive-justice-entities.mjs --fetch
 * One-time conversion of an older raw public snapshot:
 *   node scripts/osint/archive-justice-entities.mjs --sanitize-existing
 * Private preservation download (never written into Git):
 *   node scripts/osint/archive-justice-entities.mjs --download
 * Offline public-archive integrity check:
 *   node scripts/osint/archive-justice-entities.mjs --check
 */

import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { assertPublicBusinessOnly, buildDocumentArchive, sha256 } from "./lib/document-archive.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const ENTITY_DIR = join(ROOT, "data/dossiers/_shared/entities");
const PUBLIC_DIR = join(ROOT, "static/documents/registry/justice");
const SOURCE_PATH = join(ROOT, "data/document-archive-justice.json");
const PRIVATE_ROOT = process.env.VOMASTE_JUSTICE_ARCHIVE_ROOT || join(homedir(), "dev", "vomaste-archive");
const RAW_DIR = join(PRIVATE_ROOT, "justice-api-metadata");
const DOCUMENT_DIR = join(PRIVATE_ROOT, "sbirka-listin");
const API_BASE = "https://verejnerejstriky.msp.gov.cz/api/sbirka-listin/subjekty";
const DOCUMENT_BASE = "https://verejnerejstriky.msp.gov.cz/dokumenty/sbirka-listin";
const PORTAL = "https://verejnerejstriky.msp.gov.cz/";
const ELIGIBLE_TYPES = new Set(["company", "organization", "political_party", "public_institution"]);
const MODES = ["fetch", "sanitize-existing", "download", "check"];
const mode = MODES.find((candidate) => process.argv.includes(`--${candidate}`));
const maxPerEntityArgument = process.argv.find((argument) => argument.startsWith("--max-per-entity="));
const maxPerEntity = maxPerEntityArgument ? Number(maxPerEntityArgument.split("=")[1]) : Number.POSITIVE_INFINITY;
const concurrencyArgument = process.argv.find((argument) => argument.startsWith("--concurrency="));
const concurrency = concurrencyArgument ? Number(concurrencyArgument.split("=")[1]) : 8;
const resolveIpArgument = process.argv.find((argument) => argument.startsWith("--resolve-ip="));
const resolveIp = resolveIpArgument ? resolveIpArgument.split("=")[1] : null;

if (!mode) {
  console.error(`usage: node scripts/osint/archive-justice-entities.mjs ${MODES.map((value) => `--${value}`).join("|")}`);
  process.exit(1);
}
if (!Number.isInteger(maxPerEntity) && maxPerEntity !== Number.POSITIVE_INFINITY) {
  throw new Error("--max-per-entity must be a positive integer");
}
if (maxPerEntity <= 0) throw new Error("--max-per-entity must be a positive integer");
if (!Number.isInteger(concurrency) || concurrency <= 0 || concurrency > 32) {
  throw new Error("--concurrency must be an integer between 1 and 32");
}
if (resolveIp && !/^[0-9a-f:.]+$/i.test(resolveIp)) throw new Error("--resolve-ip must be a literal IP address");

const entities = readdirSync(ENTITY_DIR)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map((name) => JSON.parse(readFileSync(join(ENTITY_DIR, name), "utf8")))
  .map((entity) => ({
    id: entity.entityId ?? entity.identifier,
    title: entity.title,
    entityType: entity.entityType,
    ico: entity.externalIds?.ico ?? entity.externalIds?.ares ?? null,
    dossiers: [...(entity.dossiers ?? [])].sort(),
  }))
  .filter((entity) => ELIGIBLE_TYPES.has(entity.entityType) && /^\d{8}$/.test(entity.ico ?? ""))
  .sort((a, b) => a.ico.localeCompare(b.ico));

function fetchJustice(ico) {
  // The portal returns a JSON negative result with HTTP 400 for an IČO that
  // has no Collection-of-Deeds subject. Do not use --fail here; transport and
  // TLS errors still make curl fail.
  const resolution = resolveIp ? ["--resolve", `verejnerejstriky.msp.gov.cz:443:${resolveIp}`] : [];
  return execFileSync("curl", [...resolution, "-L", "--silent", "--show-error", "-H", "Accept: application/json", `${API_BASE}/${ico}`], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function filingStats(response) {
  const filings = response.vysledekdetail?.prehledlistin ?? [];
  let documentCount = 0;
  let pageCount = 0;
  let documentBytes = 0;
  let nonDigitizedCount = 0;
  for (const filing of filings) {
    if (filing.digitalizovan !== 1) nonDigitizedCount += 1;
    for (const detail of filing.detail ?? []) {
      const digital = detail.obsah?.digitalnipodoba;
      if (!digital?.documentid) continue;
      documentCount += 1;
      pageCount += digital.pocetstran ?? 0;
      documentBytes += digital.velikost ?? 0;
    }
  }
  return { filingCount: filings.length, documentCount, pageCount, documentBytes, nonDigitizedCount };
}

function rawEnvelope(ico, retrieved, response) {
  return { retrieved, endpoint: `${API_BASE}/${ico}`, response };
}

function sanitizeResponse(ico, retrieved, response) {
  const detail = response.vysledekdetail;
  const identity = detail?.zakladniidentifikacniudaje;
  return {
    schemaNote: "Public preservation index only. Registered addresses, original filenames, document IDs and document contents are kept outside Git pending individual privacy review.",
    retrieved,
    sourceUrl: `${API_BASE}/${ico}`,
    status: response.status ?? "UNKNOWN",
    subject: {
      ico,
      ...(identity?.obchodnijmeno ? { businessName: identity.obchodnijmeno } : {}),
      ...(identity?.spisovaznacka ? { registerReference: identity.spisovaznacka } : {}),
    },
    filings: (detail?.prehledlistin ?? []).map((filing) => ({
      referenceLabel: filing.cislolistiny,
      documentType: filing.typlistiny,
      ...(filing.vzniklistiny ? { createdAt: filing.vzniklistiny } : {}),
      ...(filing.doslonasoud ? { receivedByCourtAt: filing.doslonasoud } : {}),
      ...(filing.zalozenodosl ? { filedAt: filing.zalozenodosl } : {}),
      digitized: filing.digitalizovan === 1,
      files: (filing.detail ?? [])
        .map((item) => item.obsah?.digitalnipodoba)
        .filter((item) => item?.documentid)
        .map((item) => ({ pageCount: item.pocetstran ?? 0, sizeBytes: item.velikost ?? 0 })),
    })),
  };
}

function assertSanitizedPublicIndex(value) {
  assertPublicBusinessOnly(value);
  const serialized = JSON.stringify(value);
  for (const forbidden of ["documentid", "originalFilename", "sidlospolecnosti", "textovaAdresa"]) {
    if (serialized.toLocaleLowerCase("cs").includes(forbidden.toLocaleLowerCase("cs"))) {
      throw new Error(`unsanitized Justice metadata refused: ${forbidden}`);
    }
  }
  if (!Array.isArray(value.filings) || !/^\d{8}$/.test(value.subject?.ico ?? "")) {
    throw new Error("invalid sanitized Justice index shape");
  }
}

function archiveRecord(entity, retrieved, response, publicBytes) {
  return {
    identifier: `justice-metadata-${entity.ico}`,
    registry: "Sbírka listin – metadata",
    title: `Sbírka listin – ${entity.title}`,
    ico: entity.ico,
    entity: entity.id,
    dossiers: entity.dossiers,
    retrieved,
    sourceUrl: PORTAL,
    file: `/documents/registry/justice/${entity.ico}.json`,
    mediaType: "application/json",
    sha256: sha256(publicBytes),
    found: response.status === "OK" && Boolean(response.vysledekdetail?.zakladniidentifikacniudaje),
    ...filingStats(response),
  };
}

function writePublicAndRecord(entity, retrieved, response) {
  const publicIndex = sanitizeResponse(entity.ico, retrieved, response);
  assertSanitizedPublicIndex(publicIndex);
  const bytes = Buffer.from(`${JSON.stringify(publicIndex, null, 2)}\n`);
  writeFileSync(join(PUBLIC_DIR, `${entity.ico}.json`), bytes);
  return archiveRecord(entity, retrieved, response, bytes);
}

function writeSource(records, retrieved) {
  writeFileSync(SOURCE_PATH, `${JSON.stringify({ schemaVersion: 1, generatedAt: retrieved, records }, null, 2)}\n`);
  return buildDocumentArchive({ write: true });
}

function rawPath(ico) {
  return join(RAW_DIR, `${ico}.json`);
}

function saveRaw(ico, envelope) {
  mkdirSync(RAW_DIR, { recursive: true });
  writeFileSync(rawPath(ico), `${JSON.stringify(envelope, null, 2)}\n`);
}

function readRaw(ico) {
  if (!existsSync(rawPath(ico))) throw new Error(`private raw Justice response missing for IČO ${ico}; run --fetch first`);
  return JSON.parse(readFileSync(rawPath(ico), "utf8"));
}

function listPrivateDocuments(ico, response) {
  return (response.vysledekdetail?.prehledlistin ?? []).flatMap((filing) =>
    (filing.detail ?? [])
      .map((item) => item.obsah?.digitalnipodoba)
      .filter((item) => item?.documentid)
      .map((item) => ({
        documentId: String(item.documentid),
        referenceLabel: filing.cislolistiny,
        documentType: filing.typlistiny,
        originalFilename: item.nazev ?? null,
        expectedBytes: item.velikost ?? null,
        pageCount: item.pocetstran ?? null,
        filedAt: filing.zalozenodosl ?? filing.doslonasoud ?? filing.vzniklistiny ?? null,
        sourceUrl: `${DOCUMENT_BASE}/${item.documentid}`,
      })),
  ).sort((a, b) => (b.filedAt ?? "").localeCompare(a.filedAt ?? "") || Number(b.documentId) - Number(a.documentId));
}

function selectedPrivateDocuments(ico, response) {
  return listPrivateDocuments(ico, response).slice(0, maxPerEntity);
}

function isPdf(path) {
  if (!existsSync(path) || statSync(path).size < 4) return false;
  const handle = openSync(path, "r");
  const magic = Buffer.alloc(4);
  readSync(handle, magic, 0, 4, 0);
  closeSync(handle);
  return magic.toString("latin1") === "%PDF";
}

function archiveExtension(document) {
  const match = document.originalFilename?.match(/\.([a-z0-9]{1,8})$/i);
  return match ? match[1].toLocaleLowerCase("en") : "bin";
}

function isCompleteDocument(path, document) {
  if (!existsSync(path) || statSync(path).size === 0) return false;
  if (document.expectedBytes && statSync(path).size !== document.expectedBytes) return false;
  return archiveExtension(document) !== "pdf" || isPdf(path);
}

function sha256File(path) {
  return new Promise((resolveHash, rejectHash) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", rejectHash);
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}

function runCurl(args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn("curl", args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", rejectRun);
    child.on("close", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`curl exited with status ${code}`));
    });
  });
}

async function downloadPrivateArchive() {
  mkdirSync(DOCUMENT_DIR, { recursive: true });
  const total = entities.reduce((sum, entity) => sum + selectedPrivateDocuments(entity.ico, readRaw(entity.ico).response).length, 0);
  let completed = 0;
  let failed = 0;

  for (const entity of entities) {
    const raw = readRaw(entity.ico);
    const allDocuments = listPrivateDocuments(entity.ico, raw.response);
    const documents = allDocuments.slice(0, maxPerEntity);
    if (!documents.length) continue;
    const entityDir = join(DOCUMENT_DIR, entity.ico);
    mkdirSync(entityDir, { recursive: true });
    const manifestPath = join(entityDir, "manifest.json");
    const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { documents: [] };
    const previousById = new Map((previous.documents ?? []).map((item) => [item.documentId, item]));
    const manifest = {
      schemaNote: "Private Zone B preservation archive. Never publish without individual privacy review and a safe derivative.",
      ico: entity.ico,
      entity: entity.id,
      retrievedAt: raw.retrieved,
      selection: {
        strategy: maxPerEntity === Number.POSITIVE_INFINITY ? "all" : "newest-per-entity",
        selectedDocuments: documents.length,
        indexedDocuments: allDocuments.length,
        maxPerEntity: maxPerEntity === Number.POSITIVE_INFINITY ? null : maxPerEntity,
      },
      documents: [],
    };

    async function archiveDocument(document) {
      const extension = archiveExtension(document);
      const localFile = `${document.documentId}.${extension}`;
      const destination = join(entityDir, localFile);
      const partial = `${destination}.part`;
      const legacyPartial = join(entityDir, `${document.documentId}.pdf.part`);
      try {
        const expected = document.expectedBytes;
        if (!isCompleteDocument(destination, document)) {
          if (legacyPartial !== partial && isCompleteDocument(legacyPartial, document) && !existsSync(partial)) {
            renameSync(legacyPartial, partial);
          }
          if (isCompleteDocument(partial, document)) {
            renameSync(partial, destination);
          } else {
            await runCurl(
              [
                ...(resolveIp ? ["--resolve", `verejnerejstriky.msp.gov.cz:443:${resolveIp}`] : []),
                "-L", "--fail", "--silent", "--show-error", "--retry", "3", "--retry-all-errors", "--continue-at", "-", "--output", partial, document.sourceUrl,
              ],
            );
            if (!isCompleteDocument(partial, document)) throw new Error("download failed the file type or size check");
            if (expected && statSync(partial).size !== expected) throw new Error(`size mismatch: ${statSync(partial).size} != ${expected}`);
            renameSync(partial, destination);
          }
        }
        return {
          ...document,
          localFile,
          bytes: statSync(destination).size,
          sha256: await sha256File(destination),
          archivedAt: new Date().toISOString().slice(0, 10),
        };
      } catch (error) {
        failed += 1;
        return { ...document, archived: false, error: error.message, previous: previousById.get(document.documentId) ?? null };
      } finally {
        completed += 1;
      if (completed % 25 === 0 || completed === total) console.log(`Private Justice files: ${completed}/${total}, failures=${failed}`);
      }
    }

    const results = new Array(documents.length);
    let nextIndex = 0;
    async function worker() {
      while (nextIndex < documents.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await archiveDocument(documents[index]);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, documents.length) }, () => worker()));
    manifest.documents = results;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  if (failed) throw new Error(`private Justice archive incomplete: ${failed} download(s) failed`);
  const selection = maxPerEntity === Number.POSITIVE_INFINITY ? "all indexed documents" : `up to ${maxPerEntity} newest documents per entity`;
  console.log(`Private Justice archive complete: ${completed} file(s), ${selection}, under ${DOCUMENT_DIR}`);
}

if (mode === "fetch") {
  mkdirSync(PUBLIC_DIR, { recursive: true });
  mkdirSync(RAW_DIR, { recursive: true });
  const retrieved = new Date().toISOString().slice(0, 10);
  const records = [];
  for (const entity of entities) {
    const response = JSON.parse(fetchJustice(entity.ico));
    saveRaw(entity.ico, rawEnvelope(entity.ico, retrieved, response));
    records.push(writePublicAndRecord(entity, retrieved, response));
  }
  const manifest = writeSource(records, retrieved);
  console.log(`Justice metadata: ${records.length} entities, ${manifest.counts.justiceDocuments} documents, ${manifest.counts.justiceDocumentGigabytes} GiB indexed; raw responses kept outside Git in ${RAW_DIR}.`);
} else if (mode === "sanitize-existing") {
  mkdirSync(PUBLIC_DIR, { recursive: true });
  const records = [];
  for (const entity of entities) {
    const path = join(PUBLIC_DIR, `${entity.ico}.json`);
    const existing = JSON.parse(readFileSync(path, "utf8"));
    const envelope = existing.response ? existing : readRaw(entity.ico);
    if (existing.response) saveRaw(entity.ico, envelope);
    records.push(writePublicAndRecord(entity, envelope.retrieved, envelope.response));
  }
  const retrieved = records.map((record) => record.retrieved).sort().at(-1);
  const manifest = writeSource(records, retrieved);
  console.log(`Sanitized ${records.length} public Justice indexes; ${manifest.counts.justiceDocuments} private documents remain indexed.`);
} else if (mode === "download") {
  await downloadPrivateArchive();
} else {
  const source = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
  const records = source.records;
  if (records.length !== entities.length) throw new Error(`Justice coverage mismatch: archive=${records.length}, eligible=${entities.length}`);
  const expectedIcos = entities.map((entity) => entity.ico).sort();
  const archivedIcos = records.map((record) => record.ico).sort();
  if (JSON.stringify(expectedIcos) !== JSON.stringify(archivedIcos)) throw new Error("Justice archive IČO coverage mismatch");
  for (const record of records) {
    const archived = JSON.parse(readFileSync(join(ROOT, "static", record.file.replace(/^\//, "")), "utf8"));
    assertSanitizedPublicIndex(archived);
  }
  const manifest = buildDocumentArchive({ check: true });
  console.log(`Justice archive integrity OK: ${records.length} sanitized public indexes, ${manifest.counts.justiceDocuments} private document references preserved.`);
}
