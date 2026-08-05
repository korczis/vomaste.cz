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
 *                    A ZÁROVEŇ vydavatelem — `outlet`em i registrovanou
 *                    doménou `url` (S10)
 *
 * Párově, ne tranzitivně: sloučit zdroje přes „sdílí rodinu NEBO outlet"
 * by řetězilo přes rodinu ctk celý trh (vlastní reportáž Blesku by
 * splynula s ČT24 jen proto, že oba jinde přetiskují ČTK). Otázka
 * „existují dva skutečně nezávislí vydavatelé?" je párová.
 */

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
 * createSourceIndependence(recordById) → sada dotazů nad konkrétním
 * modelem. `recordById(iri)` vrací kanonický záznam daného @id nebo
 * undefined (neexistenci hlásí validate-references, tady se jen
 * ignoruje — ne-source cíle do výpočtu nikdy nevstupují).
 */
export function createSourceIndependence(recordById) {
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
  const existingSources = (ids) => ids.filter((id) => recordById(id)?.recordType === "source");
  const familiesOf = (ids) => new Set(existingSources(ids).map(familyOf));
  const sourceRecordsOf = (ids) => existingSources(ids).map((id) => recordById(id));

  // Proč dvojice zdrojů NENÍ nezávislá. Vrací null, když nezávislá je.
  // Pořadí testů = pořadí pravidel: rodina (S1/S2) → outlet → doména.
  const collisionReason = (a, b) => {
    if (familyOf(a["@id"]) === familyOf(b["@id"])) return null; // řeší S1/S2, ne S10
    const outletA = outletOf(a);
    if (outletA && outletA === outletOf(b)) return `týž outlet "${outletA}"`;
    const domainA = registeredDomain(a.url);
    if (domainA && domainA === registeredDomain(b.url)) return `táž registrovaná doména ${domainA}`;
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
    existingSources,
    familiesOf,
    sourceRecordsOf,
    collisionReason,
    independentPair,
    publisherCollisions,
  };
}
