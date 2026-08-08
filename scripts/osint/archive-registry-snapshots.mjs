#!/usr/bin/env node
/*
 * Preservation archive for public-registry evidence already cited (or
 * directly tied to an already-cited entity) in the canonical dataset —
 * the point being that a primary source can disappear from the internet,
 * and this project cites it by URL, not by a locally-preserved copy.
 *
 * Implements the constitutional distinction added 2026-08-08 to
 * docs/constitution/OPEN_INTELLIGENCE_COMMONS.md §4 ("Doplnění,
 * 2026-08-08"): source publicness and content safety are two different
 * axes.
 *
 *   - STRUCTURED registry data (ARES VR JSON) may enter the public repo
 *     automatically, same as scripts/osint/expand-entity.mjs already does
 *     for context entities — this script reuses the identical
 *     stripPersonalData() exclusion (no datumNarozeni, no adresa of a
 *     natural person) so the "automatic" claim stays honest. Written to
 *     data/archive/ares-snapshots/<ico>.json.
 *
 *   - The Sbírka listin DOCUMENT INDEX (title, type, dates — no document
 *     content) is likewise safe metadata and is written to
 *     data/archive/sbirka-listin-index/<ico>.json.
 *
 *   - The actual scanned PDF DOCUMENTS are never written into this
 *     repository. They routinely name third parties (co-founders,
 *     notaries) and carry personal identifiers no per-source publicness
 *     test excuses (verified in practice 2026-08-06/07 on martin-pavlik:
 *     a HYDROPROGRESS notarial deed pulled from or.justice.cz named an
 *     unrelated new shareholder). They are downloaded to a LOCAL,
 *     non-Git archive outside this repository
 *     (ARCHIVE_ROOT below, default ~/dev/vomaste-archive/sbirka-listin/)
 *     for the site owner's own reference, with a manifest for
 *     provenance/chain-of-custody. Publishing any one of them requires a
 *     human to open it, redact third-party personal data, and add it as
 *     a reviewed derivative — this script does not do that step.
 *
 * Live network calls, never part of `npm run build`.
 *
 * Usage:
 *   node scripts/osint/archive-registry-snapshots.mjs --ico=04449461
 *   node scripts/osint/archive-registry-snapshots.mjs --ico=04449461,01529820,02922703,26228548,28274318
 *   node scripts/osint/archive-registry-snapshots.mjs --from-entities [--enrich] [--skip-existing]
 *
 * --from-entities walks every canonical entity of an IČO-bearing type
 * (company, organization, public_institution, political_party):
 *   - entities that already carry externalIds.ico/ares are archived
 *     directly;
 *   - entities without one get an ARES name-search resolution attempt,
 *     accepted ONLY on an unambiguous single hit (pocetCelkem === 1) —
 *     anything else (0 hits: typically foreign entities; >1 hits:
 *     ambiguous name) is recorded as unresolved in
 *     data/archive/ico-resolution.json, never guessed. Name→IČO by
 *     fuzzy pick would be exactly the namesake-conflation mistake the
 *     dossiers' own identity rules exist to prevent.
 *   - --enrich writes an unambiguously resolved IČO back into the
 *     entity record's externalIds.ico (a registry identifier on a
 *     context entity — same class of data expand-entity.mjs already
 *     maintains; no claim, no coverage change).
 *   - --skip-existing skips IČOs already present in
 *     data/archive/ares-snapshots/ (resumable batch).
 */
import { writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ARES_SNAPSHOT_DIR = join(ROOT, "data", "archive", "ares-snapshots");
const SL_INDEX_DIR = join(ROOT, "data", "archive", "sbirka-listin-index");
const ARCHIVE_ROOT =
  process.env.VOMASTE_ARCHIVE_ROOT || join(homedir(), "dev", "vomaste-archive", "sbirka-listin");

const VR_ENDPOINT = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr";
const OR_JUSTICE = "https://or.justice.cz/ias/ui";

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/s);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

const today = () => new Date().toISOString().slice(0, 10);

