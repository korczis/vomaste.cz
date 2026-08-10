#!/usr/bin/env node
/*
 * Downloads a freely-licensed portrait (or organisation logo) for one entity
 * and records its licence in that entity's canonical record.
 *
 * Two decisions shape everything here:
 *
 * 1. THE FILE COMES INTO THE REPOSITORY. Hotlinking someone else's server for
 *    an og:image means the preview breaks the day they reorganise their CDN,
 *    and it silently leaks every reader's request to a third party. The bytes
 *    are committed; the credit points back to where they came from.
 *
 * 2. LICENCE FIRST, IMAGE SECOND. The licence is read from the source's own
 *    machine-readable metadata BEFORE anything is downloaded, and a file whose
 *    licence is not on the free allowlist is never fetched at all. "It was on
 *    the internet" is not a licence — the same standard this site applies to
 *    claims, applied to pictures.
 *
 * Sources, in order of preference:
 *   · Wikimedia Commons (licence is machine-readable, which is why it wins)
 *
 * Usage:
 *   node scripts/media/fetch-media.mjs <entity-id> [--query "Jméno Příjmení"]
 *                                      [--kind people|logos] [--title T] [--subtitle S] [--href URL] [--role R] [--add] [--dry-run] [--force]
 *   npm run media:fetch -- <entity-id>
 *
 * Deliberately ONE ENTITY PER RUN: each picture is a publishing decision about
 * a real person, and a loop that quietly grabs five hundred of them is exactly
 * the kind of bulk act this repository's rules exist to prevent.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isFreeLicence } from "./lib/licences.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENTITY_DIR = join(ROOT, "data/dossiers/_shared/entities");
const USER_AGENT =
  "vomaste.cz-media-fetch/0.1 (https://vomaste.cz; korczis@gmail.com) node-fetch";


const args = process.argv.slice(2);
const entityId = args.find((a) => !a.startsWith("--"));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
};
const has = (name) => args.includes(`--${name}`);

if (!entityId) {
  console.error(
    "použij: node scripts/media/fetch-media.mjs <entity-id> [--query \"Jméno\"] [--kind people|logos] [--title T] [--subtitle S] [--href URL] [--role R] [--add] [--dry-run] [--force]",
  );
  process.exit(2);
}

const entityFile = join(ENTITY_DIR, `${entityId}.json`);
if (!existsSync(entityFile)) {
  console.error(`entita ${entityId} neexistuje (${entityFile})`);
  process.exit(2);
}
const record = JSON.parse(readFileSync(entityFile, "utf8"));

const existing = Array.isArray(record.media) ? record.media : [];
if (existing.length > 0 && !has("force") && !has("add")) {
  console.log(
    `${entityId}: už má ${existing.length} médi${existing.length === 1 ? "um" : "í"} — ` +
      "--add přidá další, --force přepíše celé pole",
  );
  process.exit(0);
}

const kind = flag("kind") ?? (record.entityType === "person" ? "people" : "logos");
/*
 * Entity titles carry a disambiguating role — "Petr Pavel (prezident)" — which
 * is exactly right on the site and useless as a search term: no Wikidata label
 * contains it, so the lookup finds nobody at all. Strip the parenthetical for
 * searching; --query overrides when even the bare name is ambiguous.
 */
const query = flag("query") ?? String(record.title).replace(/\s*\([^)]*\)\s*$/, "").trim();

console.log(`hledám volně licencovaný obrázek: ${JSON.stringify(query)} (${entityId}, ${kind})`);

/*
 * Identity first, picture second.
 *
 * A plain Commons filename search is not an identification: searching
 * "Karel Havlíček" returns a public-domain portrait of Karel Havlíček
 * Borovský, a 19th-century writer, and publishing that on a living minister's
 * dossier would be a serious factual error dressed up as a nice photo.
 *
 * So the subject is resolved through Wikidata first — entities there are
 * disambiguated, and their `image` (P18) is a curated statement about THAT
 * person, not a text match. The Commons search stays only as an explicitly
 * requested fallback (--allow-search), and the resolved entity's description is
 * always printed so the choice is auditable rather than merely automatic.
 */
