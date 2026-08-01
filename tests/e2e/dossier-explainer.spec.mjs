import { test, expect } from "./fixtures.mjs";

// Výchozí pojem celého webu. Blok musí fungovat bez JS (proto <details>,
// ne Alpine) a nesmí existovat jako druhá kopie textu v šabloně — jinak
// by se po první úpravě rozešel s kanonickou stránkou a čtenář by na
// dvou místech téhož webu našel dvě různá vymezení téhož pojmu.
test.describe("blok „Co je dossier?“", () => {
  // Blok se hledá přes id sekce, ne přes `details:has-text(...).first()`:
  // ten trefil <details> v postranní navigaci, které je na landingu mimo
  // obrazovku — test pak měřil úplně jiný prvek a hlásil to jako vadu
  // bloku.
  const blok = (page) => page.locator("#co-je-dossier-heading + details, section[aria-labelledby='co-je-dossier-heading'] details").first();

  test("na landingu je zavřený a ukazuje jednovětné shrnutí", async ({ page }) => {
    await page.goto("/");
    const det = blok(page);
    await expect(det).toBeVisible();
    await expect(det).not.toHaveAttribute("open", /.*/);
    await expect(det).toContainText(/Bez rozsudků, bez domněnek/);
  });

  test("po rozkliknutí ukáže celý výklad na místě", async ({ page }) => {
    await page.goto("/");
    const det = blok(page);
    await det.locator("summary").click();
    await expect(det.getByText("Co dossier obsahuje?", { exact: false })).toBeVisible();
    await expect(det.getByText("Dossier neposkytuje zkratku k názoru", { exact: false })).toBeVisible();
  });

  test("existuje samostatná citovatelná stránka se stejným výkladem", async ({ page }) => {
    // Landing blok je jen pohled; kanonický zdroj musí mít vlastní URL,
    // jinak nejde pojem odcitovat ani odkázat.
    const res = await page.goto("/koncepty/co-je-dossier/");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("h1")).toHaveText(/Co je dossier/);
    await expect(page.locator("body")).toContainText(/Dossier neposkytuje zkratku k názoru/);
  });

  test("blok odkazuje na samostatnou stránku", async ({ page }) => {
    await page.goto("/");
    const det = blok(page);
    await det.locator("summary").click();
    await expect(det.locator("a[href*='/koncepty/co-je-dossier/']")).toBeVisible();
  });

  test("výklad není v šabloně napsaný podruhé", async ({ page }) => {
    // Kontrola proti druhému kanonickému zdroji: klíčová věta smí být
    // na landingu právě jednou.
    await page.goto("/");
    const n = await page.locator("text=Dossier neposkytuje zkratku k názoru").count();
    expect(n, "výklad se na landingu vyskytuje vícekrát").toBe(1);
  });
});
