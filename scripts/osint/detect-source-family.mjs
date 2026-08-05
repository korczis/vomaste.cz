#!/usr/bin/env node
/*
 * Detektor zdrojových rodin — opakovatelná náhrada ručního čtení bylines.
 *
 * PROČ EXISTUJE
 * -------------
 * Badge CORROBORATED slibuje dvě NEZÁVISLÁ doložení. Zdroj bez
 * `sourceFamily` se ale ve validátoru (pravidla S1/S2/S4,
 * scripts/data/validate-semantics.mjs) počítá sám za sebe přes `outlet`,
 * takže pět vydání téže agenturní zprávy v pěti médiích vypadá jako pět
 * nezávislých redakcí. Revize T-056 (commit f80f91ca) ručním čtením
 * prokázala, že to není teoretický problém: 55 tvrzení muselo spadnout
 * z CORROBORATED na 1 ZDROJ. Tenhle skript dělá tutéž práci strojově a
 * opakovatelně, aby se ruční kolo nemuselo opakovat při každém novém
 * zdroji.
 *
 * CO DOKLÁDÁ A CO NE — čti dřív, než výstupu uvěříš
 * -------------------------------------------------
 *   DOKLÁDÁ: že HTML stránky zdroje na uvedené URL nese ve strojových
 *     metadatech, v podpisovém bloku nebo v patičce konkrétní kredit
 *     původu (např. `<meta name="author" content="ČTK">`). Evidence je
 *     v návrhu vždy uložená jako doslovný úryvek, který rozhodl — návrh
 *     bez úryvku nevznikne.
 *   NEDOKLÁDÁ: obsahovou totožnost dvou článků. Rodina „ctk" říká
 *     „původ je agenturní zpráva ČTK", ne „tyhle dva články jsou
 *     identické". To je přesně ta vlastnost, kterou S2 potřebuje.
 *   NEDOKLÁDÁ ÚPLNOST: stránka za paywallem, 403 nebo bez podpisu končí
 *     verdiktem `unknown`. `unknown` NENÍ „vlastní zpravodajství" —
 *     je to přiznané „nezjištěno" a rodina se nevyplní.
 *
 * HÁDÁNÍ JE ZAKÁZÁNO
 * ------------------
 * Skript nikdy neodvozuje rodinu z outletu, z domény ani z podobnosti
 * titulků. Rozhoduje jen doslovný kredit ve třech ANKOTVENÝCH oblastech
 * (viz extractCredits): strojová metadata, podpisový element, patička
 * „Zdroj: …". Zmínka „řekl ČTK" uprostřed textu je běžná i ve vlastním
 * zpravodajství a verdikt NESMÍ ovlivnit — proto se tělo článku
 * neprohledává.
 *
 * DVA KROKY, ODDĚLENÉ ZÁMĚRNĚ
 * ---------------------------
 * 1) detekce (výchozí režim) NIC nezapisuje do kanonických dat. Píše jen
 *    data/generated/source-family-proposals.json + reports/…md. Chybný
 *    detektor tak nikdy nezmění dossier.
 * 2) `--apply <proposals.json>` je samostatný, vědomý krok. Zapisuje jen
 *    verdikt `ctk` a jen tam, kde je pole dosud prázdné. Nikdy
 *    nepřepisuje existující hodnotu, nikdy nemaže, ostatní verdikty
 *    (`own`, `unknown`, i navržené jiné rodiny) ignoruje — ty patří
 *    člověku.
 *
 * Použití:
 *   node scripts/osint/detect-source-family.mjs
 *   node scripts/osint/detect-source-family.mjs --dossier=andrej-babis --limit=20
 *   node scripts/osint/detect-source-family.mjs --apply data/generated/source-family-proposals.json
 *   ... [--no-cache] [--rate=600] [--timeout=20000] [--json]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const JSON_OUT = join(ROOT, "data/generated/source-family-proposals.json");
export const MD_OUT = join(ROOT, "reports/source-family-proposals.md");
export const CACHE_DIR = join(ROOT, ".tmp/source-family");
const DOSSIERS_DIR = join(ROOT, "data", "dossiers");

const RATE_LIMIT_MS = 600;
const REQUEST_TIMEOUT_MS = 20_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; vomaste-source-family/1.0; +https://vomaste.cz/) detekce zdrojové rodiny";

// --- kam se v DETEKČNÍM režimu smí zapisovat ------------------------------

/* Stejný princip jako u screen-public-money.mjs: detekce je interní
   přehled, ne publikace. `content/` je publikační plocha webu a
   `data/dossiers/` je kanonický model stojící na ručně autorizovaných
   rozhodnutích — do ani jednoho nesmí detekce zasáhnout. Zápis do
   data/dossiers/ dělá VÝHRADNĚ režim --apply, přes applySourceFamily(),
   který má vlastní, přísnější zámky. */