let candidates = [];
let resolvedWikidataId = null;
const pinned = flag("file");
if (pinned) {
  candidates = await commonsFileInfo(pinned);
  if (candidates.length === 0) {
    console.log(`${entityId}: soubor ${pinned} na Commons nenalezen`);
    process.exit(1);
  }
} else {
  /*
   * Pinned identity beats name matching.
   *
   * A name is not an identifier. `martin-pavlik` is defined by a business
   * register profile, while Wikidata's "Martin Pavlík" is a physician — a
   * different man, whose photograph on that dossier would be exactly the
   * confusion the subject's authorization forbids. Once an identity is
   * confirmed it is stored in `externalIds.wikidata` and reused, so later runs
   * stop guessing.
   */
  const identity = await resolveWikidata(query, flag("wikidata") ?? record.externalIds?.wikidata);
  if (identity) {
    console.log(`  Wikidata: ${identity.id} — ${identity.label}${identity.description ? ` (${identity.description})` : ""}`);
    if (identity.image) {
      candidates = await commonsFileInfo(`File:${identity.image}`);
    } else {
      console.log("  Wikidata záznam nemá obrázek (P18)");
    }
  } else {
    console.log("  Wikidata: subjekt nerozpoznán");
  }
  if (candidates.length === 0 && has("allow-search")) {
    console.log("  --allow-search: zkouším fulltext na Commons (ověř výsledek očima!)");
    candidates = await searchCommons(query);
  }
}
if (candidates.length === 0) {
  console.log(`${entityId}: na Commons nic nenalezeno — zůstává bez obrázku (žádný placeholder)`);
  process.exit(1);
}

const chosen = candidates.find((c) => isFreeLicence(c.license));
if (!chosen) {
  console.log(`${entityId}: nalezené soubory nemají volnou licenci — nestahuji:`);
  for (const c of candidates.slice(0, 5)) console.log(`   ${c.license} — ${c.title}`);
  process.exit(1);
}

console.log(`  vybráno: ${chosen.title}`);
console.log(`  licence: ${chosen.license} · autor: ${chosen.author}`);
console.log(`  zdroj:   ${chosen.descriptionUrl}`);

const ext = (chosen.thumbUrl.match(/\.(jpe?g|png|svg|webp)$/i)?.[1] ?? "jpg").toLowerCase();
// 1..N médií na entitu: druhé a další dostanou pořadovou příponu, aby se
// soubory nepřepisovaly a cesta zůstala odvoditelná z entity a pořadí.
const keep = has("force") ? [] : existing;
const index = keep.length;
const relFile = `images/${kind}/${entityId}${index ? `-${index + 1}` : ""}.${ext === "jpeg" ? "jpg" : ext}`;
const absFile = join(ROOT, "static", relFile);

if (has("dry-run")) {
  console.log(`dry-run: zapsal bych ${relFile} a licenci do ${entityId}.json`);
  process.exit(0);
}

const bytes = await download(chosen.thumbUrl);
mkdirSync(dirname(absFile), { recursive: true });
writeFileSync(absFile, bytes);
console.log(`  staženo: static/${relFile} (${(bytes.length / 1024).toFixed(0)} kB)`);

const item = {
  file: relFile,
  sourceUrl: chosen.descriptionUrl,
  license: chosen.license,
  ...(chosen.licenseUrl ? { licenseUrl: chosen.licenseUrl } : {}),
  author: chosen.author,
  ...(chosen.credit ? { credit: chosen.credit } : {}),
  retrieved: new Date().toISOString().slice(0, 10),
  ...(chosen.width ? { width: chosen.width } : {}),
  ...(chosen.height ? { height: chosen.height } : {}),
};
// Popisky a proklik jsou redakční rozhodnutí, ne něco, co jde odvodit ze
// zdroje — proto přicházejí z příkazové řádky, ne z API.
if (flag("title")) item.title = flag("title");
if (flag("subtitle")) item.subtitle = flag("subtitle");
if (flag("href")) item.href = flag("href");
item.role = flag("role") ?? (kind === "logos" ? "logo" : index === 0 ? "portrait" : "photo");

record.media = [...keep, item];
// Potvrzená identita se ukládá, aby ji další běh nemusel hádat znovu.
if (resolvedWikidataId) {
  record.externalIds = { ...(record.externalIds ?? {}), wikidata: resolvedWikidataId };
}
writeFileSync(entityFile, `${JSON.stringify(record, null, 2)}\n`);
console.log(`  zapsáno do data/dossiers/_shared/entities/${entityId}.json`);
console.log("dál: npm run data:build && npm run validate:media");

