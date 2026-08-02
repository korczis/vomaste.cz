#!/usr/bin/env node
/*
 * Screening toku veřejných prostředků k danému IČO — z registru smluv
 * (ISRS, zákon č. 340/2015 Sb.).
 *
 * Pro zadaná IČO spočítá, kolik smluv se subjektem uzavřely veřejné
 * instituce v pokrytém období, jaký je jejich deklarovaný objem a kdo
 * jsou objednatelé. Výstup je INTERNÍ přehled (data/generated/ + reports/),
 * nikdy se neroutuje na web a není autorizačním rozhodnutím.
 *
 * CO TENHLE NÁSTROJ DOKLÁDÁ A CO NE — přečti před citací
 * ------------------------------------------------------
 *   DOKLÁDÁ: že v registru smluv existují zveřejněné smlouvy, ve kterých
 *     subjekt vystupuje jako smluvní strana, s uvedeným objednatelem,
 *     datem a (pokud je vyplněna) hodnotou.
 *   NEDOKLÁDÁ: jakékoli pochybení. Uzavřená veřejná smlouva je běžný,
 *     zákonem předpokládaný a povinně zveřejňovaný jev. Vysoký objem není
 *     tvrzení o korupci, o předražení ani o čemkoli jiném — je to jen
 *     objem. Interpretace vyžaduje člověka a další zdroje.
 *   NEDOKLÁDÁ ANI ÚPLNOST: registr obsahuje smlouvy nad 50 000 Kč od
 *     1. 7. 2016, se zákonnými výjimkami. Chybějící záznam neznamená
 *     „subjekt nedostal veřejné peníze"; znamená „v pokrytém období není
 *     v registru zveřejněná smlouva".
 *
 * ODKUD SE ČTOU DATA
 * ------------------
 * Z oficiálních měsíčních otevřených dat ISRS:
 *   https://data.smlouvy.gov.cz/dump_<RRRR>_<MM>.xml
 * To je jediné dokumentované strojové rozhraní registru, které umožňuje
 * dotaz podle IČO bez scrapování HTML. Web smlouvy.gov.cz/vyhledavani je
 * lidské rozhraní; jeho HTML není kontrakt a rozpadlo by se při první
 * změně šablony, proto ho tenhle skript záměrně nečte.
 *
 * ⚠️ NEOVĚŘENO ŽIVÝM BĚHEM — čti dřív, než výstupu uvěříš
 * -------------------------------------------------------
 * Mapování XML elementů níže (ISRS_DUMP) je napsané podle dokumentované
 * struktury dumpu, NE proti živé odpovědi: v prostředí, kde tenhle skript
 * vznikl, byl host smlouvy.gov.cz i data.smlouvy.gov.cz nedostupný —
 * TCP spojení se naváže, ale TLS handshake server resetuje, a to shodně
 * ze všech dostupných klientů (curl/LibreSSL, Node/OpenSSL,
 * Python/OpenSSL) i z nezávislé síťové cesty. Nebylo tedy možné ověřit
 * ani jeden reálný záznam.
 *
 * Důsledek pro čtenáře výstupu: než tenhle report použiješ jako podklad
 * čehokoli, spusť ho jednou na síti, kde je registr dostupný, a ověř, že
 * počty nejsou nulové kvůli posunu schématu. Skript je proti téhle chybě
 * bráněný konstrukčně (viz assertDumpParsed): dump, ze kterého nevypadne
 * ani jeden záznam, je tvrdá chyba, ne prázdný výsledek. Ticho se tu
 * nikdy nesmí tvářit jako „nic nenalezeno".
 *
 * Použití:
 *   node scripts/osint/screen-public-money.mjs --ico=04449461
 *   node scripts/osint/screen-public-money.mjs --ico=04449461,01529820
 *   node scripts/osint/screen-public-money.mjs --from-external-ids
 *   ... [--from=2025-01] [--to=2025-12] [--json] [--no-cache]
 */
import {
  writeFileSync,
  mkdirSync,
  createWriteStream,
  createReadStream,
  existsSync,
  statSync,
  readdirSync,
  readFileSync,
  renameSync,
} from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// --- kam se smí a nesmí zapisovat -----------------------------------------

