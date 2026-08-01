// JSON-LD validace kanonického datasetu (T-028 fáze C). Každý záznam se
// expanduje knihovnou jsonld (jediná nová dependency fáze C — mission §8
// vyžaduje standardní expanzi/kompaktaci, ne vlastní implementaci)
// výhradně přes lokální documentLoader z lib/context-loader.mjs — žádný
// network fetch, cizí URL je tvrdá chyba už v loaderu.
//
// Kontrolované invarianty (vlastník: tento modul):
//   J1  expanze záznamu nepadá
//   J2  expanze dává právě jeden root uzel a jeho @id se rovná @id
//       záznamu (expanze nesmí identitu přepsat ani rozbít)
//   J3  žádný uzel nenese termy mimo kontext — expanze nesmí tiše
//       zahodit klíče. Mechanismus: (a) safe mode knihovny jsonld
//       (chyba při jakékoli tiché ztrátě dat, i vnořené), (b) explicitní
//       porovnání top-level klíčů záznamu proti termům kontextu, které
//       neznámý klíč pojmenuje v hlášce. Jediná povolená výjimka je
//       "$schema" — ukazatel na JSON Schema, deliberately ne-sémantický
//       klíč, který se před expanzí odloží.
import jsonld from "jsonld";
import { documentLoader } from "./lib/context-loader.mjs";

// Klíče, které záznam smí nést, přestože nejsou termy kontextu.
export const NON_SEMANTIC_KEYS = Object.freeze(["$schema"]);

const loader = async (url) => documentLoader(url);

function contextTerms(contextUrl) {
  const { document } = documentLoader(contextUrl);
  return new Set(Object.keys(document["@context"]));
}

export async function validateRecordJsonLd(record, relPath) {
  const errors = [];
  const contextUrl = record?.["@context"];
  if (typeof contextUrl !== "string") {
    return [`${relPath}: záznam nemá @context — bez něj nelze expandovat`];
  }

  let terms;
  try {
    terms = contextTerms(contextUrl);
  } catch (e) {
    return [`${relPath}: kontext "${contextUrl}" nejde načíst — ${e.message}`];
  }

  // J3b: explicitní pojmenování neznámých top-level klíčů (safe mode níže
  // chytí i vnořené, ale hlásí jen generickou hlášku bez jména klíče).
  for (const key of Object.keys(record)) {
    if (key.startsWith("@") || terms.has(key) || NON_SEMANTIC_KEYS.includes(key)) continue;
    errors.push(`${relPath}: klíč "${key}" není term kontextu ${contextUrl} — expanze by ho tiše zahodila; neznámý klíč je chyba`);
  }

  const doc = Object.fromEntries(Object.entries(record).filter(([k]) => !NON_SEMANTIC_KEYS.includes(k)));
  let expanded;
  try {
    expanded = await jsonld.expand(doc, { documentLoader: loader, safe: true });
  } catch (e) {
    errors.push(`${relPath}: JSON-LD expanze selhala (safe mode) — ${e.message}`);
    return errors;
  }

  if (expanded.length !== 1) {
    errors.push(`${relPath}: expanze dala ${expanded.length} root uzlů místo 1`);
    return errors;
  }
  if (expanded[0]["@id"] !== record["@id"]) {
    errors.push(`${relPath}: @id po expanzi ("${expanded[0]["@id"]}") neodpovídá @id záznamu ("${record["@id"]}")`);
  }
  return errors;
}

// Zvaliduje všechny záznamy modelu (balíčkové záznamy + sdílené entity;
// slovníky nejsou JSON-LD dokumenty). Vrací pole chybových hlášek.
export async function validateJsonLd(model) {
  const errors = [];
  for (const wrapper of [...model.records, ...model.entities]) {
    errors.push(...(await validateRecordJsonLd(wrapper.record, wrapper.relPath)));
  }
  return errors;
}