/** Strip the HTML Commons puts in Artist/Credit fields down to readable text. */
function plain(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve a person to a Wikidata entity and its P18 image.
 *
 * Only humans (P31 = Q5) are accepted, so an organisation or a disambiguation
 * page can never stand in for a person. When several humans share the name,
 * the one whose description mentions Czech politics wins — and if none does,
 * the first human is returned but its description is printed, so a wrong match
 * is visible instead of silent.
 */
async function resolveWikidata(term, pinnedId) {
  const api = "https://www.wikidata.org/w/api.php";

  let ids = [];
  if (pinnedId) {
    ids = [pinnedId];
  } else {
    const url = new URL(api);
    for (const [k, v] of Object.entries({
      action: "wbsearchentities",
      format: "json",
      language: "cs",
      uselang: "cs",
      type: "item",
      limit: "8",
      search: term,
    })) {
      url.searchParams.set(k, v);
    }
    const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
    if (!res.ok) return null;
    ids = ((await res.json()).search ?? []).map((s) => s.id);
  }
  if (ids.length === 0) return null;

  const url = new URL(api);
  for (const [k, v] of Object.entries({
    action: "wbgetentities",
    format: "json",
    ids: ids.join("|"),
    props: "labels|descriptions|claims",
    languages: "cs|en",
  })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) return null;
  const entities = Object.values((await res.json()).entities ?? {});

  const humans = entities.filter((e) =>
    (e.claims?.P31 ?? []).some((c) => c.mainsnak?.datavalue?.value?.id === "Q5"),
  );
  if (humans.length === 0) return null;

  const describe = (e) => e.descriptions?.cs?.value ?? e.descriptions?.en?.value ?? "";

  /*
   * "Description mentions politics" is not enough on its own: Karel Havlíček
   * Borovský is described as "český novinář, spisovatel, básník a politik" and
   * would beat the living minister of the same name. The strongest signal is
   * therefore that the person is ALIVE — every subject this site covers holds
   * office today — followed by Czech citizenship, and only then the wording of
   * the description.
   */
  const claimIds = (e, prop) =>
    (e.claims?.[prop] ?? []).map((c) => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
  const score = (e) =>
    ((e.claims?.P570 ?? []).length === 0 ? 4 : 0) + // bez data úmrtí = žijící
    (claimIds(e, "P27").includes("Q213") ? 2 : 0) + // občanství ČR
    (/politi|ministr|poslan|premiér|prezident|podnikatel/i.test(describe(e)) ? 1 : 0);

  const ranked = [...humans].sort((a, b) => score(b) - score(a));
  const chosen = ranked[0];
  if (ranked.length > 1 && score(ranked[0]) === score(ranked[1])) {
    console.log(
      `  POZOR: víc stejně pravděpodobných osob — ${ranked
        .slice(0, 3)
        .map((e) => `${e.id} (${describe(e)})`)
        .join("; ")}. Upřesni přes --wikidata Q…`,
    );
  }

  return {
    id: chosen.id,
    label: chosen.labels?.cs?.value ?? chosen.labels?.en?.value ?? term,
    description: describe(chosen),
    image: chosen.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null,
  };
}

/** Licence + URLs for one named Commons file. */
async function commonsFileInfo(fileTitle) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  for (const [k, v] of Object.entries({
    action: "query",
    format: "json",
    titles: fileTitle,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1200",
  })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) return [];
  const pages = Object.values((await res.json())?.query?.pages ?? {});
  return pages.map(toCandidate).filter(Boolean);
}

function toCandidate(page) {
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    title: page.title,
    license: plain(meta.LicenseShortName?.value) || "(neuvedeno)",
    licenseUrl: meta.LicenseUrl?.value ?? null,
    author: plain(meta.Artist?.value) || "(neuveden)",
    credit: plain(meta.Credit?.value) || null,
    descriptionUrl: info.descriptionurl,
    thumbUrl: info.thumburl ?? info.url,
    width: info.thumbwidth ?? info.width ?? null,
    height: info.thumbheight ?? info.height ?? null,
  };
}

async function searchCommons(term) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  const params = {
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${term} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size",
    iiurlwidth: "1200",
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const body = await res.json();
  const pages = body?.query?.pages ?? {};

  return Object.values(pages)
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: page.title,
        license: plain(meta.LicenseShortName?.value) || "(neuvedeno)",
        licenseUrl: meta.LicenseUrl?.value ?? null,
        author: plain(meta.Artist?.value) || "(neuveden)",
        credit: plain(meta.Credit?.value) || null,
        descriptionUrl: info.descriptionurl,
        thumbUrl: info.thumburl ?? info.url,
        width: info.thumbwidth ?? info.width ?? null,
        height: info.thumbheight ?? info.height ?? null,
      };
    })
    .filter(Boolean);
}

async function download(url) {
  const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) throw new Error(`stažení selhalo: HTTP ${res.status} (${url})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("stažený soubor je prázdný");
  return buf;
}