/* Výstupy tohohle nástroje jsou interní. `content/` je publikační plocha
   webu a `data/dossiers/` je kanonický datový model — screening do ani
   jednoho nesmí zasáhnout, protože by tím evidenční přehled mlčky
   propadl do publikovaného obsahu nebo do modelu, který stojí na ručně
   autorizovaných rozhodnutích. Vynucuje to assertWritablePath() v kódu,
   ne dobrý úmysl; test na to má statickou bránu. */
export const JSON_OUT = join(ROOT, "data/generated/public-money-screening.json");
export const MD_OUT = join(ROOT, "reports/public-money-screening.md");
export const CACHE_DIR = join(ROOT, ".tmp/public-money");
const ENTITIES_DIR = join(ROOT, "data", "dossiers", "_shared", "entities");

const WRITABLE_ROOTS = [
  join(ROOT, "data", "generated") + sep,
  join(ROOT, "reports") + sep,
  join(ROOT, ".tmp") + sep,
];

/*
 * Brání integritu REPOZITÁŘE: cokoli uvnitř ROOT musí padnout do
 * data/generated/, reports/ nebo .tmp/. Cesta mimo repozitář (dočasný
 * adresář v testech, explicitně zvolený cíl) se nekontroluje — tenhle
 * strážce není obecný sandbox, jeho jediný úkol je, aby se screening
 * nikdy nedostal do publikační plochy (content/) ani do kanonického
 * modelu (data/dossiers/), který stojí na ručně autorizovaných
 * rozhodnutích.
 */
export function assertWritablePath(path) {
  const abs = resolve(path);
  const insideRepo = abs.startsWith(ROOT + sep);
  if (insideRepo && !WRITABLE_ROOTS.some((root) => abs.startsWith(root))) {
    throw new Error(
      `screen-public-money: zápis mimo povolené cesty odmítnut: ${abs}\n` +
        `  povoleno jen: data/generated/, reports/, .tmp/`,
    );
  }
  return abs;
}

// --- mapování ISRS dumpu ---------------------------------------------------

/* JEDINÉ místo, kde žijí názvy elementů registru. Pokud se skutečné
   schéma liší, opravuje se to tady — ne rozsypané po parseru.
   Struktura podle dokumentace otevřených dat ISRS (kořen nese `mesic`,
   `rok`, `casGenerovani`, `dokoncenyMesic` a pak N × `zaznam`). */
export const ISRS_DUMP = {
  record: "zaznam",
  idPath: ["identifikator", "idSmlouvy"],
  versionPath: ["identifikator", "idVerze"],
  validFlag: "platnyZaznam",
  publishedAt: "casZverejneni",
  link: "odkaz",
  contract: "smlouva",
  concludedAt: "casUzavreni",
  subject: "predmet",
  amountWithVat: "hodnotaVcetneDph",
  amountWithoutVat: "hodnotaBezDph",
  publisher: "subjekt", // zveřejňovatel = veřejná instituce = objednatel
  party: "smluvniStrana", // protistrana (0..N)
  partyIsRecipient: "prijemce",
  name: "nazev",
  ico: "ico",
};

const DUMP_URL = (year, month) =>
  `https://data.smlouvy.gov.cz/dump_${year}_${String(month).padStart(2, "0")}.xml`;

const RATE_LIMIT_MS = 600;
const REQUEST_TIMEOUT_MS = 120_000;

// --- argumenty -------------------------------------------------------------

export function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/s);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

export function parseIcoList(raw) {
  const list = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const bad = list.filter((s) => !/^\d{8}$/.test(s));
  if (bad.length > 0) {
    throw new Error(
      `screen-public-money: IČO musí být 8 číslic — nevyhovuje: ${bad.join(", ")}`,
    );
  }
  if (list.length === 0) throw new Error("screen-public-money: --ico je prázdné.");
  return [...new Set(list)];
}

/* Kanonické entity dnes externalIds nemají (0 z 504 k 2026-08-03), takže
   tenhle režim korektně ohlásí nula vstupů. Čte se `ico` (tvar podle
   datového kontraktu) i `ares` — to je klíč, který reálně zapisuje
   expand-entity.mjs, takže režim začne fungovat sám, jakmile expanze
   proběhne. */
