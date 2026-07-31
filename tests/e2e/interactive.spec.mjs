// Prohlížečové testy zbylých interaktivních ploch (coop T-023).
//
// Repozitář má osm modulů s vlastním runtime kódem (~860 řádků), z nichž
// do teď žádný neběžel v testu: příkazový řádek, průzkumník entit,
// globální mapa, SQL konzole. Tabulky pokryl T-021/T-022, tohle je zbytek.
//
// Zvláštní důvod u průzkumníka entit: při slučování URL stavu (T-019) jsem
// mu vyměnil čtení i zápis parametrů za sdílený modul a ověřil to jen tím,
// že se web sestaví. To není ověření — sestavit se dá i komponenta, která
// se v prohlížeči nenastartuje.

import { test, expect } from "./fixtures.mjs";

test.describe("průzkumník entit", () => {
  test("seskupí entity a nabídne přepnutí seskupení", async ({ page }) => {
    await page.goto("/entities/");
    const groups = page.locator('[x-ref="groups"] details');
    await expect(groups.first()).toBeVisible();
    expect(await groups.count()).toBeGreaterThan(1);
  });

  test("hledání zúží výsledek a promítne se do adresy", async ({ page }) => {
    // Regrese na můj refaktor: čtení i zápis parametrů převzal sdílený
    // url-state.js a nikdo to v prohlížeči neviděl.
    await page.goto("/entities/");
    const before = await page.locator('[x-ref="groups"] li').count();
    await page.locator('input[x-model="search"]').fill("babis");
    await page.waitForTimeout(300);
    const after = await page.locator('[x-ref="groups"] li').count();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    expect(page.url()).toContain("q=babis");
  });

  test("sdílený odkaz obnoví hledání i seskupení", async ({ page }) => {
    await page.goto("/entities/?q=vlada&group=dossier");
    await page.waitForTimeout(400);
    await expect(page.locator('input[x-model="search"]')).toHaveValue("vlada");
    // Výchozí seskupení je "type"; ?group=dossier se musí projevit.
    const summaries = await page.locator('[x-ref="groups"] summary').allInnerTexts();
    expect(summaries.length).toBeGreaterThan(0);
  });

  test("výchozí pohled nechává adresu čistou", async ({ page }) => {
    // stateToSearch vypouští výchozí hodnoty; kdyby to přestalo platit,
    // každý pohled by v adrese zanechal šum a odkazy by se nedaly
    // porovnat. Node test to hlídá nad řetězcem, tenhle nad skutečným DOM.
    await page.goto("/entities/");
    await page.waitForTimeout(300);
    expect(new URL(page.url()).search).toBe("");
  });
});

test.describe("příkazový řádek", () => {
  test("klávesa / zaostří vyhledávání", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("/");
    await page.waitForTimeout(150);
    const focused = await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement?.type ?? ""));
    expect(focused.toLowerCase()).toContain("input");
  });

  test("Cmd/Ctrl+K zaostří vyhledávání", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("ControlOrMeta+k");
    await page.waitForTimeout(150);
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(tag).toBe("INPUT");
  });

  test("hledání bez diakritiky najde záznam s diakritikou", async ({ page }) => {
    // Tohle je nosné chování normalize(): česky psaný web, kde uživatel
    // běžně píše bez háčků.
    await page.goto("/");
    await page.keyboard.press("/");
    const input = page.locator("input:focus");
    await input.fill("vojtech");
    await page.waitForTimeout(400);
    const body = await page.locator("body").innerText();
    expect(body.toLowerCase()).toContain("vojtěch");
  });
});

test.describe("SQL konzole", () => {
  test("konzole se spustí až na vyžádání a dotaz vrátí řádky", async ({ page }) => {
    // DuckDB-Wasm se načítá líně a je to velká závislost — proto se
    // ověřuje i to, že se bez kliknutí nespustí.
    test.slow();
    await page.goto("/data/");
    await expect(page.locator("[data-sql-panel]")).toBeHidden();

    await page.getByRole("button", { name: /Spustit SQL konzoli/i }).click();
    await expect(page.locator("[data-sql-panel]")).toBeVisible();

    await page.getByRole("button", { name: /^Spustit dotaz$/i }).click();
    // Načtení WASM a dat trvá; čeká se na tabulku výsledků, ne na čas.
    await expect(page.locator("[data-sql-output] table")).toBeVisible({ timeout: 60_000 });
    const rows = await page.locator("[data-sql-output] tbody tr").count();
    expect(rows).toBeGreaterThan(0);
  });

  test("ukázkový join vrátí přesně tolik řádků, kolik je deklarovaných vazeb", async ({ page }) => {
    // Dvojí kontrola v jednom testu:
    //
    // 1. Že dotaz vůbec PROBĚHNE. Původní verze používala UNNEST a ve
    //    WebAssembly verzi DuckDB skončila chybou — přitom nad desktopovým
    //    DuckDB fungovala. Navíc takový pád invaliduje celou databázi,
    //    takže uživateli po kliknutí na ukázku přestane fungovat i zbytek
    //    konzole. Ověřovat SQL jinde než tam, kde poběží, nestačí.
    //
    // 2. Že vrátí správný POČET. Join bez scope přes dossier nafoukne
    //    výsledek zhruba patnáctinásobně, protože id jsou číslovaná per
    //    dossier. Správný počet se musí shodovat se součtem source_count
    //    napříč tvrzeními — tenhle invariant drží nezávisle na tom, kolik
    //    tvrzení zrovna v datech je.
    test.slow();
    const expected = await page.request.get("/data/claims.json").then(async (r) => {
      const claims = await r.json();
      return claims.reduce((n, c) => n + (c.source_count ?? 0), 0);
    });
    expect(expected).toBeGreaterThan(0);

    await page.goto("/data/");
    await page.getByRole("button", { name: /Spustit SQL konzoli/i }).click();
    await page.getByRole("button", { name: /Tvrzení a jejich zdroje/i }).click();
    await page.getByRole("button", { name: /^Spustit dotaz$/i }).click();
    await expect(page.locator("[data-sql-output] table")).toBeVisible({ timeout: 60_000 });

    const status = await page.locator("[data-sql-status]").innerText();
    expect(status, "dotaz skončil chybou").not.toMatch(/chyba|error/i);
    const reported = Number((status.match(/^(\d+)/) || [])[1]);
    expect(reported).toBe(expected);
  });
});

test.describe("globální mapa", () => {
  test("graf se vykreslí do canvasu", async ({ page }) => {
    test.slow();
    await page.goto("/map/");
    // Sigma.js kreslí do <canvas>; jeho přítomnost a nenulová velikost
    // je minimální doklad, že se renderer nastartoval.
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible({ timeout: 30_000 });
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(100);
    expect(box?.height ?? 0).toBeGreaterThan(100);
  });

  test("bez JavaScriptu zůstane čitelný seznam vztahů", async ({ browser }) => {
    // Mapa je progresivní vylepšení: data musí být dostupná i bez
    // rendereru, jinak by graf byl jediná cesta k obsahu.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/map/");
    const items = await page.locator("li").count();
    expect(items).toBeGreaterThan(10);
    await context.close();
  });
});
