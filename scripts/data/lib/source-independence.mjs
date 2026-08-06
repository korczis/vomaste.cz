/*
 * Nezávislost zdrojů — JEDINÝ vlastník primitiva „jsou tyhle dva zdroje
 * nezávislé doložení?".
 *
 * Pravidlo samo žije v redakční doktríně (AGENTS.md, docs/data-contract.md)
 * a vynucují ho pravidla S1/S2/S4/S10 ve validate-semantics.mjs. Tenhle
 * modul drží jeho VÝPOČET, aby ho nemusel opisovat nikdo další: kromě
 * validátoru ho čte i evidenční report (report-evidence-plan.mjs), který
 * počítá, kolik tvrzení má potenciál na korroboraci. Kdyby si report
 * definici nezávislosti implementoval sám, report a brána by se rozešly
 * a plán práce by ukazoval na jinou realitu než ta, kterou build vynucuje.
 *
 * Definice (beze změny oproti stavu před extrakcí):
 *
 *   rodina zdroje  = neprázdné `sourceFamily` → jinak neprázdný `outlet`
 *                    → jinak zdroj sám za sebe (jeho @id)
 *   nezávislá dvojice = dva zdroje, které se liší RODINOU (S1/S2)
 *                    A ZÁROVEŇ vydavatelem — `outlet`em, registrovanou
 *                    doménou `url` i SKUPINOU VYDAVATELŮ z katalogu
 *                    zdrojů (S10)
 *
 * Párově, ne tranzitivně: sloučit zdroje přes „sdílí rodinu NEBO outlet"
 * by řetězilo přes rodinu ctk celý trh (vlastní reportáž Blesku by
 * splynula s ČT24 jen proto, že oba jinde přetiskují ČTK). Otázka
 * „existují dva skutečně nezávislí vydavatelé?" je párová.
 *
 * Skupina vydavatelů (T-083): outlet ani doména neuvidí vydavatele, který
 * drží víc titulů na víc doménách. Katalog zdrojů to ale doloženě ví —
 * Česká justice i Ekonomický deník mají `operator: "Media Network s.r.o."`
 * a v pastech citovanou patičku „Vydavatelem … je Media Network s.r.o.".
 * Dokud se skupina nepočítala, prošly by S10 jako dva nezávislí
 * vydavatelé. Zdroj pravdy je proto `data/source-catalog/*.json`, ne
 * druhý ručně psaný seznam v kódu.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Víceúrovňové veřejné sufixy: u nich je registrovaná doména až TŘETÍ
// label od konce. Bez téhle výjimky by `edu.gov.cz` (MŠMT) a
// `vlada.gov.cz` (Úřad vlády) splynuly na `gov.cz` a S10 by ze dvou
// různých institucí udělala jednoho vydavatele.
export const MULTI_LABEL_PUBLIC_SUFFIXES = new Set(["gov.cz", "com.ua", "co.uk", "europa.eu"]);

/*
 * Registrovaná doména URL — identita vydavatele pro S10. Sjednocuje
 * redakční subdomény téhož vydavatele (`domaci.hn.cz` i `archiv.hn.cz`
 * → `hn.cz`, `prazsky.denik.cz` → `denik.cz`), ale nespojuje instituce
 * pod sdíleným veřejným sufixem (viz MULTI_LABEL_PUBLIC_SUFFIXES).
 * Vrací null pro neparsovatelnou URL (tvar vlastní schéma).
 */
export function registeredDomain(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  host = host.toLowerCase().replace(/^www\./, "");
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  return MULTI_LABEL_PUBLIC_SUFFIXES.has(lastTwo) ? parts.slice(-3).join(".") : lastTwo;
}

/*
 * Skupiny vydavatelů z katalogu zdrojů: outlet → identifikátor skupiny.
 *
 * Záznam katalogu vyjmenovává v `outlets` tituly, které pokrývá; volitelné
 * `publisherGroup` říká, do které vydavatelské skupiny patří. Dva záznamy
 * se shodným `publisherGroup` jsou tedy jeden vydavatel na víc doménách.
 * Pole je VOLITELNÉ — chybí-li, zůstává identita vydavatele na outletu
 * a doméně přesně jako dřív.
 *
 * Chybějící adresář i nečitelný/rozbitý záznam se přeskakují: tvar katalogu
 * hlídá jeho vlastní brána (build:source-catalog), tenhle modul počítá
 * nezávislost a nesmí kvůli cizí chybě shodit validaci datasetu.
 */
export const SOURCE_CATALOG_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "data/source-catalog",
);