const WRITABLE_ROOTS = [
  join(ROOT, "data", "generated") + sep,
  join(ROOT, "reports") + sep,
  join(ROOT, ".tmp") + sep,
];

export function assertWritablePath(path) {
  const abs = resolve(path);
  const insideRepo = abs.startsWith(ROOT + sep);
  if (insideRepo && !WRITABLE_ROOTS.some((root) => abs.startsWith(root))) {
    throw new Error(
      `detect-source-family: zápis mimo povolené cesty odmítnut: ${abs}\n` +
        `  detekce smí psát jen do data/generated/, reports/ a .tmp/`,
    );
  }
  return abs;
}

// --- argumenty -------------------------------------------------------------

export function parseArgs(argv) {
  const out = { _: [] };
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/s);
    if (m) out[m[1]] = m[2] ?? true;
    else out._.push(a);
  }
  return out;
}

// --- kanonické zdroje ------------------------------------------------------

/*
 * Kandidáti detekce: kanonické zdroje s PRÁZDNOU rodinou a s URL. Zdroj
 * s už vyplněnou rodinou se nečte znovu — jednou rozhodnutá rodina je
 * lidské rozhodnutí a detektor ho nesmí revidovat.
 */
export function loadCandidates(dossiersDir = DOSSIERS_DIR) {
  const out = [];
  if (!existsSync(dossiersDir)) return out;
  for (const dossier of readdirSync(dossiersDir).sort()) {
    const dir = join(dossiersDir, dossier, "sources");
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      const path = join(dir, file);
      let record;
      try {
        record = JSON.parse(readFileSync(path, "utf8"));
      } catch {
        continue; // nečitelný soubor je věc data:validate, ne detekce
      }
      const family = typeof record.sourceFamily === "string" ? record.sourceFamily.trim() : "";
      if (family) continue;
      if (typeof record.url !== "string" || !record.url) continue;
      out.push({
        dossier,
        id: record.identifier ?? file.replace(/\.json$/, ""),
        url: record.url,
        outlet: record.outlet ?? null,
        path,
      });
    }
  }
  return out;
}

// --- HTML: ankotvené oblasti, ve kterých kredit smí platit -----------------

const stripTags = (html) => html.replace(/<[^>]*>/g, " ");

export function decodeEntities(text) {
  return String(text)
    .replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, ref) => {
      if (ref[0] === "#") {
        const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—" };
      return named[ref.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/* Skripty a styly se zahazují, aby analytika, reklamní tagy a inline JSON
   nevytvářely falešné podpisy.
   keepJsonLd=true nechá <script type="application/ld+json"> — to je
   deklarované strojové metadatum, ne kód, a čte ho jsonLdAuthors.
   Pro TEXTOVÉ skeny (patička, sigla) musí zmizet i ono: JSON-LD nese
   popisky fotek typu `"caption":"Zdroj: ČTK/Michal Kamaryt"` a po
   odstranění tagů by se z nich stal „text stránky", který tam nikdy
   nebyl. */
function stripScripts(html, { keepJsonLd = false } = {}) {
  const scripts = keepJsonLd
    ? /<script\b(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi
    : /<script\b[\s\S]*?<\/script>/gi;
  return html
    .replace(scripts, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

/* JSON-LD `author` — bere jméno i typ (Person/Organization), protože typ
   je jediný spolehlivý rozlišovač „jmenovitý autor" vs. „vydavatel". */
export function jsonLdAuthors(html) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(walk);
    for (const [key, value] of Object.entries(node)) {
      if (key.toLowerCase() === "author" || key.toLowerCase() === "creator") {
        for (const a of Array.isArray(value) ? value : [value]) {
          if (typeof a === "string") out.push({ name: a, type: null });
          else if (a && typeof a === "object" && typeof a.name === "string") {
            out.push({ name: a.name, type: typeof a["@type"] === "string" ? a["@type"] : null });
          }
        }
      }
      if (value && typeof value === "object") walk(value);
    }
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1].trim()));
    } catch {
      // Rozbité JSON-LD je chyba vydavatele; ostatní signály platí dál.
    }
  }
  return out;
}

/* Strojová metadata autora: <meta name="author">, article:author,
   dc.creator. Všechny výskyty, ne první — Blesk.cz nese vedle vlastního
   `CZECH NEWS CENTER a. s.` i `ČTK` a rozhoduje ten druhý. */
export function metaAuthors(html) {
  const out = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const key = (tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i) ?? [])[1];
    if (!key) continue;
    if (!/^(author|article:author|dc\.creator|dcterms\.creator|cXenseParse:author)$/i.test(key.trim())) continue;
    const content = (tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) ?? [])[1];
    if (content && content.trim()) out.push({ raw: tag.trim(), value: decodeEntities(content) });
  }
  return out;
}

