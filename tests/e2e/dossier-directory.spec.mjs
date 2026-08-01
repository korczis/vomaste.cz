// Prohlížečové testy adresáře dossierů (coop T-027).
//
// Node testy hlídají data a tvar komponenty. Tady se ověřuje to, co z nich
// nejde: že přepínání projekcí opravdu funguje, že filtr řídí všechny tři
// pohledy najednou a že sdílený odkaz i tlačítko zpět obnoví stav.

import { test, expect } from "./fixtures.mjs";

const DIR = "/dossiers/";

test.describe("adresář dossierů", () => {
  test("právě jedna projekce je viditelná", async ({ page }) => {
    // Tři současně vykreslené projekce téhož seznamu by znamenaly tři
    // kopie obsahu pro odečítač i pro tabulátor.
    await page.goto(DIR);
    const views = page.locator("#dossier-directory [data-view]");
    await expect(views).toHaveCount(3);
    const visible = page.locator("#dossier-directory [data-view]:not([hidden])");
    await expect(visible).toHaveCount(1);
  });

  test("přepnutí projekce nepřenačte stránku a promítne se do adresy", async ({ page }) => {
    await page.goto(DIR);
    await page.getByRole("button", { name: "Dlaždice" }).click();
    await expect(page.locator('#dossier-directory [data-view="grid"]')).toBeVisible();
    await expect(page.locator('#dossier-directory [data-view="table"]')).toBeHidden();
    expect(page.url()).toContain("view=grid");
  });

  test("sdílený odkaz obnoví projekci", async ({ page }) => {
    await page.goto(`${DIR}?view=list`);
    await expect(page.locator('#dossier-directory [data-view="list"]')).toBeVisible();
    await expect(page.locator('#dossier-directory [data-view="table"]')).toBeHidden();
  });

  test("neplatná hodnota view se bezpečně ignoruje", async ({ page }) => {
    // Zastaralý nebo ručně upravený odkaz nesmí skončit prázdnou stránkou.
    await page.goto(`${DIR}?view=neexistuje`);
    const visible = page.locator("#dossier-directory [data-view]:not([hidden])");
    await expect(visible).toHaveCount(1);
  });

  test("tlačítko zpět obnoví předchozí projekci", async ({ page }) => {
    await page.goto(`${DIR}?view=table`);
    await page.getByRole("button", { name: "Seznam" }).click();
    await expect(page.locator('#dossier-directory [data-view="list"]')).toBeVisible();
    await page.goBack();
    await page.waitForTimeout(200);
    const visible = page.locator("#dossier-directory [data-view]:not([hidden])");
    await expect(visible).toHaveCount(1);
  });

  test("filtr řídí všechny tři projekce najednou", async ({ page }) => {
    // Celý smysl jedné kolekce: přepnutí pohledu nesmí ukázat jiný
    // výsledek, než jaký měl uživatel před chvílí před sebou.
    await page.goto(DIR);
    const total = await page.locator('#dossier-directory [data-view="table"] tbody tr').count();
    await page.locator('#dossier-directory input[type="search"]').fill("vojtech");
    await page.waitForTimeout(250);

    const visibleInTable = await page.locator('#dossier-directory [data-view="table"] tbody tr:not([hidden])').count();
    expect(visibleInTable).toBeGreaterThan(0);
    expect(visibleInTable).toBeLessThan(total);

    // Táž množina i v ostatních projekcích, i když jsou zrovna skryté.
    for (const view of ["list", "grid"]) {
      const n = await page.locator(`#dossier-directory [data-view="${view}"] [data-record-key]:not([hidden])`).count();
      expect(n, `projekce ${view} filtruje jinak než tabulka`).toBe(visibleInTable);
    }
  });

  test("view nepřepíše hledání ani řazení", async ({ page }) => {
    await page.goto(`${DIR}?view=list&q=vojtech`);
    await page.waitForTimeout(250);
    await expect(page.locator('#dossier-directory input[type="search"]')).toHaveValue("vojtech");
    await page.getByRole("button", { name: "Tabulka" }).click();
    await expect(page.locator('#dossier-directory input[type="search"]')).toHaveValue("vojtech");
    expect(page.url()).toContain("q=vojtech");
  });

  test("skrytá projekce není dosažitelná tabulátorem", async ({ page }) => {
    await page.goto(`${DIR}?view=table`);
    const hiddenLinks = page.locator('#dossier-directory [data-view="grid"] a');
    const count = await hiddenLinks.count();
    expect(count).toBeGreaterThan(0);
    // hidden na kontejneru vyřadí celý podstrom z pořadí tabulátoru.
    await expect(page.locator('#dossier-directory [data-view="grid"]')).toBeHidden();
  });

  test("bez JavaScriptu zůstane výchozí projekce plně použitelná", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(DIR);
    const rows = page.locator('#dossier-directory [data-view="table"] tbody tr');
    expect(await rows.count()).toBeGreaterThan(10);
    // Odkazy musí být skutečné href, ne JS navigace.
    const href = await rows.first().locator("a").first().getAttribute("href");
    expect(href).toMatch(/^\/dossiers\/|^https?:\/\//);
    await context.close();
  });

  test("každý dossier nabízí odkazy na své registry", async ({ page }) => {
    await page.goto(`${DIR}?view=list`);
    const first = page.locator('#dossier-directory [data-view="list"] [data-record-key]').first();
    const links = await first.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(links.length).toBeGreaterThan(2);
    expect(links.some((h) => /\/claims\/$/.test(h))).toBe(true);
    expect(links.some((h) => /\/sources\/$/.test(h))).toBe(true);
  });

  test("stránka nepřetéká do strany na mobilu", async ({ page, isMobile }) => {
    test.skip(!isMobile, "smysl má jen v mobilním projektu");
    await page.goto(DIR);
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "dokument se posouvá do strany").toBeLessThanOrEqual(1);
  });

  test("na mobilu je výchozí projekce hustý seznam, ne tabulka", async ({ page, isMobile }) => {
    // Tabulka s osmi sloupci je na 390 px nepoužitelná; seznam je hustý
    // a čitelný. Rozhodnutí padne jednou při startu.
    test.skip(!isMobile, "smysl má jen v mobilním projektu");
    await page.goto(DIR);
    await page.waitForTimeout(250);
    await expect(page.locator('#dossier-directory [data-view="list"]')).toBeVisible();
  });
});