// --- ARES structured snapshot (safe, automatic, public repo) --------------

const current = (x) => !x?.datumVymazu;
const value = (v) => {
  if (Array.isArray(v)) return value(v.find(current) ?? v[0]);
  if (v && typeof v === "object" && "hodnota" in v) return String(v.hodnota);
  return v == null ? null : String(v);
};
function titleCase(name) {
  return name
    .toLocaleLowerCase("cs")
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase("cs"));
}
/* Same exclusion as expand-entity.mjs's stripPersonalData(): no
   datumNarozeni, no adresa. Kept deliberately duplicated rather than
   imported — this script's safety property must hold even if the other
   script's export shape changes later. */
function stripPersonalData(fo) {
  const bare = [fo.jmeno, fo.prijmeni].filter(Boolean).join(" ");
  return { name: [fo.titulPredJmenem, titleCase(bare)].filter(Boolean).join(" ") };
}
function personOrCompany(osoba) {
  if (osoba?.fyzickaOsoba) return { kind: "person", ...stripPersonalData(osoba.fyzickaOsoba) };
  const po = osoba?.pravnickaOsoba;
  if (po) return { kind: "company", name: value(po.obchodniJmeno), ico: value(po.ico) };
  return null;
}

async function fetchAresSnapshot(ico) {
  const res = await fetch(`${VR_ENDPOINT}/${ico}`, { headers: { accept: "application/json" } });
  if (!res.ok) {
    console.error(`  ARES ${ico}: HTTP ${res.status}, skipping`);
    return null;
  }
  const payload = await res.json();
  const raw = payload?.zaznamy?.[0];
  if (!raw) {
    console.error(`  ARES ${ico}: no zaznamy[0] in response, skipping`);
    return null;
  }
  /* Real shape confirmed live 2026-08-08 against IČO 04449461 — differs
     from the field names scripts/osint/expand-entity.mjs's own comments
     imply (clenoveStatutarnihoOrganu, seznamSpolecniku don't exist; the
     real keys are clenoveOrganu / spolecnik). ARES's fyzickaOsoba here
     carries a FULL datumNarozeni and a FULL adresa.textovaAdresa for
     named individuals — not just a birth year — so stripPersonalData()
     dropping both, unconditionally, is load-bearing, not decorative. */
  const statutory = (raw.statutarniOrgany?.[0]?.clenoveOrganu ?? [])
    .filter(current)
    .map((c) => ({
      role: value(c.clenstvi?.funkce?.nazev ?? c.nazevAngazma),
      since: value(c.clenstvi?.funkce?.vznikFunkce ?? c.datumZapisu),
      ...personOrCompany(c),
    }));
  const shareholders = (raw.spolecnici?.[0]?.spolecnik ?? [])
    .filter(current)
    .map((s) => {
      const podil = (s.podil ?? []).find(current) ?? s.podil?.[0];
      return {
        ...personOrCompany(s.osoba ?? s),
        podil: value(podil?.velikostPodilu),
        vklad: value(podil?.vklad),
        splaceno: value(podil?.splaceni),
      };
    });
  return {
    schemaNote: "Preservation snapshot — structured ARES VR data only, personal data of natural persons (birth date, address) intentionally excluded per docs/constitution/OPEN_INTELLIGENCE_COMMONS.md §4.",
    ico,
    retrievedAt: today(),
    sourceUrl: `${VR_ENDPOINT}/${ico}`,
    nazev: value(raw.obchodniJmeno),
    sidlo: (raw.adresy ?? []).find(current)?.adresa?.textovaAdresa ?? null,
    spisovaZnacka: raw.spisovaZnacka
      ? { soud: value(raw.spisovaZnacka[0]?.soud), oddil: value(raw.spisovaZnacka[0]?.oddil), vlozka: value(raw.spisovaZnacka[0]?.vlozka) }
      : null,
    statutarniOrgan: statutory,
    spolecnici: shareholders,
  };
}

