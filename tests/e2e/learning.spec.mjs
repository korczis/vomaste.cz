// Vzdělávací vrstva: routing, klíčové prvky lekcí a chování bez JavaScriptu.
//
// Proč prohlížečové testy zrovna tady: `validate-learning.mjs` ověří, že
// kurikulum drží jako graf — že prerekvizity existují, řetězy `next` vedou
// někam a odkazy na koncepty míří na existující stránky. Neověří ale, že se
// prvky lekce doopravdy vykreslí a že jdou ovládat.
//
// To je u výukové stránky ten podstatnější půlka: cvičení, jehož řešení se
// nedá odhalit klávesnicí, je nedostupné — a přitom by taková regrese prošla
// validací i zeleným buildem.

import { test, expect } from "./fixtures.mjs";

const SEKCE = [
  ["Start", "/start/"],
  ["Bootcamp", "/bootcamp/"],
  ["Akademie", "/akademie/"],
  ["Příručka", "/prirucka/"],
  ["Jak přispět", "/prispet/"],
];

for (const [nazev, cesta] of SEKCE) {
  test(`${nazev}: index se načte a má nadpis`, async ({ page }) => {
    const response = await page.goto(cesta);
    expect(response?.status(), `${cesta} se nenačetlo`).toBeLessThan(400);
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("úvodní stránka nabízí vstup pro nováčka", async ({ page }) => {
  // §63: vstup musí být srozumitelný člověku, který nezná slovo „dossier“.
  // Kdyby odkaz zmizel při úpravě hero sekce, /start/ by zůstal dostupný
  // jen přes postranní navigaci — a přesně ten člověk ji nepoužije.
  await page.goto("/");
  const odkaz = page.getByRole("link", { name: /Pochopte systém za pět minut/i });
  await expect(odkaz).toBeVisible();
  await odkaz.click();
  await expect(page).toHaveURL(/\/start\/$/);
});

test("lekce nese cíle, kanonické pojmy a pokračování", async ({ page }) => {
  await page.goto("/akademie/a104-taxonomie-stavu/");

  // Cíle: bez nich je z lekce jen text (vynucuje i validátor, tohle
  // ověřuje, že se opravdu vykreslí).
  await expect(page.getByRole("heading", { name: "Po téhle lekci" })).toBeVisible();

  // Odkaz na kanonickou definici — jádro pravidla „lekce pojem
  // nedefinuje podruhé“.
  const kanonicke = page.getByRole("heading", { name: "Kanonické znění pojmů" });
  await expect(kanonicke).toBeVisible();
  // Scope na `main` je podstatný: tytéž odkazy jsou i v postranním stromu,
  // kde jsou schované ve sbaleném <details> — bez scope by test měřil
  // navigaci místo obsahu lekce.
  await expect(page.locator('main a[href*="/koncepty/stav-"]').first()).toBeVisible();

  // Pokračování: čtenář nesmí skončit ve slepé uličce uprostřed kurzu.
  await expect(page.locator('main a[href*="/akademie/a105"]')).toBeVisible();
});

test("řešení cvičení jde odhalit klávesnicí a je v HTML i zavřené", async ({ page }) => {
  await page.goto("/bootcamp/03-nezavislost/");

  const detaily = page.locator("main details").first();
  await expect(detaily).toBeVisible();

  // Obsah je v dokumentu i zavřený — <details> ho neodstraňuje z DOM,
  // takže funguje vyhledávání v stránce i čtečka obrazovky.
  const obsah = detaily.locator(".dossier-prose");
  await expect(obsah).toBeAttached();
  await expect(detaily).not.toHaveAttribute("open", /.*/);

  // Ovládání klávesnicí: summary musí být fokusovatelné a reagovat.
  await detaily.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(detaily).toHaveAttribute("open", /.*/);
  await expect(obsah).toBeVisible();
});

test("cvičná data jsou vždy označená jako fiktivní", async ({ page }) => {
  // Tohle je bezpečnostní pojistka, ne kosmetika: cvičný příklad, který
  // by šel číst jako publikovaný záznam o skutečném člověku, je přesně to,
  // co AGENTS.md zakazuje. Označení vypisuje komponenta, ne autor lekce.
  await page.goto("/bootcamp/01-klasifikuj-tvrzeni/");
  await expect(page.getByText(/FIKTIVNÍ \/ CVIČNÁ DATA/i).first()).toBeVisible();
});

test("kontrolní seznam je ovladatelný a nic neslibuje o ukládání", async ({ page }) => {
  await page.goto("/bootcamp/08-graduation/");

  const prvni = page.locator('main input[type="checkbox"]').first();
  await expect(prvni).toBeVisible();
  await prvni.check();
  await expect(prvni).toBeChecked();

  // Web nemá účty ani server — stránka to musí říct, ne to nechat
  // uživatele předpokládat (konstituce §8: nepředstírat schopnost).
  await expect(page.getByText(/nikam neukládá/i)).toBeVisible();
});

test("stránka tvrzení nabízí kontextovou nápovědu ke stavu", async ({ page }) => {
  await page.goto("/dossiers/andrej-babis/claims/clm-01/");
  const napoveda = page.getByRole("link", { name: /Co tenhle stav znamená/i });
  await expect(napoveda).toBeVisible();
  await napoveda.click();
  await expect(page).toHaveURL(/\/koncepty\/stav-/);
});

for (const [nazev, cesta] of SEKCE) {
  test(`${nazev}: nepřetéká do strany na mobilu`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "smysl má jen v mobilním projektu");
    await page.goto(cesta);
    const prekroceni = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(prekroceni, "dokument se posouvá do strany").toBeLessThanOrEqual(1);
  });
}
