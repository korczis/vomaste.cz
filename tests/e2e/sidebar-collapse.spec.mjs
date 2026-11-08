// Sbalená položka postranní navigace (inline_children_max v
// data/navigation.toml, generuje scripts/dossier/build-navigation.mjs).
//
// Co test dokazuje v hotovém webu, ne v datech:
//  1. mimo dossier se seznam dossierů do stránky NEVYPISUJE — v sidebaru
//     je jen odkaz na úplný seznam a ten vede na existující stránku;
//  2. uvnitř dossieru je jeho položka v sidebaru i s registry a aktivní —
//     sbalení nesmí čtenáři vzít navigaci v dossieru, ve kterém je;
//  3. bez JavaScriptu platí totéž pravidlo (noscript blok).
// Dossier se vybírá z vygenerovaného stromu, nikdy podle jména.
import { readFileSync } from "node:fs";
import { test, expect } from "./fixtures.mjs";

const nav = JSON.parse(readFileSync("data/generated/navigation.json", "utf8"));
const collapsed = nav.items.filter((i) => i.collapsed);
const urlOf = (path) => "/" + path.replace(/^@\//, "").replace(/(^|\/)_index\.md$/, "$1").replace(/\.md$/, "/");

for (const item of collapsed) {
  const withRegistries = item.children.find((c) => (c.children ?? []).length > 0);
  const other = item.children.find((c) => c !== withRegistries);

  test(`${item.id}: mimo položku se děti nevypisují, jen odkaz na úplný seznam`, async ({ page }) => {
    await page.goto("/koncepty/");
    const sidebar = page.locator("#sidebar");
    const link = sidebar.locator(`[data-nav-collapsed-link="${item.id}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText(new RegExp(item.collapsedLabel));
    await expect(link).toHaveAttribute("href", new RegExp(`${urlOf(item.path)}$`));
    for (const child of item.children.slice(0, 5)) {
      await expect(sidebar.locator(`a[href$="${urlOf(child.path)}"]`)).toHaveCount(0);
    }
    const res = await page.request.get(urlOf(item.path));
    expect(res.status()).toBe(200);
  });

  test(`${item.id}: uvnitř dítěte je jeho podstrom v sidebaru a ostatní děti ne`, async ({ page }) => {
    test.skip(!withRegistries, "žádné dítě s podstromem");
    await page.goto(urlOf(withRegistries.path));
    const sidebar = page.locator("#sidebar");
    await expect(sidebar.locator("details[open] summary")).toContainText(withRegistries.label);
    for (const reg of withRegistries.children) {
      await expect(sidebar.locator(`a[href$="${urlOf(reg.path)}"]`).first()).toBeAttached();
    }
    if (other) await expect(sidebar.locator(`a[href$="${urlOf(other.path)}"]`)).toHaveCount(0);
    await expect(sidebar.locator(`[data-nav-collapsed-link="${item.id}"]`)).toHaveCount(1);
  });

  test(`${item.id}: bez JavaScriptu platí totéž pravidlo`, async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    try {
      await page.goto("/koncepty/");
      const noscript = page.getByRole("navigation", { name: "Hlavní navigace (bez JavaScriptu)" });
      await expect(noscript.getByRole("link", { name: item.collapsedLabel })).toHaveCount(1);
      if (other) await expect(noscript.locator(`a[href$="${urlOf(other.path)}"]`)).toHaveCount(0);
    } finally {
      await ctx.close();
    }
  });
}

test("aspoň jedna položka je sbalená — jinak test nic nedokazuje", () => {
  expect(collapsed.length).toBeGreaterThan(0);
});
