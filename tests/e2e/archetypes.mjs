// Seznam typů stránek pro plošné kontroly (coop T-022).
//
// Typy se ODVOZUJÍ z dat, ne vypisují ručně. Ručně psaný seznam by při
// prvním novém typu stránky tiše zastaral a plošná kontrola by se dál
// tvářila jako úplná, přestože by nový typ přeskočila. Přesně tenhle druh
// tichého zúžení už dnes v repozitáři jednou byl (filtr nabízel stav,
// který v datech neexistuje).
//
// Zdroj pravdy:
//   - data/generated/routes.json — jeden zástupce na každý typ ZÁZNAMU
//     (claim, source, case, gap, relation, entity)
//   - data/generated/navigation.json — sekce a rozcestníky
//   - ROOT_PAGES — kořenové stránky, které v navigaci nejsou (404 apod.)

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

// Stránky, které nemají záznam v navigaci ani v routes.json, ale existují.
const ROOT_PAGES = [
  { archetype: "domů", url: "/" },
  { archetype: "404", url: "/404.html" },
];

// Tvar cesty: konkrétní slugy se nahradí zástupným symbolem, aby se
// 22 dossierů nepovažovalo za 22 různých typů stránky. Segment se bere
// jako slug, když není v seznamu strukturálních částí cesty — ten je
// krátký a explicitní, protože opačné pravidlo („co vypadá jako slug")
// by u jednoslovných sekcí selhalo.
const STRUCTURAL = new Set([
  "dossiers", "entities", "koncepty", "dokumentace", "map", "data",
  "claims", "sources", "cases", "gaps", "relations", "entity", "typ",
]);

function urlShape(url) {
  return url
    .split("/")
    .map((seg) => (seg === "" || STRUCTURAL.has(seg) ? seg : "<slug>"))
    .join("/");
}

export function pageArchetypes() {
  const routes = readJson("data/generated/routes.json");
  const nav = readJson("data/generated/navigation.json");

  // Jeden zástupce na typ záznamu. Bere se první v abecedním pořadí klíčů,
  // aby byl výběr deterministický — jinak by test padal a procházel podle
  // pořadí souborů na disku.
  const byType = new Map();
  for (const key of Object.keys(routes).sort()) {
    const r = routes[key];
    if (!r || !r.type || !r.route) continue;
    if (!byType.has(r.type)) byType.set(r.type, r.route);
  }

  const out = [...ROOT_PAGES];
  for (const [type, url] of byType) {
    out.push({ archetype: `detail: ${type}`, url });
  }

  // Rozcestníky z primární navigace, VČETNĚ vnořených úrovní.
  //
  // Bez navigace by kontrola minula mapu, SQL konzoli, koncepty i
  // dokumentaci — stránky bez záznamu v routes.json, protože nenesou
  // dossierové záznamy, a zrovna ty mají nejvíc vlastního kódu.
  //
  // Vnořené položky se procházejí taky, ale deduplikují se podle TVARU
  // cesty: 22 dossierů pod „Dossiery" sdílí jednu šablonu, takže jako typ
  // stránky stačí jeden zástupce. První verze tohohle souboru brala jen
  // kořenovou úroveň — a hned minula /entities/typ/<typ>/, které přibyly
  // jako podstrom pod „Entity". Kontrola se přitom dál tvářila jako úplná.
  // Přesně to tichý zúžení, proti kterému má test o délce seznamu chránit.
  const seen = new Set(out.map((p) => p.url));
  const shapes = new Set(out.map((p) => urlShape(p.url)));

  const walk = (items) => {
    for (const item of items ?? []) {
      const url = item.matchPrefix ?? item.url;
      if (url && typeof url === "string" && url.startsWith("/") && !url.includes("#")) {
        const shape = urlShape(url);
        if (!seen.has(url) && !shapes.has(shape)) {
          seen.add(url);
          shapes.add(shape);
          out.push({ archetype: `rozcestník: ${item.label ?? url}`, url });
        }
      }
      walk(item.children ?? item.items);
    }
  };
  walk(nav.items);

  return out;
}