/* Podpisový blok: element, jehož class/id pojmenovává autora, podpis nebo
   zdroj. Tady žije viditelná byline typu „Echo24, čtk" nebo „ČTK,red".
   Delší než 200 znaků = nejde o podpis, ale o odstavec textu, který se
   sem dostal širokou class — takový se zahazuje. */
const BYLINE_ATTR = /\b(?:class|id|itemprop|rel)\s*=\s*["'][^"']*(author|byline|by-line|autor|podpis|signature|zdroj|source-credit|article-meta|articleMeta)[^"']*["']/i;

export function bylineTexts(html) {
  const out = [];
  const re = /<(span|div|p|a|li|address|footer|small|em|strong|cite)\b([^>]*)>([\s\S]{0,600}?)<\/\1>/gi;
  for (const m of html.matchAll(re)) {
    if (!BYLINE_ATTR.test(m[2])) continue;
    const text = decodeEntities(stripTags(m[3]));
    if (!text || text.length > 200) continue;
    out.push(text);
  }
  return [...new Set(out)];
}

/* Patička „Zdroj: ČTK" a odkaz na autorský rozcestník /author/ctk/.
   Obojí je explicitní kredit původu, ne zmínka v textu. */
/*
 * Fotografický kredit NENÍ kredit textu. „Zdroj: ČTK/Michal Kamaryt" pod
 * fotkou znamená, že snímek je z ČTK — o autorovi článku neříká nic, a
 * vlastní reportáž ilustrovaná agenturní fotkou je úplně běžná. Kdyby se
 * tohle počítalo, spadly by do rodiny „ctk" i texty, které s agenturou
 * nemají nic společného, a tvrzení by se snižovala bez důvodu.
 *
 * Poznávací znaky: fotobanka v seznamu, nebo jméno fotografa za lomítkem
 * či čárkou (v obou obvyklých pořadích, „Michal Kamaryt" i „Šálek Václav").
 */
const PHOTO_AGENCY = /profimedia|shutterstock|getty|istock|pixabay|depositphotos|enex|reuters pictures/i;
const PHOTOGRAPHER = /[\/,]\s*\p{Lu}\p{L}+\s+\p{Lu}\p{L}+\s*$/u;

export function isPhotoCredit(text) {
  const value = String(text).trim();
  return PHOTO_AGENCY.test(value) || PHOTOGRAPHER.test(value);
}

export function creditFooters(html) {
  const out = [];
  /* „Zdroj: …" se čte z HTML, ne z odstrojeného textu, a končí na první
     značce. Odstrojený text slepí sousední elementy dohromady, takže by
     se do kreditu přilepila navigace („Zdroj: ČT24 , ČTK , Právo Nahrávám
     video Události…") a filtr fotokreditů by pak rozhodoval o textu,
     který na stránce vedle sebe vůbec nestojí. */
  for (const m of html.matchAll(/(?:Zdroj|Zdroje|Source)\s*:\s*([^<>{}|]{1,60}?)\s*(?=<|$)/gi)) {
    const value = decodeEntities(m[1]);
    if (!value || isPhotoCredit(value)) continue;
    out.push({ text: value, evidence: `patička: „Zdroj: ${value}"` });
  }
  /* Popisek a hodnota bývají v různých elementech: Tiscali.cz vysází
     `<small>Zdroje:</small>` a název agentury až o dva divy dál. Bere se
     PRVNÍ textový uzel za popiskem, přes nejvýš šest značek — zůstává to
     bodová sonda, ne čtení celého zbytku stránky. */
  for (const m of html.matchAll(/(?:Zdroj|Zdroje|Source)\s*:\s*(?:<[^<>]{0,200}>\s*){1,6}([^<>{}|]{1,60}?)\s*(?=<)/gi)) {
    const value = decodeEntities(m[1]);
    if (!value || isPhotoCredit(value)) continue;
    out.push({ text: value, evidence: `patička (odděleným elementem): „Zdroj: ${value}"` });
  }
  /* Odkaz na autorský rozcestník (/author/ctk/, /cz/autori/ctk). Slug je
     strojová identita autora — bezpečnější než viditelný text, protože
     ho vydavatel nepřepisuje podle rubriky. Čte se i jako čitelné jméno,
     aby jmenovitý autor prošel testem osoby.

     Berou se jen PRVNÍ TŘI různé slugy: podpis článku má jednoho až dva
     autory a stojí nahoře, kdežto dál na stránce běží widgety typu
     „nejčtenější autoři". Seznam Zprávy takový widget vykresluje na každé
     stránce včetně odkazu na Reuters a ČTK — bez tohohle omezení by každý
     jejich vlastní text dostal cizí agenturní rodinu. */
  const slugs = [];
  for (const m of html.matchAll(/href\s*=\s*["'][^"']*\/(?:author|autor|autori|autors|redakce)\/([a-zA-Z0-9\-]{2,40})\/?["']/g)) {
    const slug = m[1].toLowerCase();
    if (!slugs.includes(slug)) slugs.push(slug);
    if (slugs.length >= 3) break;
  }
  for (const slug of slugs) {
    const readable = slug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    out.push({ text: readable, evidence: `odkaz na autorský rozcestník /${slug}/` });
  }
  // Samostatná agenturní značka na konci odstavce: (čtk), –ČTK/RED–,
  // - ČTK -, /čtk/. Ankotveno na obalové znaky, aby „řekl ČTK" nechytlo.
  const text = decodeEntities(stripTags(html));
  for (const m of text.matchAll(/[(\[\-–—/]\s*(?:[a-zA-ZÁ-Žá-ž0-9]{2,12}\s*[,/+]\s*)*čtk(?:\s*[,/+]\s*[a-zA-ZÁ-Žá-ž0-9]{2,12})*\s*[)\]\-–—/]/gi)) {
    const mark = m[0].trim();
    if (isPhotoCredit(mark)) continue;
    out.push({ text: mark, evidence: `agenturní značka: „${mark}"` });
  }
  const seen = new Set();
  return out.filter((c) => c.text && !seen.has(c.evidence) && seen.add(c.evidence));
}

/*
 * Sigla-podpis: samostatný odstavec, jehož CELÝ text je krátký seznam
 * redakčních zkratek — „čtk, tb", „ČTK,red", „ČTK, jas". Tenhle tvar
 * nemá autorskou class ani metadatum (Respekt, informační servis), takže
 * by jinak propadl.
 *
 * Vědomě úzké: bere jen <p>, jen do 60 znaků a jen když seznam obsahuje
 * agenturní token. Bez té podmínky by pravidlo chytalo krátké odstavce
 * patiček a navigace — např. copyright „ČTK" v zápatí Seznamu — a
 * vyrábělo by rodinu tam, kde je jen licenční doložka.
 */
const SIGLA_LIST = /^[\p{L}\d]{2,14}(?:\s*[,/+]\s*[\p{L}\d]{2,14}){0,3}$/u;
const AGENCY_SIGLA = /(^|[^\p{L}])(čtk|ctk)([^\p{L}]|$)/iu;

export function siglaBylines(html) {
  const out = [];
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]{0,200}?)<\/p>/gi)) {
    const text = decodeEntities(stripTags(m[1]));
    if (!text || text.length > 60) continue;
    if (!SIGLA_LIST.test(text)) continue;
    if (!AGENCY_SIGLA.test(text)) continue;
    out.push(text);
  }
  return [...new Set(out)];
}