test.describe("úvodní stránka", () => {
  test("adresář nahradil zeď karet a nabízí kompaktní seznam", async ({ page }) => {
    await page.goto("/");
    const records = page.locator("#home-dossiers [data-record-key]");
    expect(await records.count()).toBeGreaterThan(20);
    const visible = page.locator("#home-dossiers [data-view]:not([hidden])");
    await expect(visible).toHaveCount(1);
  });

  test("na mobilu je v jedné obrazovce vidět víc než jeden dossier", async ({ page, isMobile }) => {
    // Přesně ta vada, kvůli které komponenta vznikla: jedna karta zabírala
    // skoro celý viewport, takže adresář dvaadvaceti dossierů znamenal
    // stovky metrů rolování.
    test.skip(!isMobile, "smysl má jen v mobilním projektu");
    await page.goto("/");
    await page.waitForTimeout(250);
    const items = page.locator("#home-dossiers [data-view]:not([hidden]) [data-record-key]");
    // Měří se HUSTOTA, ne vzdálenost od začátku dokumentu: nad adresářem
    // je úvodní blok, takže absolutní pozice by testovala délku hera,
    // nikoli to, kvůli čemu komponenta vznikla.
    const first = await items.nth(0).boundingBox();
    const second = await items.nth(1).boundingBox();
    const spacing = (second?.y ?? 0) - (first?.y ?? 0);
    const viewport = page.viewportSize()?.height ?? 844;
    expect(spacing, "položka adresáře je vyšší než 180 px").toBeLessThan(180);
    expect(viewport / spacing, "na jednu obrazovku se vejdou méně než tři dossiery").toBeGreaterThanOrEqual(3);
  });
});

