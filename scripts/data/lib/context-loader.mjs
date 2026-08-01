// Lokální JSON-LD document loader (T-028 fáze B). Build nesmí během
// validace ani expanze stahovat @context ze sítě — veřejná URL
// https://vomaste.cz/context/v1.jsonld se mapuje na verzovaný lokální
// soubor v data/dossiers/_shared/context/, každá jiná vzdálená URL je
// tvrdá chyba. Záměrně BEZ závislosti na jsonld knihovně (tu přidá fáze
// C/G) — návratový tvar { contextUrl, document, documentUrl } je ale už
// teď kompatibilní s documentLoader kontraktem jsonld.js, takže fáze C
// tenhle modul jen předá, nebude ho přepisovat.
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CONTEXT_DIR = join(ROOT, "data/dossiers/_shared/context");

// Veřejná URL → lokální soubor. Verze v URL je součást kontraktu:
// /context/v1.jsonld je neměnný artefakt; změna významu termu = nová
// verze /context/v2.jsonld + nový soubor vomaste-v2.jsonld vedle
// stávajícího, nikdy přepis v1 (viz schemas/canonical/README.md).
export const CONTEXT_URL_PATTERN = /^https:\/\/vomaste\.cz\/context\/v(\d+)\.jsonld$/;

export function contextFileFor(url) {
  const m = CONTEXT_URL_PATTERN.exec(url);
  if (!m) return null;
  return join(CONTEXT_DIR, `vomaste-v${m[1]}.jsonld`);
}

// Mapa všech aktuálně existujících verzí — export pro konzumenty, kteří
// chtějí verze vyjmenovat (testy, budoucí build kontextových rout).
export function knownContexts() {
  const out = new Map();
  for (let v = 1; ; v++) {
    const file = join(CONTEXT_DIR, `vomaste-v${v}.jsonld`);
    if (!existsSync(file)) break;
    out.set(`https://vomaste.cz/context/v${v}.jsonld`, file);
  }
  return out;
}

const cache = new Map();

export function documentLoader(url) {
  const file = contextFileFor(url);
  if (file && existsSync(file)) {
    if (!cache.has(file)) cache.set(file, JSON.parse(readFileSync(file, "utf8")));
    return { contextUrl: null, document: cache.get(file), documentUrl: url };
  }
  if (file) {
    throw new Error(
      `context-loader: "${url}" odkazuje na neexistující lokální verzi kontextu (${file}). ` +
        `Nová verze kontextu se přidává jako nový soubor v data/dossiers/_shared/context/, nikdy stažením ze sítě.`,
    );
  }
  throw new Error(
    `context-loader: network fetch disabled during build — odmítám stáhnout "${url}". ` +
      `Každý @context, který build používá, musí být lokální soubor v data/dossiers/_shared/context/.`,
  );
}
