import { test, expect } from "./fixtures.mjs";

test("selektorové fasety u zdrojů se naplní z dat a skutečně filtrují", async ({ page }) => {
  // Regrese, kterou odhalilo review: data-select-facets seděl na obalu
  // vnitřní tabulky, ale komponenta ho čte z kořenové sekce. Selektory se
  // proto vykreslily PRÁZDNÉ a nic nefiltrovaly — ovládací prvek, který
  // nic nenabízí, tvrdí uživateli nepravdu.
  await page.goto("/dossiers/andrej-babis/sources/?view=list");
  await page.waitForTimeout(400);

  const stav = await page.evaluate(() => {
    const root = document.querySelector("[data-dossier-directory]");
    const d = window.Alpine.$data(root);
    return {
      fasety: d.selectFacets,
      typu: (d.facetOptions.type || []).length,
      prvni: (d.facetOptions.type || [])[0] || "",
      pred: root.querySelectorAll("[data-view]:not([hidden]) [data-record-key]:not([hidden])").length,
    };
  });

  expect(stav.fasety, "sekce nenese data-select-facets").toContain("type");
  expect(stav.typu, "selektor typu je prázdný").toBeGreaterThan(1);
  expect(stav.pred).toBeGreaterThan(1);

  const po = await page.evaluate((v) => {
    const d = window.Alpine.$data(document.querySelector("[data-dossier-directory]"));
    d.facetValues.type = v;
    d.apply();
    return document.querySelectorAll("[data-view]:not([hidden]) [data-record-key]:not([hidden])").length;
  }, stav.prvni);

  expect(po, `filtr "${stav.prvni}" nic neomezil`).toBeLessThan(stav.pred);
  expect(po).toBeGreaterThan(0);
});