test.describe("hash navigace", () => {
  test("odkaz na záznam ve skryté projekci přepne pohled a dovede k němu", async ({ page }) => {
    // Kotvy jsou tvaru <sekce>-<projekce>-<slug>, protože tentýž záznam je
    // v DOM třikrát. Bez přepnutí by prohlížeč cíl nenašel — je uvnitř
    // kontejneru s hidden — a sdílený odkaz by nikam nevedl.
    await page.goto("/dossiers/?view=table");
    await page.waitForTimeout(200);
    const key = await page
      .locator('#dossier-directory [data-view="grid"] [data-record-key]')
      .first()
      .getAttribute("data-record-key");

    await page.goto(`/dossiers/?view=table#dossier-directory-grid-${key}`);
    await page.waitForTimeout(400);
    await expect(page.locator('#dossier-directory [data-view="grid"]')).toBeVisible();
    await expect(page.locator(`#dossier-directory-grid-${key}`)).toBeInViewport();
  });

  test("hash na záznam odfiltrovaný hledáním filtr zruší", async ({ page }) => {
    // Sdílený odkaz na konkrétní záznam má přednost před dřív nastaveným
    // filtrem; jinak by odkaz vedl na prázdno.
    await page.goto("/dossiers/?view=list&q=zzzznenajdenic");
    await page.waitForTimeout(300);
    const key = await page
      .locator('#dossier-directory [data-view="list"] [data-record-key]')
      .first()
      .getAttribute("data-record-key");
    await page.evaluate((k) => { window.location.hash = `dossier-directory-list-${k}`; }, key);
    await page.waitForTimeout(400);
    await expect(page.locator(`#dossier-directory-list-${key}`)).toBeVisible();
  });

  test("neznámý hash nic nerozbije", async ({ page }) => {
    await page.goto("/dossiers/#dossier-directory-grid-neexistuje");
    await page.waitForTimeout(300);
    const visible = page.locator("#dossier-directory [data-view]:not([hidden])");
    await expect(visible).toHaveCount(1);
  });
});

test.describe("výchozí řazení", () => {
  test("adresář je abecedně setříděný bez jakéhokoli zásahu", async ({ page }) => {
    // Výchozí pohled nesmí začínat tím, kdo je náhodou první v registru.
    await page.goto("/dossiers/?view=list");
    await page.waitForTimeout(250);
    // První odkaz v položce je název dossieru; další jsou metriky, které
    // by do abecedního porovnání nepatřily.
    const titles = await page
      .locator('#dossier-directory [data-view="list"] [data-record-key]')
      .evaluateAll((els) => els.map((e) => e.querySelector("a")?.textContent.trim() ?? ""));
    const seřazené = [...titles].sort((a, b) => a.localeCompare(b, "cs"));
    expect(titles.slice(0, 8)).toEqual(seřazené.slice(0, 8));
  });

  test("abecední pořadí platí i bez JavaScriptu", async ({ browser }) => {
    // Řadí se při buildu, ne v prohlížeči — jinak by čtenář bez skriptu
    // dostal pořadí podle registru.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/dossiers/");
    const first = await page
      .locator('#dossier-directory [data-view="table"] tbody tr th a')
      .allInnerTexts();
    const seřazené = [...first].sort((a, b) => a.localeCompare(b, "cs"));
    expect(first.slice(0, 6)).toEqual(seřazené.slice(0, 6));
    await context.close();
  });

  test("zrušení řazení vrátí abecední pořadí", async ({ page }) => {
    // Bez zapamatovaného výchozího pořadí by seznam zůstal seřazený podle
    // naposledy zvoleného sloupce a tlačítko by vypadalo jako nefunkční.
    await page.goto("/dossiers/?view=table");
    await page.waitForTimeout(200);
    const prvni = () => page.locator('#dossier-directory-table tbody tr:not([hidden]) th a').first().innerText();
    const abecedne = await prvni();

    await page.locator('#dossier-directory-table thead th[data-sort-key="claims"] button').click();
    await page.waitForTimeout(200);
    expect(await prvni()).not.toBe(abecedne);

    await page.getByRole("button", { name: /Zrušit filtr a řazení/i }).click();
    await page.waitForTimeout(250);
    expect(await prvni()).toBe(abecedne);
  });
});