/*
 * Všechny kredity stránky s uvedením oblasti a váhy. Pořadí = síla
 * důkazu: strojové metadatum > podpisový element > patička.
 */
export function extractCredits(html) {
  const clean = stripScripts(html, { keepJsonLd: true });
  const text = stripScripts(html);
  const credits = [];
  for (const a of metaAuthors(clean)) {
    credits.push({ region: "meta", text: a.value, evidence: a.raw, confidence: "high" });
  }
  for (const a of jsonLdAuthors(clean)) {
    credits.push({
      region: "jsonld",
      text: a.name,
      evidence: `JSON-LD author${a.type ? ` (@type ${a.type})` : ""}: ${a.name}`,
      confidence: "high",
      type: a.type,
    });
  }
  for (const t of bylineTexts(text)) {
    credits.push({ region: "byline", text: t, evidence: `podpis: „${t}"`, confidence: "medium" });
  }
  for (const t of siglaBylines(text)) {
    credits.push({ region: "sigla", text: t, evidence: `sigla-podpis: „${t}"`, confidence: "medium" });
  }
  for (const c of creditFooters(text)) {
    credits.push({ region: "footer", text: c.text, evidence: c.evidence, confidence: "medium" });
  }
  return credits;
}

// --- kredit → rodina -------------------------------------------------------

/* Token agentury musí stát samostatně (hranice = cokoli, co není
   písmeno). „ČTKová" ani „poČTKu" tím nechytne. */
const tokenRe = (token) => new RegExp(`(^|[^\\p{L}])${token}([^\\p{L}]|$)`, "iu");

/*
 * Známé značky PŮVODU, ne vydavatele. Rodina se pojmenovává podle toho,
 * kdo zprávu napsal — proto přetisk ČTK v Blesku patří do rodiny „ctk",
 * ne „blesk". Rozšiřuje se jen o značku, kterou lze doslovně přečíst
 * z kreditu; nikdy o doménu ani o odhad.
 */