export function icosFromEntities(dir = ENTITIES_DIR) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    let record;
    try {
      record = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch {
      continue; // nečitelný soubor je věc data:validate, ne screeningu
    }
    const ext = record?.externalIds;
    if (!ext) continue;
    const ico = ext.ico ?? ext.ares;
    if (typeof ico === "string" && /^\d{8}$/.test(ico)) {
      found.push({ ico, entityId: record.entityId ?? file.replace(/\.json$/, ""), title: record.title });
    }
  }
  return found;
}

// --- období ----------------------------------------------------------------

export function parseMonth(raw, label) {
  const m = String(raw).match(/^(\d{4})-(\d{2})$/);
  if (!m) throw new Error(`screen-public-money: ${label} musí být ve tvaru RRRR-MM (dostal jsem "${raw}").`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) {
    throw new Error(`screen-public-money: ${label} — měsíc mimo rozsah: "${raw}".`);
  }
  return { year, month };
}

/* Registr běží od 1. 7. 2016; starší dump neexistuje. */
const REGISTER_START = { year: 2016, month: 7 };

export function monthsInRange(from, to) {
  const months = [];
  let { year, month } = from;
  const limit = to.year * 12 + to.month;
  if (year * 12 + month > limit) {
    throw new Error("screen-public-money: --from je až za --to.");
  }
  while (year * 12 + month <= limit) {
    months.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

/* Výchozí okno je posledních 12 DOKONČENÝCH měsíců. Běžící měsíc se
   vynechává schválně: jeho dump je neúplný a report by tiše tvrdil nižší
   objem, než jaký nakonec bude. */
export function defaultWindow(today = new Date()) {
  let year = today.getUTCFullYear();
  let month = today.getUTCMonth(); // 0-based → tohle už je minulý měsíc v 1-based
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  const to = { year, month };
  let fromMonth = month - 11;
  let fromYear = year;
  while (fromMonth < 1) {
    fromMonth += 12;
    fromYear -= 1;
  }
  return { from: { year: fromYear, month: fromMonth }, to };
}

export function clampToRegisterStart(from) {
  return from.year * 12 + from.month < REGISTER_START.year * 12 + REGISTER_START.month
    ? { ...REGISTER_START }
    : from;
}

// --- minimální XML parser --------------------------------------------------

/*
 * Záměrně NENÍ obecný XML parser — je to úzký, testovatelný čtenář jednoho
 * známého tvaru. Podporuje jen to, co dump skutečně obsahuje: vnořené
 * elementy, text, CDATA, entity, self-closing značky a namespace prefixy.
 * Atributy se ignorují (nečteme z nich nic) a mixed content nevzniká.
 *
 * Vlastní parser místo závislosti: přidat SAX knihovnu kvůli jednomu
 * dokumentu s pevným tvarem by bylo víc údržbové plochy než tohle, a
 * repo přidává závislosti jen s doloženou potřebou (viz mini-ADR o AJV
 * v docs/data-contract.md).
 */

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function decodeXmlText(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body] ?? whole;
  });
}

const localName = (name) => (name.includes(":") ? name.slice(name.indexOf(":") + 1) : name);

/* CDATA se vyzobne dopředu a nahradí zaescapovaným textem, aby se "<"
   schované uvnitř (hashZaznamu, předmět smlouvy) nepletlo tokenizaci. */
export function stripCdata(xml) {
  return xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, body) =>
    body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  );
}

function attach(target, name, value) {
  if (!(name in target)) target[name] = value;
  else if (Array.isArray(target[name])) target[name].push(value);
  else target[name] = [target[name], value];
}

/*
 * Rozparsuje sourozenecké elementy na dané úrovni. Uzavírací značku hledá
 * s počítáním zanoření stejného jména — bez toho by `<smlouva>` uvnitř
 * `<smlouva>` (ani `<smluvniStrana>` vedle `<smlouva>`) neseděly.
 */
