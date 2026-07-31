// Prohlížečové testy sdílené tabulkové komponenty (coop T-019/T-021).
//
// Node testy pokrývají čisté funkce — porovnávání, URL stav, escapování
// CSV. Tenhle soubor pokrývá to, co z nich nejde: že se komponenta vůbec
// nastartuje, že hlavičky opravdu řadí, že filtr opravdu skrývá řádky a
// že sdílený odkaz obnoví stejný pohled.
//
// Bez těchhle testů se o celé interaktivní vrstvě dalo jen tvrdit, že
// funguje.

import { test, expect } from "./fixtures.mjs";

const REGISTRY = "/dossiers/andrej-babis/claims/";

test.describe("registr tvrzení", () => {
  test("bez JavaScriptu zůstane čitelná plná tabulka a žádné mrtvé tlačítko", async ({ browser }) => {
    // Progresivní vylepšení je slib, ne přání: bez skriptu musí stránka
    // dál nést všechna data a nesmí nabízet ovládací prvek, který nic
    // neudělá. Právě tuhle vadu měla jedna ze dvou sloučených implementací.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(REGISTRY);

    const rows = page.locator("#claims-registry tbody tr");
    await expect(rows).toHaveCount(await rows.count());
    expect(await rows.count()).toBeGreaterThan(10);

    // Hlavičky jsou bez JS prostý text; tlačítka dodá až komponenta.
    await expect(page.locator("#claims-registry thead button")).toHaveCount(0);
    await expect(page.locator("#claims-registry thead th[aria-sort]")).toHaveCount(0);
    await context.close();
  });

  test("hlavičky se povýší na tlačítka a řadí", async ({ page }) => {
    await page.goto(REGISTRY);
    const idHeader = page.locator('#claims-registry thead th[data-sort-key="id"] button');
    await expect(idHeader).toBeVisible();

    const firstId = () => page.locator("#claims-registry tbody tr:visible td:first-child").first().innerText();
    const before = await firstId();

    await idHeader.click();
    await expect(page.locator('#claims-registry thead th[data-sort-key="id"]')).toHaveAttribute("aria-sort", "ascending");
    const asc = await firstId();

    await idHeader.click();
    await expect(page.locator('#claims-registry thead th[data-sort-key="id"]')).toHaveAttribute("aria-sort", "descending");
    const desc = await firstId();

    expect(asc).not.toBe(desc);
    expect([asc, desc]).toContain(before.trim());
  });

  test("řazení podle počtu zdrojů začíná od nejvíce doložených", async ({ page }) => {
    // Číselný sloupec má začínat sestupně — u důkazů je zajímavé, co nese
    // největší váhu, ne co má nejmíň zdrojů.
    await page.goto(REGISTRY);
    await page.locator('#claims-registry thead th[data-sort-key="sources"] button').click();
    await expect(page.locator('#claims-registry thead th[data-sort-key="sources"]')).toHaveAttribute("aria-sort", "descending");
  });

  test("hledání ignoruje diakritiku", async ({ page }) => {
    // Regrese na skutečnou vadu: porovnávalo se textContent.toLowerCase(),
    // takže dotaz bez háčků nenašel nic a vypadalo to jako prázdná data.
    await page.goto(REGISTRY);
    const search = page.locator('#claims-registry, [data-record-type="claim"]').locator('input[type="search"]');
    await search.fill("babis");
    await page.waitForTimeout(200);
    const visible = page.locator("#claims-registry tbody tr:visible");
    expect(await visible.count()).toBeGreaterThan(0);
  });

  test("filtr podle stavu skryje ostatní řádky a promítne se do adresy", async ({ page }) => {
    await page.goto(REGISTRY);
    const total = await page.locator("#claims-registry tbody tr").count();
    await page.getByRole("button", { name: "Corroborated" }).click();
    await page.waitForTimeout(200);

    const visible = await page.locator("#claims-registry tbody tr:visible").count();
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThan(total);
    expect(page.url()).toContain("f=status-corroborated");
  });

  test("sdílený odkaz obnoví stejný výřez", async ({ page }) => {
    // Tohle je celý smysl URL stavu: co jeden najde, druhý uvidí stejně.
    await page.goto(`${REGISTRY}?f=status-corroborated&sort=sources&dir=desc`);
    await page.waitForTimeout(300);
    await expect(page.locator('#claims-registry thead th[data-sort-key="sources"]')).toHaveAttribute("aria-sort", "descending");
    const visible = await page.locator("#claims-registry tbody tr:visible").count();
    const total = await page.locator("#claims-registry tbody tr").count();
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThan(total);
  });

  test("skrytí sloupce ho odstraní z hlavičky i z řádků", async ({ page }) => {
    await page.goto(REGISTRY);
    await page.getByRole("button", { name: "Sloupce" }).click();
    const checkbox = page.locator("#claims-registry-columns input[type=checkbox]").nth(1);
    await checkbox.uncheck();
    await page.waitForTimeout(150);
    await expect(page.locator("#claims-registry thead th").nth(1)).toBeHidden();
    await expect(page.locator("#claims-registry tbody tr").first().locator("td").nth(1)).toBeHidden();
  });
});

