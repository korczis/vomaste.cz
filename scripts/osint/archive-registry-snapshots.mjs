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
 * SCOPE AFTER THE 2026-08-08 CONSOLIDATION: this script owns exactly two
 * capabilities the archive-* suite (archive-ares-entities.mjs,
 * archive-justice-entities.mjs, archive-court-noticeboards.mjs) does not
 * have — and nothing else:
 *
 *   1. ARES VR-branch structured snapshots (registered statutory organs
 *      and shareholders with share sizes) — the suite's basic-endpoint
 *      snapshot carries identity data only, no officers/owners. Personal
 *      data of natural persons (datumNarozeni, adresa — both of which
 *      the VR branch returns IN FULL) is stripped in code, same
 *      exclusion as scripts/osint/expand-entity.mjs. Written to
 *      data/archive/ares-snapshots/<ico>.json.
 *
 *   2. Name→IČO resolution over the entity registry (--from-entities)
 *      with optional --enrich write-back of externalIds.ico.
 *
 * Sbírka listin document INDEXING and PDF DOWNLOADING were removed here
 * on 2026-08-08: archive-justice-entities.mjs does both better (official
 * verejnerejstriky.msp.gov.cz API instead of scraping the Wicket UI,
 * resumable downloads, size checks, gate-enforced coverage), writing the
 * sanitized public index to static/documents/registry/justice/ and the
 * raw documents to the same local Zone-B archive. Its own header states
 * the publication rule: raw documents never enter Git; publishing one
 * requires individual review and a safe derivative.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ARES_SNAPSHOT_DIR = join(ROOT, "data", "archive", "ares-snapshots");

const VR_ENDPOINT = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr";

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

// --- main -------------------------------------------------------------

async function archiveIco(ico) {
  mkdirSync(ARES_SNAPSHOT_DIR, { recursive: true });
  const snapshot = await fetchAresSnapshot(ico);
  if (snapshot) {
    writeFileSync(join(ARES_SNAPSHOT_DIR, `${ico}.json`), JSON.stringify(snapshot, null, 2) + "\n");
    console.log(`VR snapshot ${ico}: ${snapshot.nazev} -> data/archive/ares-snapshots/${ico}.json`);
  }
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
