// Plošná kontrola přístupnosti přes všechny typy stránek (coop T-022).
//
// První sada (accessibility.spec.mjs) pokryla tři registry a našla tři
// skutečné vady — kontrast pod WCAG AA, zavřený panel jako past pro
// klávesnici a chybějící aria-sort. Nebyl důvod myslet si, že zbylých
// sedmnáct typů stránek je na tom jinak; byl jen důvod myslet si, že to
// nikdo neměřil.
//
// Typy stránek se odvozují z routes.json a navigation.json (archetypes.mjs),
// ne z ručního seznamu. Nový typ stránky se do kontroly zařadí sám —
// jinak by se plošná kontrola tvářila jako úplná, přestože by nový typ
// tiše přeskočila.

import { test, expect } from "./fixtures.mjs";
import AxeBuilder from "@axe-core/playwright";
import { pageArchetypes } from "./archetypes.mjs";

const ARCHETYPES = pageArchetypes();

test("seznam typů stránek není prázdný ani zkrácený", () => {
  // Kdyby se rozbilo odvozování (přejmenovaný klíč v routes.json, jiný
  // tvar navigace), sada by prošla s nulou testů a vypadala by zeleně.
  // Tenhle test je pojistka proti tichému vyprázdnění.
  expect(ARCHETYPES.length).toBeGreaterThanOrEqual(15);
  const urls = ARCHETYPES.map((a) => a.url);
  expect(new Set(urls).size).toBe(urls.length, "duplicitní URL v seznamu typů");
});

for (const { archetype, url } of ARCHETYPES) {
  test(`${archetype} — žádné vážné porušení přístupnosti`, async ({ page }) => {
    const response = await page.goto(url);
    // 404.html se servíruje jako obyčejný soubor, jinak čekáme 200.
    if (!url.endsWith("404.html")) {
      expect(response?.status(), `${url} se nenačetlo`).toBeLessThan(400);
    }

    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Jen serious/critical: moderate a minor bývají u tmavého vlastního
    // designu sporné a jejich plošné potlačení by z brány udělalo
    // dekoraci. Tyhle dvě úrovně jsou naopak jednoznačné.
    const severe = result.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    const summary = severe
      .map((v) => `${v.id} (${v.impact}, ${v.nodes.length}x): ${v.help}\n    ${v.nodes[0]?.target?.join(" ")}`)
      .join("\n  ");
    expect(severe, `${url}\n  ${summary}`).toEqual([]);
  });
}

test("každá stránka má právě jeden h1", async ({ page }) => {
  // Nadpisová osnova je pro odečítač hlavní způsob orientace. Dvě h1
  // znamenají dva „hlavní obsahy", žádná h1 znamená stránku bez názvu —
  // obojí projde vizuální kontrolou bez povšimnutí.
  const problems = [];
  for (const { archetype, url } of ARCHETYPES) {
    await page.goto(url);
    const count = await page.locator("h1").count();
    if (count !== 1) problems.push(`${archetype} (${url}): ${count}x h1`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
});