export const ORIGIN_MARKERS = [
  { family: "ctk", label: "ČTK", match: tokenRe("čtk"), autoApply: true },
  // ASCII varianta: autorské slugy (/author/ctk/, /cz/autori/ctk) a
  // redakční systémy bez diakritiky. „ctk" není české slovo, takže jako
  // samostatný token v ankotvené oblasti nemá jiný výklad.
  { family: "ctk", label: "ctk (autorský slug)", match: tokenRe("ctk"), autoApply: true },
  { family: "ctk", label: "ceskenoviny.cz (ČTK)", match: /ceskenoviny\.cz/i, autoApply: true },
  { family: "seznam-zpravy-syndication", label: "Seznam Zprávy", match: /seznam\s*zpráv|seznamzpravy\.cz/i, autoApply: false },
  { family: "reuters", label: "Reuters", match: tokenRe("reuters"), autoApply: false },
  // Záměrně jen plný název: holé „AP" je v češtině běžná zkratka i slabika
  // a jako značka původu by generovalo šum, ne důkaz.
  { family: "associated-press", label: "Associated Press", match: /associated\s+press/i, autoApply: false },
  { family: "afp", label: "AFP", match: tokenRe("afp"), autoApply: false },
];

/* Vydavatelské/organizační podpisy — NEJSOU jmenovitý autor. „Redakce"
   nebo „CZECH NEWS CENTER a. s." nedokládá vlastní zpravodajství, jen to,
   že článek nikdo nepodepsal jménem. */
const ORG_HINT =
  /\b(a\.\s*s\.|s\.\s*r\.\s*o\.|spol\.|redakce|redaktor|newsroom|media|network|center|centre|publishing|vydavatel|group|holding|zpravodajství|online|\.cz|\.com|\.eu|©)/i;

/* Jmenovitý autor: 2–4 slova začínající velkým písmenem, tj. tvar
   lidského jména. Jedno slovo („Novinky", „Kolektiv") se za jméno
   nepovažuje — právě jednoslovné podpisy jsou v praxi značky, ne lidé. */
