import { test, expect } from "./fixtures.mjs";

// Rozbité hledání se dřív tvářilo jako prázdný výsledek: fetch selhal,
// index se nastavil na [] a uživatel četl „Nic nenalezeno" — tedy že
// záznam neexistuje. To je horší než viditelná chyba, protože vede
// k nesprávnému závěru o obsahu, ne k opakování pokusu.
//
// Pozn. 1: URL rejstříku nese cachebust (?h=…), takže glob MUSÍ končit
// hvězdičkou. Bez ní se route nechytí a test měří něco jiného.
//
// Pozn. 2: asserce jsou na VIDITELNOST, ne na text stránky. `toContainText`
// čte textContent včetně skrytých prvků, takže by prošlo i hlášení, které
// uživatel nikdy neuvidí — test by hlídal existenci řetězce v DOM místo
// toho, co je na obrazovce.
test.describe("selhání rejstříku hledání", () => {
  const CHYBA = "text=/nepodařilo načíst/i";
  const PRAZDNO = "text=/Nic nenalezeno/i";

  test("nenačtený rejstřík se hlásí jako porucha, ne jako prázdný výsledek", async ({ page }) => {
    await page.route("**/search-index.json*", (r) => r.abort());
    await page.goto("/");
    await page.locator("#global-search-input").fill("babis");

    await expect(page.locator(CHYBA).first()).toBeVisible();
    await expect(page.locator(PRAZDNO).first(), "porucha se maskuje jako prázdný výsledek").toBeHidden();
  });

  test("404 na rejstříku se pozná stejně jako výpadek sítě", async ({ page }) => {
    // Statický hosting vrací na chybějící soubor HTML stránku, ne chybu
    // sítě — bez kontroly res.ok by se parsovalo HTML jako JSON.
    await page.route("**/search-index.json*", (r) =>
      r.fulfill({ status: 404, contentType: "text/html", body: "<html>404</html>" }));
    await page.goto("/");
    await page.locator("#global-search-input").fill("babis");
    await expect(page.locator(CHYBA).first()).toBeVisible();
  });

  test("po selhání se načtení zopakuje, hledání se neuzamkne na celou session", async ({ page }) => {
    // Dřív se `loaded = true` nastavovalo PŘED fetchem, takže jediný
    // výpadek vyřadil hledání do konce návštěvy.
    let selhat = true;
    await page.route("**/search-index.json*", (route) => {
      if (selhat) { selhat = false; return route.abort(); }
      return route.continue();
    });
    await page.goto("/");
    const input = page.locator("#global-search-input");
    await input.fill("babis");
    await expect(page.locator(CHYBA).first()).toBeVisible();

    await input.fill("");
    await input.fill("babis");
    await expect(page.locator("[id^='global-search-option-']").first()).toBeVisible();
    await expect(page.locator(CHYBA).first(), "hlášení poruchy zůstalo po úspěšném načtení").toBeHidden();
  });

  test("funkční rejstřík hledá dál beze změny", async ({ page }) => {
    await page.goto("/");
    await page.locator("#global-search-input").fill("babis");
    await expect(page.locator("[id^='global-search-option-']").first()).toBeVisible();
    await expect(page.locator(CHYBA).first()).toBeHidden();
  });
});