// --- or.justice.cz: resolve subjektId, fetch Sbírka listin index ----------
//
// or.justice.cz is a Wicket app pinned to one backend via a sticky
// session cookie (Set-Cookie: BIGipServer~Internal~ISVR-internet-8080=...).
// Requests made without carrying that cookie forward land on a
// different backend instance than the one that resolved subjektId/
// dokument, and come back "Nenalezeno — Neplatný odkaz: ... vypršela
// jeho časová platnost" even though the link is objectively fine —
// discovered live 2026-08-08 (first script version fetched real HTML
// but produced eight identical 1037-byte "not found" pages instead of
// PDFs). Fix: one shared cookie jar per IČO, forwarded on every request
// in that IČO's chain.

function makeCookieJar() {
  const jar = new Map();
  return {
    header() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    absorb(res) {
      for (const raw of res.headers.getSetCookie?.() ?? []) {
        const [pair] = raw.split(";");
        const eq = pair.indexOf("=");
        if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    },
  };
}

async function jarFetch(jar, url) {
  const res = await fetch(url, { headers: { cookie: jar.header() } });
  jar.absorb(res);
  return res;
}

async function resolveSubjektId(jar, ico) {
  const res = await jarFetch(jar, `${OR_JUSTICE}/rejstrik-$firma?ico=${ico}`);
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/vypis-sl-firma\?subjektId=(\d+)/);
  return m ? m[1] : null;
}

async function fetchSbirkaListinIndex(jar, subjektId) {
  const res = await jarFetch(jar, `${OR_JUSTICE}/vypis-sl-firma?subjektId=${subjektId}`);
  if (!res.ok) return [];
  const html = await res.text();
  const docs = [];
  // "Číslo listiny" | "Typ listiny" | dates ... — each <tr> holds the
  // document link and its human type together (table columns per
  // or.justice.cz's own header row: Číslo listiny, Typ listiny, Vznik
  // listiny, Došlo na soud, Založeno do SL, Stránek).
  const rowRe =
    /vypis-sl-detail\?dokument=(\d+)&(?:amp;)?subjektId=(\d+)&(?:amp;)?spis=(\d+)"><span>([^<]+)<\/span>[\s\S]*?<span class="symbol">([^<]+)<\/span>/g;
  let m;
  while ((m = rowRe.exec(html))) {
    docs.push({
      dokument: m[1],
      subjektId: m[2],
      spis: m[3],
      referenceLabel: m[4].replace(/&nbsp;/g, " "),
      documentType: m[5].trim(),
    });
  }
  return docs;
}

async function fetchDocumentTypeAndDownloadUrl(jar, doc) {
  const url = `${OR_JUSTICE}/vypis-sl-detail?dokument=${doc.dokument}&subjektId=${doc.subjektId}&spis=${doc.spis}`;
  const res = await jarFetch(jar, url);
  if (!res.ok) return null;
  const html = await res.text();
  if (html.includes("Neplatný odkaz")) return { detailUrl: url, invalidLink: true };
  // A single filing can attach several files (docx original + xml + pdf
  // rendition, e.g. účetní závěrky) — collect all download links and
  // prefer the one whose filename actually ends .pdf, since that's the
  // only format worth archiving here.
  const dlRe = /href="(\/ias\/content\/download\?id=[a-f0-9]+)"><span>([^<]+)<\/span><span>\s*\(([^)]+)\)/g;
  const candidates = [...html.matchAll(dlRe)].map((m) => ({ url: m[1], filename: m[2].trim(), sizeInfo: m[3].trim() }));
  const dl = candidates.find((c) => /\.pdf$/i.test(c.filename)) ?? candidates[0];
  return {
    detailUrl: url,
    downloadUrl: dl ? `https://or.justice.cz${dl.url}` : null,
    filename: dl?.filename ?? null,
    sizeInfo: dl?.sizeInfo ?? null,
  };
}

async function downloadPdf(jar, downloadUrl, destPath) {
  const res = await jarFetch(jar, downloadUrl);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.slice(0, 4).toString("latin1") !== "%PDF") return null; // caught an HTML error page, not a PDF
  writeFileSync(destPath, buf);
  return { bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex") };
}

