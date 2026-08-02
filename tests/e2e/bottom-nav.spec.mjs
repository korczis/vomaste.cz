// Mobile bottom navigation (coop T-012, application shell master prompt
// §4.1): compact global-task bar on small viewports, distinct from the
// drawer's full contextual tree. Two load-bearing behaviors: it exists
// only where a phone actually needs it (hidden on desktop, where the
// docked primary sidebar already gives one-tap access), and its "Menu"
// button opens the SAME drawer the navbar hamburger does — one drawer,
// two openers, never two different off-canvas panels.

import { test, expect } from "./fixtures.mjs";

test("bottom nav is visible on mobile, hidden on desktop", async ({ page, isMobile }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Rychlá navigace" });
  if (isMobile) {
    await expect(nav).toBeVisible();
  } else {
    await expect(nav).toBeHidden();
  }
});

test("bottom nav marks the current global destination with aria-current", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the bar itself is hidden on desktop");
  await page.goto("/dossiers/");
  const nav = page.getByRole("navigation", { name: "Rychlá navigace" });
  await expect(nav.getByRole("link", { name: /Dossiery/ })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: /^Domů/ })).not.toHaveAttribute("aria-current", "page");
});

test("bottom nav's Menu button opens the same drawer the navbar hamburger does", async ({ page, isMobile }) => {
  test.skip(!isMobile, "the bar itself is hidden on desktop");
  await page.goto("/dossiers/");
  const drawer = page.locator("#sidebar");
  await expect(drawer).toHaveAttribute("aria-hidden", "true");
  await page.getByRole("navigation", { name: "Rychlá navigace" }).getByRole("button", { name: "Menu" }).click();
  await expect(drawer).not.toHaveAttribute("aria-hidden", "true");
  await expect(drawer.getByRole("link", { name: /^Dossiery/ })).toBeVisible();
});
