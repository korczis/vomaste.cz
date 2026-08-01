// Přístupnost a chování na malých displejích (coop T-021).
//
// Obojí je u husté tabulky nejčastější místo tichých regresí: na desktopu
// se přetečení do strany nepozná a chybějící popisek ovládacího prvku
// nikoho nezastaví, dokud web nepoužije někdo s odečítačem obrazovky.
//
// axe se pouští na skutečně vykreslené stránce, ne na šabloně — pravidla
// jako kontrast nebo název ovládacího prvku jdou vyhodnotit až nad DOM
// s aplikovaným CSS.

import { test, expect } from "./fixtures.mjs";
import AxeBuilder from "@axe-core/playwright";

const STRANKY = [
  ["registr tvrzení", "/dossiers/andrej-babis/claims/"],
  ["registr zdrojů", "/dossiers/andrej-babis/sources/"],
  ["adresář dossierů", "/dossiers/"],
  // Graph workbench (T-027) — toolbar, filtry, inspector panel.
  ["globální mapa", "/map/"],
  ["lokální graf dossieru", "/dossiers/macinka-turek/"],
  // Entity dossier overview (T-018) — view tabs, rozšířený metric strip, gaps preview.
  ["entity dossier — přehled", "/dossiers/petr-macinka/"],
];

for (const [nazev, cesta] of STRANKY) {
  test(`${nazev}: žádné vážné porušení přístupnosti`, async ({ page }) => {
    await page.goto(cesta);
    const vysledek = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Reportují se jen serious/critical. Moderate/minor bývají u tmavého
    // vlastního designu sporné a jejich hromadné potlačení by z brány
    // udělalo dekoraci; tyhle dvě úrovně jsou naopak jednoznačné.
    const vazne = vysledek.violations.filter((v) =>
      v.impact === "serious" || v.impact === "critical");
    const popis = vazne.map((v) =>
      `${v.id} (${v.impact}, ${v.nodes.length}x): ${v.help}`).join("\n");
    expect(vazne, popis).toEqual([]);
  });

  test(`${nazev}: nepřetéká do strany na mobilu`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "smysl má jen v mobilním projektu");
    await page.goto(cesta);
    // Tabulka SMÍ mít vlastní vodorovný posuv — to je záměr. Co nesmí
    // přetékat, je stránka: horizontální scroll celého dokumentu je
    // vada, protože rozbije čtení celého obsahu, ne jen tabulky.
    const prekroceni = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(prekroceni, "dokument se posouvá do strany").toBeLessThanOrEqual(1);
  });
}

test("řadicí tlačítko hlásí odečítači stav řazení", async ({ page }) => {
  // aria-sort je jediné, co odečítač o řazení ohlásí. Když se sloupec
  // řadí vizuálně, ale atribut se nezmění, je informace dostupná jen
  // vidoucím — proto je to test, ne poznámka v kódu.
  // ?view=table: registry mají tři projekce a na mobilu je výchozí
  // seznam, takže tabulka by byla skrytá.
  await page.goto("/dossiers/andrej-babis/claims/?view=table");
  const th = page.locator('#claims-registry-table thead th[data-sort-key="id"]');
  await expect(th).toHaveAttribute("aria-sort", "none");
  await th.locator("button").click();
  await expect(th).toHaveAttribute("aria-sort", "ascending");
});

test("filtrovací čip hlásí, zda je aktivní", async ({ page }) => {
  await page.goto("/dossiers/andrej-babis/claims/");
  const chip = page.getByRole("button", { name: "Corroborated" });
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");
});