function parseChildren(xml) {
  const out = {};
  const tag = /<([A-Za-z_][\w.-]*(?::[\w.-]+)?)((?:\s[^>]*?)?)(\/?)>/g;
  let match;

  while ((match = tag.exec(xml)) !== null) {
    const rawName = match[1];
    const name = localName(rawName);

    if (match[3] === "/") {
      attach(out, name, "");
      continue;
    }

    const open = `<${rawName}`;
    const close = `</${rawName}>`;
    let depth = 1;
    let scan = tag.lastIndex;
    let end = -1;

    while (depth > 0) {
      const nextClose = xml.indexOf(close, scan);
      if (nextClose === -1) break;
      // započítej jen skutečné otevírací značky téhož jména mezi scan a nextClose
      let probe = xml.indexOf(open, scan);
      while (probe !== -1 && probe < nextClose) {
        const after = xml[probe + open.length];
        // "<smlouva" nesmí chytit "<smluvniStrana": za jménem musí být > nebo bílý znak
        if (after === ">" || after === "/" || /\s/.test(after ?? "")) depth += 1;
        probe = xml.indexOf(open, probe + open.length);
      }
      depth -= 1;
      end = nextClose;
      scan = nextClose + close.length;
    }

    if (end === -1) break; // useknutý dokument — dál už nic smysluplného není

    const inner = xml.slice(tag.lastIndex, end);
    attach(out, name, inner.includes("<") ? parseChildren(inner) : decodeXmlText(inner).trim());
    tag.lastIndex = end + close.length;
  }

  return out;
}

/* Vrací `{ <jméno kořene>: <obsah> }`, nebo null pro prázdný vstup. */
export function parseElement(xml) {
  const parsed = parseChildren(stripCdata(xml));
  return Object.keys(parsed).length === 0 ? null : parsed;
}

// --- streamované krájení dumpu na <zaznam> ---------------------------------

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/*
 * Dump má stovky MB. Nikdy se nedrží v paměti celý: ze streamu se krájí
 * jednotlivé <zaznam>…</zaznam> a spotřebovaný prefix se zahazuje.
 */
export async function* zaznamSlices(source, recordName = ISRS_DUMP.record) {
  const open = `<${recordName}>`;
  const openNs = `<${recordName} `;
  const close = `</${recordName}>`;
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  for await (const chunk of source) {
    buf +=
      typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });

    for (;;) {
      let start = buf.indexOf(open);
      const startNs = buf.indexOf(openNs);
      if (start === -1 || (startNs !== -1 && startNs < start)) {
        start = startNs === -1 ? start : startNs;
      }
      if (start === -1) {
        // nech si jen ocas, ve kterém může být rozpůlená otevírací značka
        if (buf.length > open.length) buf = buf.slice(-open.length);
        break;
      }
      const end = buf.indexOf(close, start);
      if (end === -1) {
        buf = buf.slice(start);
        break;
      }
      yield buf.slice(start, end + close.length);
      buf = buf.slice(end + close.length);
    }
  }
}

// --- extrakce jednoho záznamu ---------------------------------------------

const dig = (obj, path) => path.reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

