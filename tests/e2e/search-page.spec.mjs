// Stránka /hledat/ (templates/search.html + assets/js/modules/search-page.js).
//
// Co test dokazuje v hotovém webu: dotaz bez diakritiky najde záznam,
// stav v URL obnoví tentýž výřez, filtr stavu vrací jen tvrzení v tom
// stavu, filtr bez dotazu prochází záznamy, příkazový řádek vede na
// stránku se stejným dotazem, nenačtený rejstřík se hlásí jako porucha
// a bez JavaScriptu stránka neukáže falešně prázdný výsledek.
// Hodnoty se berou z vygenerovaného rejstříku, nikdy podle jména.
import { readFileSync } from "node:fs";
import { test, expect } from "./fixtures.mjs";

const index = JSON.parse(readFileSync("static/search-index.json", "utf8"));
const claims = index.filter((r) => r.type === "claim" && r.extra);
const statusCounts = claims.reduce((m, r) => m.set(r.extra, (m.get(r.extra) || 0) + 1), new Map());
// Nejméně častý stav — výsledek se vejde na jednu stránku a dá se spočítat.
const [rareStatus, rareCount] = [...statusCounts.entries()].sort((a, b) => a[1] - b[1])[0];
const dossier = index.find((r) => r.type === "dossier" && /[áčďéěíňóřšťúůýž]/i.test(r.title));
const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

test("dotaz bez diakritiky najde dossier a zapíše se do adresy", async ({ page }) => {
  test.skip(!dossier, "žádný dossier s diakritikou v názvu");
  await page.goto("/hledat/");
  await page.locator("#search-q").fill(strip(dossier.title));
  const results = page.locator("[data-search-results]");
  await expect(results.locator(`a[href="${dossier.route}"]`).first()).toBeVisible();
  await expect(page).toHaveURL(/\?q=/);
});

test("filtr stavu vrací jen tvrzení v tom stavu a sedí počet", async ({ page }) => {
  await page.goto(`/hledat/?stav=${encodeURIComponent(rareStatus)}`);
  await expect(page.locator("[data-search-total]")).toContainText(String(rareCount));
  const badges = page.locator("[data-search-results] .status-badge");
  await expect(badges.first()).toBeVisible();
  const texts = await badges.allTextContents();
  expect(texts.length).toBe(Math.min(rareCount, 50));
  for (const t of texts) expect(t.trim()).toBe(rareStatus);
  await expect(page.locator("#search-type")).toHaveValue("claim");
});

test("sdílený odkaz obnoví dotaz i filtry", async ({ page }) => {
  const claim = claims[0];
  await page.goto(`/hledat/?q=${encodeURIComponent(claim.id)}&typ=claim&dossier=${claim.dossier}`);
  await expect(page.locator("#search-q")).toHaveValue(claim.id);
  await expect(page.locator("#search-dossier")).toHaveValue(claim.dossier);
  await expect(page.locator(`[data-search-results] a[href="${claim.route}"]`)).toBeVisible();
  await expect(page.locator("[data-search-total]")).toContainText("1 záznam");
});

test("filtr bez dotazu prochází záznamy dossieru", async ({ page }) => {
  const slug = claims[0].dossier;
  const expected = index.filter((r) => r.type === "claim" && r.dossier === slug).length;
  await page.goto(`/hledat/?typ=claim&dossier=${slug}`);
  await expect(page.locator("[data-search-total]")).toContainText(String(expected));
});

test("výchozí pohled má čistou adresu a vyzve k dotazu", async ({ page }) => {
  await page.goto("/hledat/");
  await expect(page.locator('[data-search-state="idle"]')).toBeVisible();
  await expect(page).toHaveURL(/\/hledat\/$/);
});

test("příkazový řádek vede na stránku se stejným dotazem", async ({ page, isMobile }) => {
  test.skip(isMobile, "navbarové hledání je na mobilu zúžené; stránka se testuje přímo");
  await page.goto("/koncepty/");
  const input = page.locator("#global-search-input");
  await input.fill("zdroj");
  const all = page.locator("[data-search-all]");
  await expect(all).toBeVisible();
  await all.click();
  await expect(page).toHaveURL(/\/hledat\/\?q=zdroj/);
  await expect(page.locator("#search-q")).toHaveValue("zdroj");
});

test("nenačtený rejstřík se hlásí jako porucha, ne jako prázdný výsledek", async ({ page }) => {
  await page.route("**/search-index.json*", (route) => route.fulfill({ status: 404, body: "<html>404</html>" }));
  await page.goto("/hledat/?q=cokoli");
  await expect(page.locator('[data-search-state="error"]')).toBeVisible();
  await expect(page.locator('[data-search-state="none"]')).toBeHidden();
});

test("bez JavaScriptu stránka řekne proč a nabídne rozcestníky", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  try {
    await page.goto("/hledat/?q=cokoli");
    // Textový engine Playwrightu do <noscript> nevidí ani bez JS, proto CSS.
    await expect(page.locator("#main noscript p")).toContainText("potřebuje JavaScript");
    await expect(page.locator('#main noscript a[href$="/dossiers/"]')).toHaveCount(1);
    await expect(page.locator('[data-search-state="none"]')).toBeHidden();
  } finally {
    await ctx.close();
  }
});