test.describe("adresář dossierů", () => {
  test("řazení podle počtu tvrzení dá největší číslo nahoru", async ({ page }) => {
    await page.goto("/dossiers/");
    await page.locator('#dossier-directory thead th[data-sort-key="claims"] button').click();
    await page.waitForTimeout(200);
    const nums = await page
      .locator("#dossier-directory tbody tr:visible td:nth-child(2)")
      .allInnerTexts();
    const parsed = nums.map((n) => Number(n.trim())).filter((n) => !Number.isNaN(n));
    expect(parsed.length).toBeGreaterThan(1);
    expect(parsed[0]).toBeGreaterThanOrEqual(parsed[parsed.length - 1]);
  });
});

test.describe("inspektor záznamu", () => {
  const REG = "/dossiers/andrej-babis/claims/";

  test("otevře detail vedle seznamu, aniž by seznam zmizel", async ({ page }) => {
    // Celý smysl pohledu master-detail: uživatel neztratí kontext, ve
    // kterém záznam našel. Kdyby se seznam schoval, byla by to jen
    // pomalejší cesta na detailní stránku.
    await page.goto(REG);
    const rowsBefore = await page.locator("#claims-registry tbody tr:visible").count();
    await page.locator("#claims-registry tbody a[href*='clm-01']").first().click();
    await expect(page.locator('[role="region"]')).toBeVisible();
    expect(await page.locator("#claims-registry tbody tr:visible").count()).toBe(rowsBefore);
  });

  test("panel ukazuje hodnoty z téhož řádku, ne z druhého zdroje", async ({ page }) => {
    await page.goto(REG);
    const row = page.locator("#claims-registry tbody tr").first();
    const summary = (await row.locator("td").nth(2).innerText()).trim().replace(/\s+/g, " ");
    await row.locator("a").first().click();
    const panel = page.locator('[role="region"]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText(summary.slice(0, 40));
  });

  test("otevřený detail jde poslat odkazem", async ({ page }) => {
    await page.goto(REG);
    await page.locator("#claims-registry tbody a[href*='clm-02']").first().click();
    await expect(page).toHaveURL(/inspect=CLM-02/);

    await page.goto(`${REG}?inspect=CLM-02`);
    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('[role="region"] h3')).toHaveText("CLM-02");
  });

  test("Esc zavře panel a vrátí fokus na řádek", async ({ page }) => {
    // Bez vrácení fokusu skončí uživatel na klávesnici na začátku stránky
    // a musí se k místu, kde byl, znovu proklikat.
    await page.goto(REG);
    await page.locator("#claims-registry tbody a[href*='clm-03']").first().click();
    await expect(page.locator('[role="region"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="region"]')).toBeHidden();
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(focused).toBe("CLM-03");
  });

  test("bez JavaScriptu vede odkaz na kanonickou stránku", async ({ browser }) => {
    // Progresivní vylepšení: bez skriptu se panel nevykreslí a odkaz musí
    // fungovat jako odkaz, ne jako mrtvý ovládací prvek.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(REG);
    await page.locator("#claims-registry tbody a[href*='clm-01']").first().click();
    await expect(page).toHaveURL(/\/claims\/clm-01\//);
    await context.close();
  });
});