export function parseAmount(raw) {
  if (raw == null || raw === "") return null;
  const cleaned = String(raw).replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function partyOf(node) {
  if (!node || typeof node !== "object") return null;
  const ico = node[ISRS_DUMP.ico];
  const name = node[ISRS_DUMP.name];
  return {
    ico: typeof ico === "string" && ico.trim() !== "" ? ico.trim() : null,
    name: typeof name === "string" ? name.trim() : null,
  };
}

export function extractRecord(slice) {
  const parsed = parseElement(slice);
  const zaznam = parsed?.[ISRS_DUMP.record];
  if (!zaznam || typeof zaznam !== "object") return null;

  const contract = zaznam[ISRS_DUMP.contract];
  if (!contract || typeof contract !== "object") return null;

  const withVat = parseAmount(contract[ISRS_DUMP.amountWithVat]);
  const withoutVat = parseAmount(contract[ISRS_DUMP.amountWithoutVat]);
  const validRaw = zaznam[ISRS_DUMP.validFlag];

  return {
    contractId: String(dig(zaznam, ISRS_DUMP.idPath) ?? "") || null,
    versionId: Number(dig(zaznam, ISRS_DUMP.versionPath) ?? 0) || 0,
    // "1"/"true" i prázdno; chybějící příznak bereme jako platný záznam,
    // jinak by drobná odchylka schématu vynulovala celý výstup
    valid: validRaw == null || validRaw === "" ? true : /^(1|true|ano)$/i.test(String(validRaw)),
    publishedAt: zaznam[ISRS_DUMP.publishedAt] || null,
    link: zaznam[ISRS_DUMP.link] || null,
    concludedAt: contract[ISRS_DUMP.concludedAt] || null,
    subject: contract[ISRS_DUMP.subject] || null,
    // hodnota včetně DPH je primární; bez DPH je záložní a v reportu se
    // to musí poznat, protože sčítat obojí dohromady by byl nesmysl
    amount: withVat ?? withoutVat,
    amountKind: withVat != null ? "sDph" : withoutVat != null ? "bezDph" : "neuvedena",
    publisher: partyOf(contract[ISRS_DUMP.publisher]),
    parties: asArray(contract[ISRS_DUMP.party]).map(partyOf).filter(Boolean),
  };
}

// --- agregace --------------------------------------------------------------

export function newAccumulator(icos) {
  return new Map(
    icos.map((ico) => [
      ico,
      {
        ico,
        name: null,
        nameCounts: new Map(),
        // klíč = contractId, hodnota = nejnovější platná verze záznamu
        contracts: new Map(),
      },
    ]),
  );
}

/* Jedna smlouva má v dumpech N zveřejněných VERZÍ (dodatky, opravy).
   Sčítat je všechny by objem několikanásobně nafouklo, což je přesně ten
   druh tiché chyby, kterou by nikdo nepoznal. Držíme proto jednu verzi na
   contractId: přednost má platná, pak nejvyšší idVerze. */
export function ingestRecord(acc, record) {
  if (!record) return;
  for (const [ico, bucket] of acc) {
    const asParty = record.parties.find((p) => p.ico === ico);
    const asPublisher = record.publisher?.ico === ico;
    if (!asParty && !asPublisher) continue;

    const label = asParty?.name ?? (asPublisher ? record.publisher?.name : null);
    if (label) bucket.nameCounts.set(label, (bucket.nameCounts.get(label) ?? 0) + 1);

    const key = record.contractId ?? `${record.link ?? ""}#${record.versionId}`;
    const previous = bucket.contracts.get(key);
    // role je NÁŠ pojem, ne název elementu registru — schválně se
    // nejmenuje stejně jako ISRS_DUMP.party, aby se mapování schématu
    // nerozlezlo mimo jedno místo
    const candidate = { ...record, role: asParty ? "protistrana" : "objednatel" };
    if (
      !previous ||
      (candidate.valid && !previous.valid) ||
      (candidate.valid === previous.valid && candidate.versionId > previous.versionId)
    ) {
      bucket.contracts.set(key, candidate);
    }
  }
}

export function summarize(acc, { months, checkedAt, anomalies }) {
  const results = [];
  for (const bucket of acc.values()) {
    const contracts = [...bucket.contracts.values()];
    const asParty = contracts.filter((c) => c.role === "protistrana");

    const byPublisher = new Map();
    for (const c of asParty) {
      const pIco = c.publisher?.ico ?? "—";
      const pName = c.publisher?.name ?? "(objednatel neuveden)";
      const key = `${pIco}|${pName}`;
      const entry = byPublisher.get(key) ?? { ico: pIco, name: pName, count: 0, amount: 0, withoutAmount: 0 };
      entry.count += 1;
      if (c.amount == null) entry.withoutAmount += 1;
      else entry.amount += c.amount;
      byPublisher.set(key, entry);
    }

    const withAmount = asParty.filter((c) => c.amount != null);
    const bestName = [...bucket.nameCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    results.push({
      ico: bucket.ico,
      name: bestName,
      contractCount: asParty.length,
      contractsAsPublisher: contracts.length - asParty.length,
      totalAmount: withAmount.reduce((s, c) => s + c.amount, 0),
      contractsWithoutAmount: asParty.length - withAmount.length,
      amountKinds: {
        sDph: asParty.filter((c) => c.amountKind === "sDph").length,
        bezDph: asParty.filter((c) => c.amountKind === "bezDph").length,
        neuvedena: asParty.filter((c) => c.amountKind === "neuvedena").length,
      },
      publishers: [...byPublisher.values()].sort((a, b) => b.amount - a.amount || b.count - a.count),
    });
  }
  results.sort((a, b) => a.ico.localeCompare(b.ico));

  return {
    generator: "scripts/osint/screen-public-money.mjs",
    source: "Registr smluv (ISRS) — měsíční otevřená data data.smlouvy.gov.cz",
    checkedAt,
    coverage: {
      from: `${months[0].year}-${String(months[0].month).padStart(2, "0")}`,
      to: `${months.at(-1).year}-${String(months.at(-1).month).padStart(2, "0")}`,
      months: months.length,
    },
    anomalies,
    results,
  };
}

// --- stažení a zpracování jednoho měsíce -----------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function cachePathFor(year, month, dir = CACHE_DIR) {
  return join(dir, `dump_${year}_${String(month).padStart(2, "0")}.xml`);
}

/* fetchImpl a dir jsou injektovatelné, aby se chybové cesty (timeout, 404,
   5xx, reset spojení) daly testovat bez sítě — bez toho by právě ty větve,
   na kterých nejvíc záleží, zůstaly neotestované. */
export async function downloadDump(
  year,
  month,
  { cache = true, fetchImpl = fetch, dir = CACHE_DIR } = {},
) {
  const target = assertWritablePath(cachePathFor(year, month, dir));
  if (cache && existsSync(target) && statSync(target).size > 0) {
    return { path: target, fromCache: true };
  }

  const url = DUMP_URL(year, month);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetchImpl(url, { headers: { accept: "application/xml" }, signal: controller.signal });
  } catch (error) {
    clearTimeout(timer);
    const reason = error?.name === "AbortError" ? `timeout po ${REQUEST_TIMEOUT_MS} ms` : error?.message;
    throw new Error(
      `screen-public-money: nepodařilo se stáhnout ${url}\n` +
        `  důvod: ${reason}\n` +
        `  registr je z některých sítí nedostupný (TLS reset). Ověř dostupnost\n` +
        `  a spusť znovu — skript zásadně nedopočítává chybějící měsíc odhadem.`,
    );
  }
  clearTimeout(timer);

  if (res.status === 404) {
    throw new Error(
      `screen-public-money: dump pro ${year}-${String(month).padStart(2, "0")} neexistuje (HTTP 404: ${url}).`,
    );
  }
  if (!res.ok) {
    throw new Error(`screen-public-money: ${url} vrátil HTTP ${res.status}.`);
  }

  mkdirSync(dirname(target), { recursive: true });
  const partial = assertWritablePath(`${target}.part`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(partial));
  renameSync(partial, target);
  return { path: target, fromCache: false };
}

