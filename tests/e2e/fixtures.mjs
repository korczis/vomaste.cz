// Společná fixture pro prohlížečové testy (coop T-021).
//
// PROČ EXISTUJE — past, která by jinak zůstala neviditelná:
//
// `zola build` vypisuje absolutní URL podle `base_url` z config.toml, tedy
// https://vomaste.cz. Je to správně: kanonické odkazy, OG metadata a
// JSON-LD @id musí ukazovat na skutečnou adresu webu, ne na localhost.
// Důsledek pro testy je ale zákeřný — stránka podaná z lokálního serveru
// si skripty a styly stáhne z PRODUKCE.
//
// Test by pak neověřoval build, který právě vznikl, ale to, co je zrovna
// nasazené. Prošel by nad starým kódem a spadl nad novým, aniž by se něco
// pokazilo lokálně. Přesně to se stalo při zavádění téhle sady: tři testy
// hlásily úspěch, protože běžely proti nasazenému JavaScriptu, zatímco
// lokální bundle měl jinou implementaci.
//
// Řešení: požadavky na produkční origin se přesměrují na lokální server.
// Alternativou by byl druhý `zola build --base-url http://127.0.0.1:…`,
// ale ten trvá pět minut a testoval by výstup, který se nikam nenasazuje.
// Takhle se testuje přesně ten HTML, který půjde na GitHub Pages.

import { test as base, expect } from "@playwright/test";

const PROD_ORIGIN = "https://vomaste.cz";

export const test = base.extend({
  page: async ({ page, baseURL, request }, use) => {
    await page.route(`${PROD_ORIGIN}/**`, async (route) => {
      const url = new URL(route.request().url());
      // Nejde použít route.continue({url}) — Playwright zakazuje změnu
      // protokolu (https -> http) a selže. Obsah se proto stáhne z
      // lokálního serveru a odpověď se vyplní ručně. Query string nese
      // cache-busting hash, lokální soubor ho nemá, takže se zahazuje.
      const res = await request.get(`${baseURL}${url.pathname}`);
      await route.fulfill({
        status: res.status(),
        headers: res.headers(),
        body: await res.body(),
      });
    });
    await use(page);
    // Bez tohohle se kontext požadavků ruší dřív, než doběhnou zachycené
    // requesty, a test spadne na „Request context disposed" — což vypadá
    // jako vada produktu, ale je to závod v úklidu fixture.
    await page.unrouteAll({ behavior: "ignoreErrors" });
  },
});

// Kontrola, že přesměrování opravdu platí. Kdyby fixture přestala fungovat,
// testy by se tiše vrátily k ověřování produkce — a to je horší než pád,
// protože vypadá jako úspěch.
export async function assertLocalAssets(page) {
  const external = await page.evaluate((origin) =>
    Array.from(document.querySelectorAll("script[src], link[rel=stylesheet]"))
      .map((el) => el.src || el.href)
      .filter((u) => u.startsWith(origin)).length, PROD_ORIGIN);
  // Absolutní URL v atributech je v pořádku (tak se web staví); podstatné
  // je, že se ze sítě obslouží lokálně — to hlídá route() výše.
  return external;
}

export { expect };
