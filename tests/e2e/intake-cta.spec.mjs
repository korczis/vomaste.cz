import { test, expect } from "./fixtures.mjs";

// Veřejný podnět CTA (PHASE_006.md §42 Phase 7 contract). Landing page a
// adresář dossierů sdílejí jednu šablonu (macros/ui.html intake_cta) —
// testy proto ověřují oba výskyty stejným párem asercí, aby drift mezi
// nimi (jiná URL, jiný text varování) shodil build hned, ne až v praxi.
const STRANKY_S_CTA = ["/", "/dossiers/"];
const OCEKAVANE_URL = "https://github.com/korczis/vomaste.cz/issues/new?template=navrh-dossieru.yml";

test.describe("veřejný podnět — CTA", () => {
  for (const url of STRANKY_S_CTA) {
    test(`${url}: odkaz na formulář míří přesně na canonical GitHub Issue Form URL`, async ({ page }) => {
      await page.goto(url);
      const odkaz = page.locator(`a[href="${OCEKAVANE_URL}"]`);
      await expect(odkaz).toBeVisible();
      await expect(odkaz).toHaveAttribute("rel", "external");
    });

    test(`${url}: vedle odkazu je viditelné varování o veřejnosti issue`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("body")).toContainText(/veřejnou GitHub issue/);
      await expect(page.locator("body")).toContainText(/Neposílejte tam neveřejné dokumenty/);
    });

    test(`${url}: CTA nikde neslibuje anonymitu ani bezpečný/důvěrný kanál`, async ({ page }) => {
      await page.goto(url);
      const text = await page.locator("body").innerText();
      for (const zakazane of [/anonymní podání/i, /bezpečný whistleblower/i, /chráněné oznámení/i, /důvěrné podání/i, /secure intake/i]) {
        expect(text, `stránka obsahuje zakázanou formulaci: ${zakazane}`).not.toMatch(zakazane);
      }
    });

    test(`${url}: odkaz na vysvětlující stránku "jak podání funguje" existuje a vede na živou stránku`, async ({ page }) => {
      await page.goto(url);
      const vysvetleni = page.locator('a[href*="/dokumentace/verejny-podnet/"]').first();
      await expect(vysvetleni).toBeVisible();
      const href = await vysvetleni.getAttribute("href");
      const res = await page.goto(href);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator("h1")).toHaveText(/Veřejný podnět/);
    });
  }

  test("landing a adresář dossierů používají identickou variantu textu varování (jeden zdroj přes macros/ui.html)", async ({ page }) => {
    const texty = [];
    for (const url of STRANKY_S_CTA) {
      await page.goto(url);
      const blok = page.locator("p", { hasText: "Otevře veřejnou GitHub issue" }).first();
      texty.push((await blok.innerText()).trim());
    }
    expect(texty[0]).toBe(texty[1]);
  });

  test("odkaz na formulář má dostatečně velký dotykový cíl (min-h-11) na mobilu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "dotykový cíl se měří jen na mobilním viewportu");
    await page.goto("/");
    const odkaz = page.locator(`a[href="${OCEKAVANE_URL}"]`).first();
    const box = await odkaz.boundingBox();
    expect(box?.height, "odkaz je nižší než 44px minimální dotykový cíl").toBeGreaterThanOrEqual(44);
  });
});
