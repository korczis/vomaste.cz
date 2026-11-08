// Panel „Stav doložení" na stránce evidence dossieru (ui_evidence_summary).
//
// Co test dokazuje v hotovém webu: čísla v panelu se rovnají tomu, co
// stránka zobrazuje záznam po záznamu (view modely), uzavřené mezery se
// nepočítají jako otevřené, dlaždice stavu vede na /hledat/ se stejným
// filtrem a stejným počtem, a u dossieru, který jen promítá cizí záznamy,
// odkazy nejsou (ukázaly by jiná čísla). Dossiery se vybírají z dat.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { test, expect } from "./fixtures.mjs";

const VIEWS = "data/generated/views/dossiers";
const load = (slug, reg) => JSON.parse(readFileSync(`${VIEWS}/${slug}/${reg}-index.json`, "utf8"));
const slugs = readdirSync(VIEWS).filter((s) => existsSync(`${VIEWS}/${s}/claims-index.json`));
const info = slugs.map((slug) => {
  const claims = load(slug, "claims");
  const gaps = load(slug, "gaps");
  return {
    slug,
    owns: claims.canonicalDossier === slug,
    claims: claims.rows,
    single: claims.rows.filter((c) => c.status === "status-single").length,
    openGaps: gaps.rows.filter((g) => g.status !== "closed").length,
    closedGaps: gaps.rows.filter((g) => g.status === "closed").length,
  };
});
const owner = info.filter((d) => d.owns && d.single > 0).sort((a, b) => b.claims.length - a.claims.length)[0];
const projection = info.find((d) => !d.owns && d.claims.length > 0);
const withClosed = info.find((d) => d.closedGaps > 0);
const panel = (page) => page.locator('[data-record-type="evidenceSummary"]');

test("čísla panelu se rovnají záznamům dossieru", async ({ page }) => {
  await page.goto(`/dossiers/${owner.slug}/evidence/`);
  await expect(panel(page)).toHaveAttribute("data-claims", String(owner.claims.length));
  await expect(panel(page)).toHaveAttribute("data-single", String(owner.single));
  await expect(panel(page)).toContainText("není to hodnocení pravdivosti");
});

test("uzavřené mezery se nepočítají jako otevřené", async ({ page }) => {
  test.skip(!withClosed, "žádný dossier s uzavřenou mezerou");
  await page.goto(`/dossiers/${withClosed.slug}/evidence/`);
  await expect(panel(page)).toHaveAttribute("data-open-gaps", String(withClosed.openGaps));
});

test("dlaždice 1 ZDROJ vede na hledání se stejným počtem", async ({ page }) => {
  await page.goto(`/dossiers/${owner.slug}/evidence/`);
  await panel(page).getByRole("link", { name: /1 ZDROJ/ }).click();
  await expect(page).toHaveURL(new RegExp(`/hledat/\\?.*dossier=${owner.slug}`));
  await expect(page.locator("[data-search-total]")).toContainText(String(owner.single));
});

test("dossier promítající cizí záznamy nemá zavádějící odkazy", async ({ page }) => {
  test.skip(!projection, "žádný promítací dossier");
  await page.goto(`/dossiers/${projection.slug}/evidence/`);
  await expect(panel(page)).toHaveAttribute("data-claims", String(projection.claims.length));
  await expect(panel(page).locator('a[href*="/hledat/"]')).toHaveCount(0);
});
