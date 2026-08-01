import { test, expect } from "./fixtures.mjs";

test.describe("nástroje grafu", () => {
  const stav = (page) => page.evaluate(() =>
    (document.querySelector("[data-graph-status]")?.textContent || "").trim());

  test("filtr hlásí, kolik uzlů zbylo", async ({ page }) => {
    // Filtr uzly ztlumí, ale nesmaže z plátna — bez čísla uživatel nepozná,
    // jestli našel dva záznamy nebo dvě stě.
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    await page.locator("[data-graph-search]").fill("Babiš");
    await page.waitForTimeout(600);
    const s = await stav(page);
    expect(s, `stav po hledání: "${s}"`).toMatch(/odpovídá \d+ z \d+ uzlů/);
  });

  test("hlášené číslo odpovídá skutečné shodě", async ({ page }) => {
    // Počítá se týmiž predikáty jako vykreslování; kdyby se rozešly,
    // číslo by lhalo o tom, co je na plátně.
    // Výchozí vrstva „vztahy entit" obsahuje JEN entity, takže filtr podle
    // typu tam nic neomezí. Test proto přepne na celý registr, kde jsou
    // všechny typy záznamů — jinak by neměřil nic.
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    await page.locator('[data-graph-layer="full"]').click();
    await page.waitForTimeout(2500);
    await page.locator('[data-graph-filter="record_type"]').selectOption({ index: 1 });
    await page.waitForTimeout(600);
    const s = await stav(page);
    const m = s.match(/odpovídá (\d+) z (\d+)/);
    expect(m, `stav: "${s}"`).not.toBeNull();
    expect(Number(m[1])).toBeGreaterThan(0);
    expect(Number(m[1])).toBeLessThan(Number(m[2]));
  });

  test("ovládání hloubky procházení existuje a přepíná", async ({ page }) => {
    // Engine uměl zvýraznit okolí uzlu i celou komponentu, ale nic to
    // nevolalo — funkce bez tlačítka je nedostupná funkce.
    await page.goto("/map/");
    await page.waitForTimeout(2000);
    const chips = page.locator("[data-graph-depth]");
    await expect(chips).toHaveCount(4);
    await expect(chips.first()).toHaveAttribute("aria-pressed", "true");
    await chips.nth(1).click();
    await expect(chips.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(chips.first()).toHaveAttribute("aria-pressed", "false");
  });

  test("prázdný výsledek se hlásí jako prázdný, ne mlčením", async ({ page }) => {
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    await page.locator("[data-graph-search]").fill("zzzzz-neexistuje");
    await page.waitForTimeout(600);
    expect(await stav(page)).toMatch(/žádný z \d+ uzlů/);
  });
});