// --- main -------------------------------------------------------------

async function archiveIco(ico) {
  console.log(`\n=== IČO ${ico} ===`);
  mkdirSync(ARES_SNAPSHOT_DIR, { recursive: true });
  mkdirSync(SL_INDEX_DIR, { recursive: true });

  const snapshot = await fetchAresSnapshot(ico);
  if (snapshot) {
    writeFileSync(join(ARES_SNAPSHOT_DIR, `${ico}.json`), JSON.stringify(snapshot, null, 2) + "\n");
    console.log(`  ARES snapshot: ${snapshot.nazev} -> data/archive/ares-snapshots/${ico}.json`);
  }

  const jar = makeCookieJar();
  const subjektId = await resolveSubjektId(jar, ico);
  if (!subjektId) {
    console.log(`  or.justice.cz: could not resolve subjektId, skipping Sbírka listin`);
    return;
  }
  const index = await fetchSbirkaListinIndex(jar, subjektId);
  console.log(`  Sbírka listin index: ${index.length} document(s), subjektId=${subjektId}`);

  const localDir = join(ARCHIVE_ROOT, ico);
  mkdirSync(localDir, { recursive: true });
  const manifest = [];

  for (const doc of index) {
    const detail = await fetchDocumentTypeAndDownloadUrl(jar, doc);
    if (detail?.invalidLink) {
      console.log(`  [${doc.referenceLabel}] session expired mid-run, skipping (retry the whole IČO)`);
      manifest.push({ ...doc, downloaded: false, error: "invalid_link" });
      continue;
    }
    if (!detail?.downloadUrl) {
      console.log(`  [${doc.referenceLabel}] no downloadable file, skipping`);
      manifest.push({ ...doc, ...detail, downloaded: false });
      continue;
    }
    const destPath = join(localDir, `${doc.referenceLabel.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`);
    const dl = await downloadPdf(jar, detail.downloadUrl, destPath);
    console.log(`  [${doc.referenceLabel}] ${detail.documentType ?? "?"} -> ${destPath} (${dl?.bytes ?? "?"} bytes)`);
    manifest.push({
      ...doc,
      ...detail,
      downloaded: !!dl,
      localPath: destPath,
      sha256: dl?.sha256,
      bytes: dl?.bytes,
      retrievedAt: today(),
    });
  }

  writeFileSync(join(localDir, "manifest.json"), JSON.stringify({ ico, subjektId, retrievedAt: today(), documents: manifest }, null, 2) + "\n");

  // Public-repo index: metadata only (titles/dates/reference codes), never
  // document content or the local/download URLs (those point at a live
  // internal or.justice.cz session-scoped path, not stable, and pointing
  // at them isn't the point — the point is recording what EXISTS).
  const publicIndex = {
    schemaNote: "Preservation index — which Sbírka listin documents exist for this IČO and when we last confirmed it. Document CONTENT is archived locally, outside this repository, pending human review (see docs/constitution/OPEN_INTELLIGENCE_COMMONS.md §4, 'Doplnění 2026-08-08').",
    ico,
    subjektId,
    retrievedAt: today(),
    documents: manifest.map((d) => ({
      referenceLabel: d.referenceLabel,
      documentType: d.documentType,
      downloaded: d.downloaded,
      sha256: d.sha256,
    })),
  };
  writeFileSync(join(SL_INDEX_DIR, `${ico}.json`), JSON.stringify(publicIndex, null, 2) + "\n");
  console.log(`  Public index written -> data/archive/sbirka-listin-index/${ico}.json`);
  console.log(`  Raw PDFs (NOT in this repo) -> ${localDir}`);
}

// --- batch mode over canonical entities -----------------------------------

