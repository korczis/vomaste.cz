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

test.describe("procházení sousedů", () => {
  // Uzel se vybírá přes ?node= v adrese, ne klikáním do plátna: klik na
  // souřadnici uzel netrefí spolehlivě a test by se „přeskočil" —
  // přeskočený test ale nedokazuje nic a tváří se přitom zeleně.
  const URL_UZLU = "/map/?node=vlada";

  test("inspektor nabídne propojené záznamy a proklik mění výběr", async ({ page }) => {
    // Bez seznamu sousedů se k propojenému záznamu dostaneš jen trefou
    // do tečky na plátně — na dotykovém displeji to nejde vůbec.
    await page.goto(URL_UZLU);
    await page.waitForTimeout(2500);

    await expect(page.locator("[data-graph-neighbors]")).toBeVisible();
    const first = page.locator("[data-neighbor-id]").first();
    const label = (await first.locator(".graph-inspector-neighbor-label").textContent())?.trim();
    const before = (await page.locator(".graph-inspector-heading").first().textContent())?.trim();

    await first.click();
    await page.waitForTimeout(400);
    const after = (await page.locator(".graph-inspector-heading").first().textContent())?.trim();

    expect(after, "proklik souseda nezměnil vybraný záznam").not.toBe(before);
    expect(after).toBe(label);
  });

  test("proklik souseda je sdílitelný — zapíše se do adresy", async ({ page }) => {
    // Procházení, které nejde poslat odkazem, není v tomhle projektu
    // procházení: celý graf staví na tom, že nález lze doložit adresou.
    await page.goto(URL_UZLU);
    await page.waitForTimeout(2500);
    await page.locator("[data-neighbor-id]").first().click();
    await page.waitForTimeout(400);
    const url = page.url();
    expect(url).toMatch(/[?&]node=/);
    expect(url).not.toMatch(/[?&]node=vlada(&|$)/);
  });

  test("cíl kliknutí souseda je dost velký na dotyk", async ({ page }) => {
    await page.goto(URL_UZLU);
    await page.waitForTimeout(2500);
    const box = await page.locator("[data-neighbor-id]").first().boundingBox();
    expect(box?.height, `výška cíle ${box?.height}px`).toBeGreaterThanOrEqual(36);
  });

  test("sousedé se řadí podle počtu vazeb sestupně", async ({ page }) => {
    // Uzel s mnoha vazbami je zpravidla ten, kudy vede cesta dál;
    // abecední pořadí by tuhle informaci zahodilo.
    await page.goto(URL_UZLU);
    await page.waitForTimeout(2500);
    const metas = await page.locator(".graph-inspector-neighbor-meta").allTextContents();
    const stupne = metas.map((m) => Number(m.split("·").pop().trim()));
    expect(stupne.length).toBeGreaterThan(1);
    expect(stupne).toEqual([...stupne].sort((a, b) => b - a));
  });
});

test.describe("viditelný počet", () => {
  // Hlášení v data-graph-status je sr-only. Počet po filtru tedy slyšel
  // jen odečítač a vidoucí uživatel viděl jen ztlumené tečky — pro
  // většinu lidí graf po filtru mlčel dál.
  const pocet = (page) => page.locator("[data-graph-count]");

  test("počet uzlů je vidět, ne jen slyšet", async ({ page }) => {
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    await expect(pocet(page)).toBeVisible();
    await expect(pocet(page)).toHaveText(/\d+ uzlů/);
  });

  test("po filtru ukazuje viditelný počet shodu", async ({ page }) => {
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    await page.locator("[data-graph-search]").fill("Babiš");
    await page.waitForTimeout(600);
    await expect(pocet(page)).toHaveText(/\d+ z \d+ uzlů odpovídá filtru/);
  });

  test("po zrušení filtru nezůstane viset staré číslo", async ({ page }) => {
    // Zastaralý údaj je horší než žádný: tváří se stejně důvěryhodně
    // jako platný.
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    const search = page.locator("[data-graph-search]");
    await search.fill("Babiš");
    await page.waitForTimeout(600);
    const filtrovano = await pocet(page).textContent();

    await search.fill("");
    await page.waitForTimeout(600);
    const po = await pocet(page).textContent();
    expect(po).not.toBe(filtrovano);
    expect(po).toMatch(/^\d+ uzlů$/);
  });

  test("prázdná shoda se vizuálně odliší", async ({ page }) => {
    await page.goto("/map/");
    await page.waitForTimeout(2500);
    await page.locator("[data-graph-search]").fill("zzzzz-neexistuje");
    await page.waitForTimeout(600);
    await expect(pocet(page)).toHaveClass(/graph-count-warn/);
  });
});

test.describe("porucha načtení vrstvy", () => {
  // Registrová vrstva se stahuje na vyžádání. Selhání se dřív hlásilo
  // jen do sr-only oblasti — vidoucí uživatel klikl, nic se nestalo
  // a nedozvěděl se proč. Tichá porucha je k nerozeznání od nefunkčního
  // tlačítka a svádí k závěru, že data neexistují.
  test("nenačtená vrstva se hlásí viditelně", async ({ page }) => {
    await page.route("**/global-registry.json*", (r) => r.abort());
    await page.goto("/map/");
    await page.waitForTimeout(2000);
    await page.locator('[data-graph-layer="full"]').click();
    await page.waitForTimeout(1500);

    const pocet = page.locator("[data-graph-count]");
    await expect(pocet).toHaveText(/nepodařilo načíst/i);
    await expect(pocet).toHaveClass(/graph-count-warn/);
  });

  test("po úspěšném přepnutí počítadlo ukazuje novou vrstvu", async ({ page }) => {
    // Jinak by v počítadle zůstalo číslo z předchozí vrstvy nebo text
    // „Načítám…", tedy údaj, který už neplatí.
    await page.goto("/map/");
    await page.waitForTimeout(2000);
    const pocet = page.locator("[data-graph-count]");
    const pred = Number((await pocet.textContent()).match(/(\d+)/)?.[1] || 0);

    await page.locator('[data-graph-layer="full"]').click();
    await page.waitForTimeout(2500);
    const po = Number((await pocet.textContent()).match(/(\d+)/)?.[1] || 0);

    expect(po, "počítadlo nereflektuje větší registrovou vrstvu").toBeGreaterThan(pred);
    await expect(pocet).not.toHaveText(/Načítám/);
  });
});
