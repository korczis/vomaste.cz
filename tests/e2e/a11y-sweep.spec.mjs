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

// Nadpisová osnova je pro odečítač hlavní způsob orientace. Dvě h1
// znamenají dva „hlavní obsahy", žádná h1 znamená stránku bez názvu —
// obojí projde vizuální kontrolou bez povšimnutí.
//
// PROČ TEST NA ARCHETYP, a ne jeden cyklus přes všechny: jako jediný test
// to bylo 27 sekvenčních `page.goto` pod jedním 30s limitem. Lokálně 15,6 s,
// v CI (pomalejší runner) přes limit — a spadlo to na timeoutu, ne na
// nálezu. Dataset přitom roste, takže by se to vracelo po každé větší
// dávce dossierů. Rozpad na test na archetyp dává každému vlastní rozpočet,
// pouští je paralelně (`fullyParallel`) a hlášku váže na konkrétní stránku
// místo agregovaného seznamu.
for (const { archetype, url } of ARCHETYPES) {
  test(`${archetype} — právě jeden h1`, async ({ page }) => {
    await page.goto(url);
    const count = await page.locator("h1").count();
    expect(count, `${archetype} (${url}): ${count}x h1`).toBe(1);
  });
}

// Známé duplicitní kotvy — RÁČNA, ne výjimka.
//
// Rešeršní kola připojovala ke kauze novou sekci místo sloučení do
// stávající, takže tentýž `{#kotva}` heading je v obsahu víckrát.
// Důsledek: neplatné HTML a odkaz na kauzu skočí na první výskyt.
//
// Proč to není opraveno: mechanické slučování jsem zkusil a POŠKODILO
// OBSAH — rozbité markdownové odkazy a zdvojené cesty. U části sekcí je
// navíc jeden výskyt původní redakční text (včetně odstavců „Co tento
// dossier výslovně netvrdí") a druhý generický pahýl; správné sloučení
// tam není strojově určitelné. Je to práce pro redakci, ne pro regex.
//
// Test proto hlídá, že se seznam NEROZŠIŘUJE, a upozorní, když se
// zmenší — pak je potřeba ho aktualizovat. Výjimka, která jen mlčí, by
// z brány udělala dekoraci.
const ZNAME_DUPLICITY = {
  "/dossiers/robert-plaga/": [
    "kauza-mobily",
    "kauza-skolni-rok",
    "kauza-testovani"
  ],
  "/dossiers/jeronym-tejc/": [
    "kauza-bitcoin",
    "kauza-ustavni-soud",
    "kauza-viktorka"
  ],
  "/dossiers/karel-havlicek/": [
    "kauza-elektromobilita",
    "kauza-stavebni-zakon",
    "kauza-toustovy-chleb"
  ],
  "/dossiers/boris-stastny/": [
    "kauza-nahravaci-zarizeni"
  ],
  "/dossiers/adam-vojtech/": [
    "kauza-benefity-stret",
    "kauza-defibrilatory",
    "kauza-ockovani-spd"
  ],
  "/dossiers/igor-cerveny/": [
    "kauza-cesta-usa",
    "kauza-kancelare",
    "kauza-majetkove-priznani",
    "kauza-stret-zajmu"
  ],
  "/dossiers/zuzana-mrazova/": [
    "kauza-cerne-stavby",
    "kauza-obecni-byt",
    "kauza-pokuta-stret-zajmu",
    "kauza-rezignace-podnet"
  ],
  "/dossiers/ivan-bednarik/": [
    "kauza-rezignace-cd",
    "kauza-zeleznicni-vydaje"
  ],
  "/dossiers/ales-juchelka/": [
    "kauza-obhajoba",
    "kauza-poradkyne-stret",
    "kauza-rozpocet",
    "kauza-trestni-oznameni"
  ],
  "/dossiers/martin-sebestyan/": [
    "kauza-szif",
    "kauza-transparency",
    "kauza-vymahani-agrofert"
  ],
  "/dossiers/jaromir-zuna/": [
    "kauza-koncepce-armady",
    "kauza-nacelnik-gs",
    "kauza-rozhovor-pavel",
    "kauza-rozpocet-nato"
  ]
};
const ZNAME_CELKEM = 34;

test("duplicitní kotvy nepřibývají (ráčna)", async ({ page }) => {
  // Tenhle NEJDE rozpadnout na test na archetyp jako kontrola h1 nad ním:
  // druhá půlka ráčny je CELKOVÝ počet duplicit, a ten je znát až po
  // návštěvě všech stránek. Zůstává tedy jeden test s jedním cyklem — a
  // proto potřebuje rozpočet, který roste se stránkami, ne pevných 30 s
  // z playwright.config.mjs. Na tom v CI 2026-08-13 spadl (timeout, ne
  // nález) poté, co dataset povyrostl na 233 dossierů.
  //
  // 8 s základ + 3 s na stránku: lokálně vychází ~0,6 s/stránku, CI runner
  // je zhruba 2–3x pomalejší, takže je v tom rezerva, aniž by se rozbitý
  // test protahoval na minuty.
  test.setTimeout(8_000 + ARCHETYPES.length * 3_000);

  const found = {};
  for (const { url } of ARCHETYPES) {
    await page.goto(url);
    const dups = await page.evaluate(() => {
      const seen = new Set();
      const out = [];
      for (const el of document.querySelectorAll("[id]")) {
        if (seen.has(el.id)) out.push(el.id);
        seen.add(el.id);
      }
      return [...new Set(out)].sort();
    });
    if (dups.length) found[url] = dups;
  }

  const nove = [];
  for (const [url, ids] of Object.entries(found)) {
    const povolene = new Set(ZNAME_DUPLICITY[url] ?? []);
    for (const id of ids) if (!povolene.has(id)) nove.push(`${url}: ${id}`);
  }
  expect(nove, `nové duplicitní kotvy:\n  ${nove.join("\n  ")}`).toEqual([]);

  const celkem = Object.values(found).reduce((n, v) => n + v.length, 0);
  expect(
    celkem,
    `duplicit ubylo (${celkem} < ${ZNAME_CELKEM}) — zmenši ZNAME_DUPLICITY v tomhle souboru, ať ráčna dál drží`,
  ).toBeLessThanOrEqual(ZNAME_CELKEM);
});