const ENTITIES_DIR = join(ROOT, "data", "dossiers", "_shared", "entities");
const RESOLUTION_REPORT = join(ROOT, "data", "archive", "ico-resolution.json");
const ICO_TYPES = new Set(["company", "organization", "public_institution", "political_party"]);
const SEARCH_ENDPOINT = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resolveIcoByName(title) {
  // Strip parenthetical disambiguators ("(UHS)", "(Washington)") — they
  // are this dataset's labels, not part of the registered name.
  const name = title.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const res = await fetch(SEARCH_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ obchodniJmeno: name, pocet: 5 }),
  });
  if (!res.ok) return { outcome: "search_error", detail: `HTTP ${res.status}` };
  const d = await res.json();
  const total = d.pocetCelkem ?? 0;
  if (total === 0) return { outcome: "not_found" };
  if (total > 1) {
    return {
      outcome: "ambiguous",
      detail: (d.ekonomickeSubjekty ?? []).slice(0, 5).map((s) => `${s.ico} ${s.obchodniJmeno}`),
    };
  }
  const hit = d.ekonomickeSubjekty?.[0];
  return { outcome: "resolved", ico: hit.ico, registeredName: hit.obchodniJmeno };
}

async function fromEntities({ enrich, skipExisting }) {
  const existing = new Set(
    existsSync(ARES_SNAPSHOT_DIR) ? readdirSync(ARES_SNAPSHOT_DIR).map((f) => f.replace(/\.json$/, "")) : [],
  );
  const resolution = [];
  const toArchive = [];

  for (const file of readdirSync(ENTITIES_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const path = join(ENTITIES_DIR, file);
    const entity = JSON.parse(readFileSync(path, "utf8"));
    if (!ICO_TYPES.has(entity.entityType)) continue;
    const known = entity.externalIds?.ico ?? entity.externalIds?.ares;
    if (known) {
      resolution.push({ entityId: entity.entityId, title: entity.title, outcome: "already_recorded", ico: known });
      toArchive.push(known);
      continue;
    }
    const r = await resolveIcoByName(entity.title);
    resolution.push({ entityId: entity.entityId, title: entity.title, ...r });
    console.log(`resolve ${entity.entityId}: ${r.outcome}${r.ico ? ` (${r.ico} ${r.registeredName})` : ""}`);
    if (r.outcome === "resolved") {
      toArchive.push(r.ico);
      if (enrich) {
        entity.externalIds = { ...entity.externalIds, ico: r.ico };
        writeFileSync(path, JSON.stringify(entity, null, 2) + "\n");
      }
    }
    await sleep(300);
  }

  mkdirSync(dirname(RESOLUTION_REPORT), { recursive: true });
  writeFileSync(
    RESOLUTION_REPORT,
    JSON.stringify(
      {
        schemaNote:
          "IČO resolution outcomes for the entity registry — resolved only on an unambiguous single ARES hit; not_found is typically a foreign entity or an unregistered organizational unit, ambiguous is a name shared by several registered subjects. Never guessed.",
        generatedAt: today(),
        outcomes: resolution,
      },
      null,
      2,
    ) + "\n",
  );
  const counts = resolution.reduce((a, r) => ((a[r.outcome] = (a[r.outcome] ?? 0) + 1), a), {});
  console.log(`\nResolution: ${JSON.stringify(counts)} -> data/archive/ico-resolution.json`);

  const unique = [...new Set(toArchive)].filter((ico) => !skipExisting || !existing.has(ico));
  console.log(`Archiving ${unique.length} IČO(s)${skipExisting ? " (skip-existing on)" : ""}...`);
  for (const ico of unique) {
    await archiveIco(ico);
    await sleep(500);
  }
  return unique.length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args["from-entities"]) {
    const n = await fromEntities({ enrich: !!args.enrich, skipExisting: !!args["skip-existing"] });
    console.log(`\nDone. ${n} IČO(s) archived from entity registry.`);
    return;
  }
  const icos = String(args.ico ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!icos.length) {
    console.error(
      "Usage: node scripts/osint/archive-registry-snapshots.mjs --ico=<ico>[,<ico>...] | --from-entities [--enrich] [--skip-existing]",
    );
    process.exit(1);
  }
  for (const ico of icos) {
    await archiveIco(ico);
  }
  console.log(`\nDone. ${icos.length} IČO(s) processed.`);
}

main();