export function looksLikePersonName(text) {
  const cleaned = String(text).replace(/^(?:napsal[a]?|autor|by)\s*:?\s*/i, "").trim();
  if (!cleaned || cleaned.length > 60) return false;
  if (ORG_HINT.test(cleaned)) return false;
  const words = cleaned.split(/\s+/);
  if (words.length < 2 || words.length > 4) return false;
  // Verzálkové zkratky (FTV Prima) a slova s číslicí (Hrot24 HG8w7) jsou
  // značky, ne jména — jinak by se vydavatel vydával za jmenovitého autora.
  if (words.some((w) => /\d/.test(w) || (w.length > 1 && w === w.toUpperCase()))) return false;
  return words.every((w) => /^\p{Lu}[\p{L}'’.-]{1,}$/u.test(w));
}

/*
 * Verdikt nad jednou stránkou.
 *
 * Vrací { verdict, family, evidence, confidence, signal }:
 *   verdict "ctk"      — rodina ČTK, jediný verdikt, který smí zapsat --apply
 *   verdict <rodina>   — jiný doložený původ (např. seznam-zpravy-syndication);
 *                        NÁVRH pro člověka, --apply ho ignoruje
 *   verdict "own"      — jmenovitý autor bez agenturní značky ⇒ rodinu
 *                        NEVYPLŇOVAT, fallback na outlet je správný
 *   verdict "unknown"  — nezjištěno (bez podpisu, paywall, 403) ⇒ rodinu
 *                        NEVYPLŇOVAT a vykázat
 *
 * options.outlet slouží jen k jedinému rozlišení: kredit „Seznam Zprávy"
 * na stránce Seznam Zpráv je vlastní podpis, ne přetisk.
 */
export function detectFamily(html, options = {}) {
  if (typeof html !== "string" || html.trim() === "") {
    return { verdict: "unknown", family: null, evidence: null, confidence: "none", signal: "empty-body" };
  }
  const credits = extractCredits(html);
  const outlet = String(options.outlet ?? "");

  /* PRVNÍ PRŮCHOD — značka původu. Má přednost před jmenovitým autorem
     ve VŠECH oblastech, protože doktrína zní „podpis obsahuje ČTK ⇒
     rodina ctk": byline „Martin Kézr, ČTK" je agenturní zpráva, kterou
     jen redaktor převzal, a Advokátní deník uvádí jmenovitou autorku
     v metadatech a ČTK až v patičce. Kdyby rozhodovala síla oblasti,
     obojí by spadlo do „own" a badge CORROBORATED by lhal dál.
     Uvnitř průchodu se kredity berou v pořadí meta → JSON-LD → podpis →
     sigla → patička, takže evidence je vždy ta nejsilnější dostupná. */
  for (const credit of credits) {
    for (const marker of ORIGIN_MARKERS) {
      if (!marker.match.test(credit.text) && !marker.match.test(credit.evidence)) continue;
      // Vlastní značka vydavatele v jeho vlastním podpisu není přetisk.
      if (marker.family !== "ctk" && marker.match.test(outlet)) continue;
      return {
        verdict: marker.family,
        family: marker.family,
        evidence: `${credit.evidence}`,
        confidence: credit.confidence,
        signal: `${credit.region}:${marker.label}`,
      };
    }
  }

  /* DRUHÝ PRŮCHOD — jmenovitý autor bez agenturní značky. Rodina se
     NEVYPLŇUJE (fallback na outlet je správný), verdikt je jen zpráva
     pro report. */
  for (const credit of credits) {
    if (!looksLikePersonName(credit.text)) continue;
    const person = credit.region === "jsonld" && credit.type && /person/i.test(credit.type);
    return {
      verdict: "own",
      family: null,
      evidence: credit.evidence,
      confidence: person ? "high" : credit.confidence,
      signal: person ? "jsonld:Person" : `${credit.region}:person`,
    };
  }

  return {
    verdict: "unknown",
    family: null,
    evidence: credits.length > 0 ? `nerozhodné kredity: ${credits.slice(0, 3).map((c) => c.text).join(" | ")}` : null,
    confidence: "none",
    signal: credits.length > 0 ? "credits-inconclusive" : "no-credit",
  };
}

// --- síť -------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cacheName = (url) => `${createHash("sha1").update(url).digest("hex")}.html`;

/*
 * Dekódování těla podle SKUTEČNÉ znakové sady stránky, ne podle přání.
 * Není to detail: Hospodářské noviny jedou dodnes ve windows-1250 a
 * slepé UTF-8 z „ČTK" udělá „?TK" — detektor by pak agenturní podpis
 * neviděl a zdroj by tiše prošel jako nezjištěný. Ticho, které vypadá
 * jako „nic tam není", je nejhorší možná chyba tohohle nástroje.
 */
export function decodeBody(buffer, contentType = "") {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 4096));
  const charset = (
    /charset\s*=\s*["']?([\w-]+)/i.exec(contentType ?? "")?.[1] ??
    /<meta[^>]+charset\s*=\s*["']?([\w-]+)/i.exec(head)?.[1] ??
    /<meta[^>]+content\s*=\s*["'][^"']*charset=([\w-]+)/i.exec(head)?.[1] ??
    "utf-8"
  ).toLowerCase();
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/*
 * Stažení stránky: timeout, jedno zopakování, volitelná cache na disku.
 * Chyba se NIKDY nemaskuje na prázdné tělo — vrací se `{ ok:false }`
 * a z ní plyne verdikt `unknown`, ne „vlastní zpravodajství".
 */
export async function fetchHtml(url, options = {}) {
  const {
    fetchImpl = globalThis.fetch,
    timeoutMs = REQUEST_TIMEOUT_MS,
    retries = 1,
    cacheDir = null,
    sleepImpl = sleep,
  } = options;

  if (cacheDir && existsSync(join(cacheDir, cacheName(url)))) {
    return { ok: true, status: 200, html: readFileSync(join(cacheDir, cacheName(url)), "utf8"), cached: true };
  }

  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return { ok: false, status: response.status, html: null, error: `HTTP ${response.status}` };
        }
      } else {
        const html =
          typeof response.arrayBuffer === "function"
            ? decodeBody(await response.arrayBuffer(), response.headers?.get?.("content-type") ?? "")
            : await response.text();
        if (cacheDir) {
          mkdirSync(cacheDir, { recursive: true });
          writeFileSync(join(cacheDir, cacheName(url)), html);
        }
        return { ok: true, status: response.status, html, cached: false };
      }
    } catch (error) {
      lastError = error?.name === "TimeoutError" ? `timeout ${timeoutMs} ms` : (error?.message ?? String(error));
    }
    if (attempt < retries) await sleepImpl(1000);
  }
  return { ok: false, status: null, html: null, error: lastError ?? "neznámá chyba" };
}

/*
 * Detekce nad seznamem kandidátů. Rate limit je tvrdý požadavek slušnosti
 * vůči cizím serverům, ne optimalizace — proto je v jádru, ne v CLI.
 */
export async function detectAll(candidates, options = {}) {
  const { rateLimitMs = RATE_LIMIT_MS, onProgress = null, sleepImpl = sleep, ...fetchOptions } = options;
  const proposals = [];
  for (const [index, candidate] of candidates.entries()) {
    if (index > 0) await sleepImpl(rateLimitMs);
    const response = await fetchHtml(candidate.url, fetchOptions);
    const detected = response.ok
      ? detectFamily(response.html, { outlet: candidate.outlet })
      : {
          verdict: "unknown",
          family: null,
          evidence: null,
          confidence: "none",
          signal: `fetch-failed: ${response.error}`,
        };
    const proposal = {
      dossier: candidate.dossier,
      id: candidate.id,
      url: candidate.url,
      outlet: candidate.outlet,
      path: candidate.path,
      verdict: detected.verdict,
      family: detected.family,
      evidence: detected.evidence,
      confidence: detected.confidence,
      signal: detected.signal,
      httpStatus: response.status ?? null,
    };
    proposals.push(proposal);
    if (onProgress) onProgress(proposal, index + 1, candidates.length);
  }
  return proposals;
}