export function loadPublisherGroups(dir = SOURCE_CATALOG_DIR) {
  const byOutlet = new Map();
  if (!existsSync(dir)) return byOutlet;
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith(".json")) continue;
    let entry;
    try {
      entry = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch {
      continue;
    }
    const group = typeof entry?.publisherGroup === "string" ? entry.publisherGroup.trim() : "";
    if (!group) continue;
    for (const outlet of Array.isArray(entry.outlets) ? entry.outlets : []) {
      if (typeof outlet === "string" && outlet.trim()) byOutlet.set(outlet.trim(), group);
    }
  }
  return byOutlet;
}

// Katalog se čte jednou za proces: validace i evidenční report volají
// createSourceIndependence v cyklu nad tisíci dvojicemi.
let defaultPublisherGroups = null;

/*
 * createSourceIndependence(recordById, options) → sada dotazů nad
 * konkrétním modelem. `recordById(iri)` vrací kanonický záznam daného @id
 * nebo undefined (neexistenci hlásí validate-references, tady se jen
 * ignoruje — ne-source cíle do výpočtu nikdy nevstupují).
 *
 * options.publisherGroups: Map(outlet → skupina). Výchozí je katalog
 * zdrojů, aby brána i report viděly tutéž definici bez zapojování na
 * dvou místech; testy si injektují syntetickou mapu.
 */
export function createSourceIndependence(recordById, options = {}) {
  const publisherGroups =
    options.publisherGroups ?? (defaultPublisherGroups ??= loadPublisherGroups());
  const familyOf = (sourceId) => {
    const source = recordById(sourceId);
    if (!source) return sourceId;
    const family = typeof source.sourceFamily === "string" ? source.sourceFamily.trim() : "";
    if (family) return `family:${family}`;
    const outlet = typeof source.outlet === "string" ? source.outlet.trim() : "";
    if (outlet) return `outlet:${outlet}`;
    return sourceId;
  };
  const outletOf = (source) => (typeof source.outlet === "string" ? source.outlet.trim() : "");
  // Skupina vydavatelů se identifikuje outletem zdroje: `url` vede na
  // konkrétní doménu titulu, kdežto katalog páruje titul podle jména.
  const publisherGroupOf = (source) => publisherGroups.get(outletOf(source)) ?? "";
  const existingSources = (ids) => ids.filter((id) => recordById(id)?.recordType === "source");
  const familiesOf = (ids) => new Set(existingSources(ids).map(familyOf));
  const sourceRecordsOf = (ids) => existingSources(ids).map((id) => recordById(id));

  // Proč dvojice zdrojů NENÍ nezávislá. Vrací null, když nezávislá je.
  // Pořadí testů = pořadí pravidel: rodina (S1/S2) → outlet → doména →
  // skupina vydavatelů. Konkrétnější důvod první: hláška má čtenáři říct
  // to nejbližší, co se dá ověřit na samotném záznamu, a teprve pak
  // vlastnictví doložené katalogem.
  const collisionReason = (a, b) => {
    if (familyOf(a["@id"]) === familyOf(b["@id"])) return null; // řeší S1/S2, ne S10
    const outletA = outletOf(a);
    if (outletA && outletA === outletOf(b)) return `týž outlet "${outletA}"`;
    const domainA = registeredDomain(a.url);
    if (domainA && domainA === registeredDomain(b.url)) return `táž registrovaná doména ${domainA}`;
    const groupA = publisherGroupOf(a);
    if (groupA && groupA === publisherGroupOf(b)) {
      return `táž skupina vydavatelů "${groupA}" (${outletA} + ${outletOf(b)})`;
    }
    return null;
  };

  // [identifierA, identifierB] první nezávislé dvojice, jinak null.
  const independentPair = (ids) => {
    const records = sourceRecordsOf(ids);
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const a = records[i];
        const b = records[j];
        if (familyOf(a["@id"]) === familyOf(b["@id"])) continue;
        if (collisionReason(a, b)) continue;
        return [a.identifier, b.identifier];
      }
    }
    return null;
  };

  // Výčet dvojic, které vypadají jako různé rodiny, ale mají téhož
  // vydavatele — text hlášky S10 (bez něj by nález nešel ověřit).
  const publisherCollisions = (ids) => {
    const records = sourceRecordsOf(ids);
    const out = [];
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const reason = collisionReason(records[i], records[j]);
        if (reason) out.push(`${records[i].identifier}+${records[j].identifier} (${reason})`);
      }
    }
    return out;
  };

  return {
    familyOf,
    outletOf,
    publisherGroupOf,
    existingSources,
    familiesOf,
    sourceRecordsOf,
    collisionReason,
    independentPair,
    publisherCollisions,
  };
}