/* Dump bez jediného záznamu není „prázdný měsíc" — registr přijímá tisíce
   smluv měsíčně. Je to posun schématu nebo chybná odpověď, a musí to
   spadnout hlasitě: nulový výstup, který vypadá jako „subjekt nemá žádné
   veřejné smlouvy", je nejnebezpečnější možná chyba tohohle nástroje. */
export function assertDumpParsed({ year, month, seen }) {
  if (seen === 0) {
    throw new Error(
      `screen-public-money: v dumpu ${year}-${String(month).padStart(2, "0")} nebyl ` +
        `nalezen ani jeden element <${ISRS_DUMP.record}>.\n` +
        `  To neznamená „žádné smlouvy" — znamená to, že se rozešlo mapování schématu\n` +
        `  (konstanta ISRS_DUMP v tomhle souboru) se skutečným tvarem otevřených dat.\n` +
        `  Raději spadnu, než abych ohlásil nulový objem.`,
    );
  }
}

export async function processMonth(acc, { year, month }, { cache, fetchImpl, dir } = {}) {
  const { path, fromCache } = await downloadDump(year, month, { cache, fetchImpl, dir });
  let seen = 0;
  let anomalies = 0;
  for await (const slice of zaznamSlices(createReadStream(path))) {
    seen += 1;
    const record = extractRecord(slice);
    if (!record) {
      anomalies += 1;
      continue;
    }
    ingestRecord(acc, record);
  }
  assertDumpParsed({ year, month, seen });
  return { seen, anomalies, fromCache };
}

// --- report ----------------------------------------------------------------

const czk = (n) =>
  `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(Math.round(n))} Kč`;

/* Česká shoda: 1 smlouva nemá, 2–4 smlouvy nemají, 5+ smluv nemá. */
export function smlouvaPlural(n) {
  if (n === 1) return "1 smlouva nemá";
  if (n >= 2 && n <= 4) return `${n} smlouvy nemají`;
  return `${n} smluv nemá`;
}

