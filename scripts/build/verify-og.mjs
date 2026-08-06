#!/usr/bin/env node
/*
 * Post-build brána pro sociální a SEO metadata (T-076).
 * Běží po `zola build` nad `public/`, stejně jako verify-jsonld.mjs.
 *
 * PROČ existuje: do T-076 se `og:*` a `twitter:*` skládaly inline v
 * `templates/base.html` z vnořených `default(value=…)` řetězců a nic je
 * po buildu nekontrolovalo. Důsledky, které tím tiše prošly do produkce:
 *
 *  - všech 334 stránek vztahů mělo `og:type = website` místo `article`,
 *    protože šablona hledala `page.extra.relation_id`, zatímco generátor
 *    obsahu píše `rel_id`;
 *  - `og:title` a `name` stránkového uzlu JSON-LD tvrdily o téže stránce
 *    dvě různé věci na 2 246 stránkách, `og:description` a `description`
 *    na 463;
 *  - /404.html se v náhledu na sociální síti vydávala za úvodní stránku
 *    (titulek i popis webu).
 *
 * Co se kontroluje nad KAŽDOU vydanou stránkou (výjimkou jsou jen
 * přesměrovací stuby aliasů Zoly — táž výjimka jako ve verify-jsonld.mjs):
 *
 *  1. úplnost — každá značka z `enforce.required_og` a
 *     `enforce.required_twitter` v `data/seo.toml` je přítomná a neprázdná;
 *  2. kanonická shoda — `og:url` se rovná `<link rel="canonical">`
 *     (výjimka: stránky v `enforce.without_canonical`, které kanonickou
 *     URL záměrně nemají — pak nesmí mít ani jedno);
 *  3. obrázek — `og:image` je ABSOLUTNÍ URL (relativní sociální sítě
 *     nezobrazí) a odpovídající soubor ve vydaném stromu existuje;
 *     `twitter:image` a `og:image:secure_url` míří na tentýž soubor;
 *  4. meze — titulek i popis jsou neprázdné a vejdou se do
 *     `limits.*` z `data/seo.toml`;
 *  5. shoda s JSON-LD — `og:title` == `name` a `og:description` ==
 *     `description` stránkového uzlu (`@graph[0]`), a jeho `url` == `og:url`;
 *  6. shoda OG ↔ Twitter — `twitter:title`/`twitter:description` nesou
 *     tytéž hodnoty jako OG; typ karty odpovídá tomu, zda jde obrázek;
 *  7. slovník typů — `og:type` je jedna z hodnot deklarovaných v
 *     `seo.page_types`, a `record_type` v `content/**` a klíče
 *     `seo.page_types` si odpovídají OBĚMA směry (mrtvý ani chybějící typ
 *     stránky neprojde buildem — stejné pravidlo jako u
 *     `data/entity-types.toml`).
 *
 * Použití:
 *   node scripts/build/verify-og.mjs [--dir <vydaný strom>]
 * `--dir` (jako verify-jsonld/verify-export) umožňuje pustit bránu nad
 * známě rozbitým stromem — bez toho by se dala pozorovat jen jak prochází.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSeoConfig, readBaseUrl } from "./seo-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Táž výjimka jako verify-jsonld.mjs job 5: alias stub není stránka, je
// to přesměrování (dokument, jehož celý úkol je http-equiv refresh).
const REDIRECT_RE = /http-equiv=["']?refresh/i;
// Minifikátor smí zahodit uvozovky i přeházet atributy, a hodnota atributu
// legitimně obsahuje ">" (titulek „platby … >270 mil. Kč"). Naivní
// `<meta[^>]+>` na takové stránce tag NENAJDE a ohlásí chybějící značku,
// která tam je — proto se uvozované úseky přeskakují explicitně.
const TAG_RE = (name) => new RegExp(`<${name}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>`, "gi");
const ATTR_RE = /([a-zA-Z:_][-a-zA-Z0-9:_.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
const JSONLD_RE = /<script type="?application\/ld\+json"?>([\s\S]*?)<\/script>/g;

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}

function attributes(raw) {
  const out = {};
  for (const m of raw.matchAll(ATTR_RE)) {
    out[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return out;
}

// Vrací mapu značka → hodnota. `property` (OG) i `name` (Twitter, popis)
// v jedné mapě: obojí jsou <meta> a klíče se nepřekrývají.
export function extractMeta(html) {
  const meta = new Map();
  for (const m of html.matchAll(TAG_RE("meta"))) {
    const a = attributes(m[1]);
    const key = a.property ?? a.name;
    if (key && !meta.has(key)) meta.set(key, a.content ?? "");
  }
  return meta;
}

export function extractCanonical(html) {
  for (const m of html.matchAll(TAG_RE("link"))) {
    const a = attributes(m[1]);
    if ((a.rel ?? "").toLowerCase() === "canonical") return a.href ?? "";
  }
  return null;
}

// Stránkový uzel je PRVNÍ uzel @graph — tak ho vydává
// templates/partials/jsonld.html a jen on popisuje stránku jako celek
// (Claim/citační uzly na téže stránce nesou url také, proto se nedá
// vybírat podle url).
export function extractPageNode(html) {
  const first = [...html.matchAll(JSONLD_RE)][0];
  if (!first) return null;
  let parsed;
  try {
    parsed = JSON.parse(first[1]);
  } catch {
    return null;
  }
  const graph = parsed["@graph"];
  return Array.isArray(graph) && graph.length > 0 ? graph[0] : null;
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith(".html")) yield p;
  }
}

// record_type / dossier_type použité v content/** — druhá strana kontroly
// slovníku typů stránek.
function usedPageTypeKeys(contentRoot) {
  const used = new Map(); // klíč → příklad souboru
  if (!existsSync(contentRoot)) return used;
  const walk = function* (dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) yield* walk(p);
      else if (name.endsWith(".md")) yield p;
    }
  };
  for (const file of walk(contentRoot)) {
    const fm = (readFileSync(file, "utf8").match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1];
    if (!fm) continue;
    const recordType = (fm.match(/^\s*record_type\s*=\s*"([^"]*)"/m) ?? [])[1];
    if (!recordType) continue;
    const dossierType = (fm.match(/^\s*dossier_type\s*=\s*"([^"]*)"/m) ?? [])[1];
    const key = recordType === "dossier" && dossierType ? `dossier.${dossierType}` : recordType;
    if (!used.has(key)) used.set(key, relative(contentRoot, file));
  }
  return used;
}

export function verifyOg({ root = ROOT, publicRoot = join(root, "public") } = {}) {
  const seo = loadSeoConfig(root);
  const baseUrl = readBaseUrl(root);
  const errors = [];
  const err = (msg) => errors.push(msg);

  const withoutCanonical = new Set(seo.enforce.without_canonical);
  const declaredOgTypes = new Set(Object.values(seo.page_types).map((t) => t.og_type));
  const cardWithImage = seo.site.twitter_card;
  const cardWithoutImage = seo.site.twitter_card_without_image;

  // --- slovník typů stránek, obousměrně (viz job 7) ---------------------
  const used = usedPageTypeKeys(join(root, "content"));
  // `default` a `not_found` nejsou record_type — jsou to fallback klíče,
  // které v datech z principu nikdy nestojí.
  const structural = new Set(["default", "not_found"]);
  for (const [key, example] of used) {
    if (!seo.page_types[key])
      err(`data/seo.toml: chybí [page_types."${key}"] — record_type použitý v content/${example} by tiše spadl na "default".`);
  }
  for (const key of Object.keys(seo.page_types)) {
    if (structural.has(key)) continue;
    if (!used.has(key))
      err(`data/seo.toml: [page_types."${key}"] není v content/** použitý — mrtvý typ stránky.`);
  }

  let pages = 0;
  let redirectStubs = 0;
  const ogTypeCounts = new Map();

  for (const file of htmlFiles(publicRoot)) {
    const rel = relative(publicRoot, file);
    const html = readFileSync(file, "utf8");
    if (REDIRECT_RE.test(html)) {
      redirectStubs++;
      continue;
    }
    pages++;

    const meta = extractMeta(html);
    const canonical = extractCanonical(html);
    const exemptFromCanonical = withoutCanonical.has(rel);

    // 1. úplnost
    for (const tag of seo.enforce.required_og) {
      if (tag === "og:url" && exemptFromCanonical) continue;
      const value = meta.get(tag);
      if (value === undefined) err(`${rel}: chybí <meta property="${tag}">.`);
      else if (value.trim() === "") err(`${rel}: prázdná hodnota ${tag}.`);
    }
    for (const tag of seo.enforce.required_twitter) {
      const value = meta.get(tag);
      if (value === undefined) err(`${rel}: chybí <meta name="${tag}">.`);
      else if (value.trim() === "") err(`${rel}: prázdná hodnota ${tag}.`);
    }

    const ogTitle = meta.get("og:title");
    const ogDescription = meta.get("og:description");
    const ogUrl = meta.get("og:url");
    const ogImage = meta.get("og:image");
    const ogType = meta.get("og:type");
    ogTypeCounts.set(ogType, (ogTypeCounts.get(ogType) ?? 0) + 1);

    // 2. kanonická shoda
    if (exemptFromCanonical) {
      if (canonical !== null)
        err(`${rel}: má <link rel="canonical">, ale je v seo.enforce.without_canonical — chybová stránka se nesmí hlásit do indexu jako obsah.`);
      if (ogUrl !== undefined)
        err(`${rel}: má og:url, ale je v seo.enforce.without_canonical.`);
    } else if (canonical === null) {
      err(`${rel}: chybí <link rel="canonical"> (a není v seo.enforce.without_canonical).`);
    } else if (ogUrl !== undefined && ogUrl !== canonical) {
      err(`${rel}: og:url "${ogUrl}" != kanonická URL "${canonical}".`);
    }

    // 3. obrázek
    if (ogImage) {
      if (!/^https?:\/\//i.test(ogImage)) {
        err(`${rel}: og:image "${ogImage}" není absolutní URL — relativní náhledový obrázek sociální sítě nezobrazí.`);
      } else {
        if (!ogImage.startsWith(`${baseUrl}/`))
          err(`${rel}: og:image "${ogImage}" nevychází z base_url "${baseUrl}".`);
        const path = ogImage.slice(baseUrl.length).replace(/^\//, "").split("?")[0];
        if (!existsSync(join(publicRoot, path)))
          err(`${rel}: og:image odkazuje na "${path}", který ve vydaném stromu neexistuje.`);
      }
      const secure = meta.get("og:image:secure_url");
      if (secure !== undefined && secure !== ogImage)
        err(`${rel}: og:image:secure_url "${secure}" != og:image "${ogImage}".`);
      const twitterImage = meta.get("twitter:image");
      if (twitterImage !== undefined && twitterImage !== ogImage)
        err(`${rel}: twitter:image "${twitterImage}" != og:image "${ogImage}".`);
    }

    // 4. meze
    if (ogTitle !== undefined) checkLength(err, rel, "og:title", ogTitle, seo.limits.title_min, seo.limits.title_max);
    if (ogDescription !== undefined)
      checkLength(err, rel, "og:description", ogDescription, seo.limits.description_min, seo.limits.description_max);

    // 5. shoda s JSON-LD
    const node = extractPageNode(html);
    if (!node) {
      err(`${rel}: nemá stránkový uzel JSON-LD (@graph[0]) — sociální metadata není proti čemu ověřit.`);
    } else {
      if (ogTitle !== undefined && node.name !== ogTitle)
        err(`${rel}: og:title "${ogTitle}" != JSON-LD name "${node.name}" — jedna stránka nesmí tvrdit dvě věci.`);
      if (ogDescription !== undefined && node.description !== ogDescription)
        err(`${rel}: og:description "${ogDescription}" != JSON-LD description "${node.description}".`);
      if (ogUrl !== undefined && node.url !== undefined && node.url !== ogUrl)
        err(`${rel}: og:url "${ogUrl}" != JSON-LD url "${node.url}".`);
    }

    // 6. shoda OG ↔ Twitter
    const twitterTitle = meta.get("twitter:title");
    if (twitterTitle !== undefined && ogTitle !== undefined && twitterTitle !== ogTitle)
      err(`${rel}: twitter:title "${twitterTitle}" != og:title "${ogTitle}".`);
    const twitterDescription = meta.get("twitter:description");
    if (twitterDescription !== undefined && ogDescription !== undefined && twitterDescription !== ogDescription)
      err(`${rel}: twitter:description != og:description.`);
    const card = meta.get("twitter:card");
    if (card !== undefined) {
      const expected = ogImage ? cardWithImage : cardWithoutImage;
      if (card !== expected)
        err(`${rel}: twitter:card "${card}" neodpovídá stavu obrázku (očekáváno "${expected}").`);
    }

    // 7. slovník typů
    if (ogType !== undefined && !declaredOgTypes.has(ogType))
      err(`${rel}: og:type "${ogType}" není deklarován v žádném seo.page_types.`);

    // og:locale musí být language_TERRITORY — holé "cs" Facebook i
    // LinkedIn ignorují (proto je v datech cs_CZ, ne cs).
    const locale = meta.get("og:locale");
    if (locale !== undefined && !/^[a-z]{2,3}_[A-Z]{2}$/.test(locale))
      err(`${rel}: og:locale "${locale}" není ve tvaru language_TERRITORY (např. cs_CZ).`);
  }

  return { errors, pages, redirectStubs, ogTypeCounts, seo };
}

function checkLength(err, rel, tag, value, min, max) {
  const length = [...value].length;
  if (length < min) err(`${rel}: ${tag} má ${length} znaků, minimum je ${min}.`);
  if (length > max) err(`${rel}: ${tag} má ${length} znaků, maximum z data/seo.toml je ${max}.`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const dirArg = process.argv.indexOf("--dir");
  const publicRoot = dirArg !== -1 && process.argv[dirArg + 1] ? process.argv[dirArg + 1] : join(ROOT, "public");
  const { errors, pages, redirectStubs, ogTypeCounts } = verifyOg({ root: ROOT, publicRoot });
  const distribution = [...ogTypeCounts].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}=${n}`).join(", ");
  console.log(
    `Zkontrolováno ${pages} vydaných stránek (${redirectStubs} přesměrovacích stubů vyjmuto); og:type — ${distribution}.`,
  );
  if (errors.length) {
    console.log(`\n${errors.length} chyb(a):`);
    for (const e of errors.slice(0, 50)) console.log(`  ERROR ${e}`);
    if (errors.length > 50) console.log(`  … a dalších ${errors.length - 50}.`);
    console.log(`\nFAILED`);
    process.exit(1);
  }
  console.log(
    `OK — každá stránka má úplnou sadu og:*/twitter:*, og:url sedí na kanonickou URL, og:image existuje jako soubor, ` +
      `titulek i popis jsou v mezích z data/seo.toml a shodují se se stránkovým uzlem JSON-LD.`,
  );
}