// --- výstupy ---------------------------------------------------------------

export function summarize(proposals) {
  const byVerdict = {};
  for (const p of proposals) byVerdict[p.verdict] = (byVerdict[p.verdict] ?? 0) + 1;
  return { processed: proposals.length, byVerdict };
}

export function renderMarkdown(proposals, meta = {}) {
  const summary = summarize(proposals);
  const group = (predicate) => proposals.filter(predicate);
  const ctk = group((p) => p.verdict === "ctk");
  const own = group((p) => p.verdict === "own");
  const unknown = group((p) => p.verdict === "unknown");
  const other = group((p) => !["ctk", "own", "unknown"].includes(p.verdict));

  const row = (p) =>
    `| ${p.dossier} | ${p.id} | ${p.outlet ?? "—"} | ${p.confidence} | ${String(p.evidence ?? "—").replace(/\|/g, "\\|").slice(0, 180)} |`;
  const table = (rows) =>
    rows.length === 0
      ? "_(žádný)_"
      : ["| Dossier | ID | Outlet | Jistota | Evidence |", "|---|---|---|---|---|", ...rows.map(row)].join("\n");

  return `# Návrhy zdrojových rodin

> **Generováno** \`npm run sources:detect-family\` — needitovat ručně.
> Vygenerováno: ${meta.generatedAt ?? "—"}${meta.note ? `\n> ${meta.note}` : ""}

Tenhle report je **návrh, ne zápis**. Detekce sama nic do
\`data/dossiers/**\` nezapisuje; rodinu vyplní až vědomý krok
\`node scripts/osint/detect-source-family.mjs --apply data/generated/source-family-proposals.json\`,
a to **jen u verdiktu \`ctk\`**.

**Co verdikt znamená**

| Verdikt | Význam | Zapisuje \`--apply\`? |
|---|---|---|
| \`ctk\` | doložený kredit ČTK v metadatech, podpisu nebo patičce | ano, do prázdného pole |
| jiná rodina | doložený jiný původ (přetisk cizí redakce/agentury) | ne — rozhoduje člověk |
| \`own\` | jmenovitý autor bez agenturní značky ⇒ rodina se **nevyplňuje** (fallback na outlet je správný) | ne |
| \`unknown\` | nezjištěno (paywall, 403, chybějící podpis) ⇒ rodina se **nevyplňuje** | ne |

## Souhrn

| Verdikt | Počet |
|---|---|
${Object.entries(summary.byVerdict)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| \`${k}\` | ${v} |`)
  .join("\n") || "| — | 0 |"}
| **celkem zpracováno** | **${summary.processed}** |

## Verdikt \`ctk\` (${ctk.length})

${table(ctk)}

## Jiné navržené rodiny (${other.length})

${
  other.length === 0
    ? "_(žádná)_"
    : [
        "| Dossier | ID | Outlet | Navržená rodina | Evidence |",
        "|---|---|---|---|---|",
        ...other.map(
          (p) =>
            `| ${p.dossier} | ${p.id} | ${p.outlet ?? "—"} | \`${p.family}\` | ${String(p.evidence ?? "—").replace(/\|/g, "\\|").slice(0, 180)} |`,
        ),
      ].join("\n")
}

## Verdikt \`own\` — vlastní zpravodajství, rodina se nevyplňuje (${own.length})

${table(own)}

## Verdikt \`unknown\` — nezjištěno, rodina se nevyplňuje (${unknown.length})