export function renderMarkdown(summary) {
  const { coverage } = summary;
  const lines = [
    "# Screening toku veřejných prostředků",
    "",
    "**Evidenční přehled, ne obvinění.** Tenhle report eviduje, jaké smlouvy",
    "jsou k danému IČO zveřejněné v registru smluv (ISRS) — kdo je uzavřel,",
    "v jakém objemu a s jakým objednatelem. Nic víc.",
    "",
    "**Uzavřená veřejná smlouva sama o sobě nedokládá žádné pochybení.**",
    "Zveřejnění je zákonná povinnost podle zákona č. 340/2015 Sb. a naprostá",
    "většina zveřejněných smluv je zcela běžný chod veřejné správy. Vysoký",
    "objem není tvrzení o korupci ani o předražení — je to objem. Cokoli nad",
    "rámec téhle evidence vyžaduje další zdroje a člověka, který je posoudí.",
    "",
    "**Tenhle report není autorizační rozhodnutí.** Nezakládá dossier,",
    "nepovyšuje nikoho na předmět šetření a neroutuje se na web. Rozšíření",
    "šetření na kterýkoli subjekt níže vyžaduje samostatné, datované",
    "rozhodnutí zapsané v `AGENTS.md` (viz `docs/entity-discovery.md`).",
    "",
    "**Neúplnost je vlastnost, ne chyba.** Registr obsahuje smlouvy nad",
    "50 000 Kč od 1. 7. 2016, se zákonnými výjimkami.",
    coverage.months > 0
      ? `Report navíc pokrývá jen období **${coverage.from} až ${coverage.to}** (${coverage.months} měsíců).`
      : "Tenhle běh nepokryl žádné období — nebyl zadán ani jeden vstup.",
    "Chybějící záznam znamená „v pokrytém období nic zveřejněného“, nikdy",
    "„subjekt nedostal veřejné peníze“.",
    "",
    `Datum kontroly: **${summary.checkedAt}**. Zdroj: ${summary.source}.`,
    `Regenerace: \`npm run screening:public-money -- --ico=…\`.`,
    "",
  ];

  if (summary.anomalies?.unparsedRecords) {
    lines.push(
      `> ⚠️ ${summary.anomalies.unparsedRecords} záznamů se nepodařilo rozparsovat ` +
        `(z ${summary.anomalies.recordsSeen} přečtených). Výsledky jsou o tolik neúplné.`,
      "",
    );
  }

  if (summary.results.length === 0) {
    lines.push("## Žádné vstupy", "", "Screening neběžel nad žádným IČO.", "");
    return lines.join("\n");
  }

  for (const r of summary.results) {
    lines.push(`## ${r.name ?? "(název subjektu není v pokrytých záznamech)"} — IČO ${r.ico}`, "");
    if (r.contractCount === 0) {
      lines.push(
        "- Počet smluv: **0** — v pokrytém období není v registru zveřejněná",
        "  smlouva, ve které by subjekt vystupoval jako smluvní strana.",
        "  To není zjištění o subjektu, jen o obsahu registru za tohle období.",
        "",
      );
      continue;
    }
    lines.push(
      `- Počet smluv: **${r.contractCount}** (unikátní smlouvy, verze/dodatky sloučené)`,
      `- Celkový objem: **${czk(r.totalAmount)}**` +
        (r.contractsWithoutAmount > 0
          ? ` — ale ${smlouvaPlural(r.contractsWithoutAmount)} vyplněnou hodnotu, takže objem je spodní odhad`
          : ""),
      `- Hodnoty: ${r.amountKinds.sDph}× s DPH, ${r.amountKinds.bezDph}× jen bez DPH, ${r.amountKinds.neuvedena}× neuvedena`,
    );
    if (r.contractsAsPublisher > 0) {
      lines.push(
        `- Navíc ${r.contractsAsPublisher} smluv, kde subjekt sám vystupuje jako zveřejňovatel (objednatel) — do objemu výše se nepočítají`,
      );
    }
    lines.push("", "### Objednatelé", "", "| Objednatel | IČO | Smluv | Objem |", "|---|---|---:|---:|");
    for (const p of r.publishers.slice(0, 20)) {
      lines.push(
        `| ${p.name} | ${p.ico} | ${p.count} | ${czk(p.amount)}${p.withoutAmount > 0 ? ` (+${p.withoutAmount} bez hodnoty)` : ""} |`,
      );
    }
    if (r.publishers.length > 20) {
      lines.push(`| … a dalších ${r.publishers.length - 20} objednatelů | | | |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function writeOutputs(summary, { jsonOut = JSON_OUT, mdOut = MD_OUT } = {}) {
  const jsonPath = assertWritablePath(jsonOut);
  const mdPath = assertWritablePath(mdOut);
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, renderMarkdown(summary), "utf8");
  return { jsonPath, mdPath };
}

// --- main ------------------------------------------------------------------

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = parseArgs(process.argv.slice(2));

  if (!args.ico && !args["from-external-ids"]) {
    console.error(
      "screen-public-money: usage:\n" +
        "  --ico=<IČO>[,<IČO>...]      ad-hoc screening zadaných IČO\n" +
        "  --from-external-ids         IČO z kanonických entit (externalIds.ico)\n" +
        "  [--from=RRRR-MM] [--to=RRRR-MM]   období (výchozí: posledních 12 dokončených měsíců)\n" +
        "  [--json] [--no-cache]",
    );
    process.exit(1);
  }

  let icos = [];
  let inputNote = "";
  try {
    if (args.ico) {
      icos = parseIcoList(args.ico);
      inputNote = `${icos.length} IČO ze zadání`;
    } else {
      const found = icosFromEntities();
      icos = [...new Set(found.map((f) => f.ico))];
      inputNote = `${icos.length} IČO z kanonických entit (externalIds)`;
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const checkedAt = new Date().toISOString().slice(0, 10);

  if (icos.length === 0) {
    // Korektní nulový vstup: žádná síť, žádný dump, ale výstup vznikne,
    // aby bylo vidět, že kontrola proběhla a nic nenašla ve VSTUPECH.
    const summary = {
      generator: "scripts/osint/screen-public-money.mjs",
      source: "Registr smluv (ISRS) — měsíční otevřená data data.smlouvy.gov.cz",
      checkedAt,
      coverage: { from: null, to: null, months: 0 },
      anomalies: { recordsSeen: 0, unparsedRecords: 0 },
      results: [],
    };
    const { jsonPath, mdPath } = writeOutputs(summary);
    console.log(
      `screen-public-money: ${inputNote} → 0 vstupů, síť se nedotazovala.\n` +
        `  Žádná kanonická entita dnes nemá vyplněné externalIds.ico\n` +
        `  (naplní je scripts/osint/expand-entity.mjs --write).\n` +
        `  Zapsáno: ${jsonPath}, ${mdPath}`,
    );
    process.exit(0);
  }

  const window = defaultWindow();
  const from = clampToRegisterStart(args.from ? parseMonth(args.from, "--from") : window.from);
  const to = args.to ? parseMonth(args.to, "--to") : window.to;

  let months;
  try {
    months = monthsInRange(from, to);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const acc = newAccumulator(icos);
  const anomalies = { recordsSeen: 0, unparsedRecords: 0 };

  console.error(
    `screen-public-money: ${inputNote}; období ${from.year}-${String(from.month).padStart(2, "0")}` +
      `..${to.year}-${String(to.month).padStart(2, "0")} (${months.length} měsíčních dumpů).`,
  );

  for (const [index, m] of months.entries()) {
    try {
      const stats = await processMonth(acc, m, { cache: !args["no-cache"] });
      anomalies.recordsSeen += stats.seen;
      anomalies.unparsedRecords += stats.anomalies;
      console.error(
        `  ${m.year}-${String(m.month).padStart(2, "0")}: ${stats.seen} záznamů` +
          `${stats.anomalies ? `, ${stats.anomalies} nerozparsovaných` : ""}` +
          `${stats.fromCache ? " (z cache)" : ""}`,
      );
      if (!stats.fromCache && index < months.length - 1) await sleep(RATE_LIMIT_MS);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

  const summary = summarize(acc, { months, checkedAt, anomalies });
  const { jsonPath, mdPath } = writeOutputs(summary);

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    for (const r of summary.results) {
      console.log(
        `${r.ico}  ${r.name ?? "(název neznámý)"}: ${r.contractCount} smluv, ${czk(r.totalAmount)}` +
          `${r.contractsWithoutAmount ? ` (+${r.contractsWithoutAmount} bez hodnoty)` : ""}`,
      );
    }
    console.log(`\nZapsáno: ${jsonPath}\n         ${mdPath}`);
    console.log(
      "Evidenční přehled — uzavřená veřejná smlouva sama o sobě nedokládá\n" +
        "pochybení a tenhle výstup není autorizační rozhodnutí.",
    );
  }
}