${
  unknown.length === 0
    ? "_(žádný)_"
    : [
        "| Dossier | ID | Outlet | HTTP | Důvod |",
        "|---|---|---|---|---|",
        ...unknown.map(
          (p) =>
            `| ${p.dossier} | ${p.id} | ${p.outlet ?? "—"} | ${p.httpStatus ?? "—"} | ${String(p.signal).replace(/\|/g, "\\|").slice(0, 160)} |`,
        ),
      ].join("\n")
}
`;
}

export function writeOutputs(proposals, meta = {}, paths = {}) {
  const jsonPath = assertWritablePath(paths.json ?? JSON_OUT);
  const mdPath = assertWritablePath(paths.md ?? MD_OUT);
  mkdirSync(dirname(jsonPath), { recursive: true });
  mkdirSync(dirname(mdPath), { recursive: true });
  const doc = { generatedAt: meta.generatedAt ?? new Date().toISOString(), ...summarize(proposals), proposals };
  writeFileSync(jsonPath, `${JSON.stringify(doc, null, 2)}\n`);
  writeFileSync(mdPath, renderMarkdown(proposals, { generatedAt: doc.generatedAt, ...meta }));
  return { jsonPath, mdPath };
}

// --- --apply ---------------------------------------------------------------

/*
 * Vloží `sourceFamily` hned za `outlet` (pořadí klíčů kanonického
 * zdroje). Zápis se dělá přes serializaci s dvěma mezerami a koncovým
 * newlinem, aby diff obsahoval JEDINÝ řádek — celý smysl kroku je, aby
 * byl v code review triviálně čitelný.
 */
function withSourceFamily(record, family) {
  const out = {};
  let inserted = false;
  for (const [key, value] of Object.entries(record)) {
    out[key] = value;
    if (key === "outlet") {
      out.sourceFamily = family;
      inserted = true;
    }
  }
  if (!inserted) out.sourceFamily = family;
  return out;
}

/*
 * Aplikace návrhů. Zapisuje VÝHRADNĚ verdikt `ctk` a VÝHRADNĚ do
 * prázdného pole. Existující rodinu nikdy nepřepíše ani nesmaže —
 * kolize se hlásí jako `skipped` s důvodem, ne jako tichá změna.
 * options.dryRun: nic nezapisuje, jen vrátí plán.
 */
export function applyProposals(proposals, options = {}) {
  const { dryRun = false, root = ROOT } = options;
  const written = [];
  const skipped = [];
  for (const p of proposals) {
    if (p.verdict !== "ctk") {
      skipped.push({ ...p, reason: `verdikt "${p.verdict}" se nezapisuje — zapisuje se jen "ctk"` });
      continue;
    }
    const path = p.path && resolve(p.path).startsWith(resolve(root) + sep)
      ? resolve(p.path)
      : join(root, "data", "dossiers", p.dossier, "sources", `${String(p.id).toLowerCase()}.json`);
    if (!existsSync(path)) {
      skipped.push({ ...p, reason: `soubor neexistuje: ${path}` });
      continue;
    }
    const record = JSON.parse(readFileSync(path, "utf8"));
    const existing = typeof record.sourceFamily === "string" ? record.sourceFamily.trim() : "";
    if (existing) {
      skipped.push({ ...p, reason: `rodina už je vyplněná ("${existing}") — --apply nikdy nepřepisuje` });
      continue;
    }
    if (!dryRun) writeFileSync(path, `${JSON.stringify(withSourceFamily(record, "ctk"), null, 2)}\n`);
    written.push({ ...p, path });
  }
  return { written, skipped };
}

// --- CLI -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.apply) {
    const path = typeof args.apply === "string" ? args.apply : args._[0];
    if (!path) throw new Error("detect-source-family: --apply potřebuje cestu k proposals.json");
    const doc = JSON.parse(readFileSync(path, "utf8"));
    const proposals = Array.isArray(doc) ? doc : (doc.proposals ?? []);
    const { written, skipped } = applyProposals(proposals, { dryRun: Boolean(args["dry-run"]) });
    console.log(`Zapsáno: ${written.length} zdroj(ů) s rodinou "ctk"${args["dry-run"] ? " (dry-run, nic se nezapsalo)" : ""}`);
    for (const w of written) console.log(`  + ${w.dossier}/${w.id} — ${w.evidence ?? ""}`);
    console.log(`Přeskočeno: ${skipped.length}`);
    const reasons = {};
    for (const s of skipped) reasons[s.reason] = (reasons[s.reason] ?? 0) + 1;
    for (const [reason, count] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
      console.log(`  – ${count}× ${reason}`);
    }
    return;
  }

  let candidates = loadCandidates();
  if (args.dossier) candidates = candidates.filter((c) => c.dossier === args.dossier);
  if (args.limit) candidates = candidates.slice(0, Number(args.limit));

  console.log(`Kandidátů (prázdná rodina + URL): ${candidates.length}`);
  const proposals = await detectAll(candidates, {
    rateLimitMs: args.rate ? Number(args.rate) : RATE_LIMIT_MS,
    timeoutMs: args.timeout ? Number(args.timeout) : REQUEST_TIMEOUT_MS,
    cacheDir: args["no-cache"] ? null : CACHE_DIR,
    onProgress: (p, i, total) => {
      if (i % 25 === 0 || i === total) console.log(`  … ${i}/${total}`);
    },
  });

  const { jsonPath, mdPath } = writeOutputs(proposals, {});
  const summary = summarize(proposals);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Návrhy: ${jsonPath}`);
  console.log(`Report: ${mdPath}`);
  console.log("Zápis do kanonických dat NEPROBĚHL — spusť --apply, pokud návrhům věříš.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
