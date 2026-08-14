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

test.describe("členění výkladového textu", () => {
  // Tailwind preflight resetuje nadpisy na velikost běžného textu a nulové
  // okraje. Bez explicitních pravidel byl h3 k nerozeznání od odstavce —
  // podnadpis seděl nalepený na textu pod sebou a členění se ztratilo.
  // Netýkalo se to jen nové stránky, ale i živého dossieru.
  const STRANKY = ["/koncepty/co-je-dossier/", "/dossiers/andrej-babis/"];

  for (const url of STRANKY) {
    test(`${url}: podnadpisy jsou odlišené od odstavců`, async ({ page }) => {
      await page.goto(url);
      const m = await page.evaluate(() => {
        const h3 = document.querySelector(".dossier-prose h3");
        const p = document.querySelector(".dossier-prose p");
        if (!h3 || !p) return null;
        const sh = getComputedStyle(h3), sp = getComputedStyle(p);
        return {
          velikostH3: parseFloat(sh.fontSize),
          velikostP: parseFloat(sp.fontSize),
          odstupNad: parseFloat(sh.marginTop),
          vahaH3: Number(sh.fontWeight),
        };
      });
      expect(m, "stránka nemá h3 v .dossier-prose").not.toBeNull();
      expect(m.velikostH3, "podnadpis není větší než běžný text").toBeGreaterThan(m.velikostP);
      expect(m.odstupNad, "podnadpis nemá odstup od předchozího textu").toBeGreaterThanOrEqual(16);
      expect(m.vahaH3).toBeGreaterThanOrEqual(600);
    });
  }
});

test.describe("landing page — šířka, počty, FAQ", () => {
  test("všechny sekce mají stejnou šířku", async ({ page }) => {
    // Dřív se střídaly max-w-3xl / 5xl / 6xl, takže se obsah při
    // scrollování rozšiřoval a zužoval a stránka působila jako složená
    // z cizích dílů.
    await page.goto("/");
    const sirky = await page.evaluate(() =>
      [...document.querySelectorAll("main .landing-section")].map((el) => Math.round(el.getBoundingClientRect().width)));
    expect(sirky.length).toBeGreaterThan(5);
    expect(new Set(sirky).size, `nalezené šířky: ${[...new Set(sirky)].join(", ")}`).toBe(1);
  });

  test("na mobilu zůstává obsah v okně a nescrolluje do stran", async ({ page, isMobile }) => {
    test.skip(!isMobile, "měří se na úzkém displeji");
    await page.goto("/");
    const p = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    expect(p.doc, "stránka přetéká do stran").toBeLessThanOrEqual(p.win + 1);
  });

  test("„Dataset v číslech“ ukazuje celý dataset, ne jeden dossier", async ({ page }) => {
    // Podmínka v šabloně propouštěla 1 z 22 dossierů, takže sekce
    // ukazovala 49 tvrzení místo 835 — a tvrdila u toho, že jsou čísla
    // generovaná z reálných záznamů. Chybné číslo pod takovým nadpisem
    // je horší než žádné: vypadá doloženě.
    await page.goto("/");
    const tvrzeni = await page.evaluate(() => {
      const sec = document.querySelector("section[aria-labelledby='dataset-heading']");
      const el = [...sec.querySelectorAll("a")].find((a) => /Tvrzení/.test(a.textContent));
      return Number((el?.textContent || "").replace(/\D+/g, ""));
    });

    // Kontrola proti adresáři: součet nesmí být menší než největší
    // jednotlivý dossier. Práh je odvozený, ne opsané dnešní číslo.
    const nejvetsi = await page.evaluate(() => {
      const cisla = [...document.querySelectorAll("[data-dossier-directory] [data-record-key]")]
        .map((el) => Number((el.textContent.match(/(\d+)\s*tvrzení/) || [])[1] || 0));
      return Math.max(0, ...cisla);
    });
    expect(nejvetsi, "v adresáři nejsou počty tvrzení").toBeGreaterThan(0);
    expect(tvrzeni, `dataset hlásí ${tvrzeni}, ale jediný dossier má ${nejvetsi}`).toBeGreaterThan(nejvetsi);
  });

  test("FAQ nabízí rozšířenou sadu otázek a všechny se otevřou", async ({ page }) => {
    // Rozpočet podle toho, co test dělá: rozklikne KAŽDOU položku zvlášť a
    // u každé čeká na viditelnost odstavce. Lokálně to vychází na ~2 s na
    // položku (mobil, 12 položek → 20–24 s), takže výchozích 30 s
    // z playwright.config.mjs nechávalo pár sekund rezervy — a CI runner je
    // 2–3x pomalejší. V CI proto test procházel jen díky retry a 2026-08-13
    // se v jednom běhu překlopil do timeoutu. Není to vada webu ani pomalá
    // stránka: je to test, jehož délka roste s počtem otázek, pod pevným
    // limitem. Rozpočet se proto odvozuje od téhož počtu, který se asertuje.
    const POCET_OTAZEK = 12;
    test.setTimeout(10_000 + POCET_OTAZEK * 6_000);

    await page.goto("/");
    const faq = page.locator("section[aria-labelledby='faq-heading'] details");
    await expect(faq).toHaveCount(POCET_OTAZEK);
    for (const d of await faq.all()) {
      await d.locator("summary").click();
      await expect(d.locator("p")).toBeVisible();
    }
  });
});

test.describe("celowebová tvrzení odpovídají celému webu", () => {
  test("datum poslední aktualizace není starší než nejnovější dossier", async ({ page }) => {
    // Patička hlásila datum jediného dossieru (2026-07-29), přestože jiný
    // byl aktualizován 2026-08-01. Datum, které se tváří jako stav celého
    // webu, ale popisuje jeden záznam, je horší než žádné.
    await page.goto("/");
    const patka = (await page.locator("text=/Poslední aktualizace obsahu/").first().innerText()).match(/\d{4}-\d{2}-\d{2}/)?.[0];
    expect(patka, "v patičce není datum").toBeTruthy();

    await page.goto("/dossiers/");
    const nejnovejsi = (await page.evaluate(() =>
      [...document.querySelectorAll("[data-dossier-directory] [data-record-key]")]
        .flatMap((el) => el.textContent.match(/\d{4}-\d{2}-\d{2}/g) || [])
        .sort()
        .pop()));
    expect(nejnovejsi, "adresář neuvádí data").toBeTruthy();
    expect(patka >= nejnovejsi, `patička ${patka} je starší než nejnovější dossier ${nejnovejsi}`).toBe(true);
  });

  test("dlaždice s celowebovým počtem nevede do registru jednoho dossieru", async ({ page }) => {
    // „846 Tvrzení" mířící na registr se 76 záznamy je slib, který cíl
    // nesplní. Číslo je součet přes celý web, takže i cíl musí být
    // celowebový.
    await page.goto("/");
    const cile = await page.evaluate(() =>
      // Cílí se na označenou mřížku, ne na celou sekci: ta obsahuje
      // i seznam posledních aktualizací s odkazy na jednotlivá tvrzení,
      // takže široký selektor měřil něco úplně jiného.
      [...document.querySelectorAll("[data-dataset-tiles] a")].map((a) => new URL(a.href).pathname));
    expect(cile.length).toBe(6);
    const uzke = cile.filter((c) => /^\/dossiers\/[^/]+\/(claims|sources|cases|gaps|relations)\//.test(c));
    expect(uzke, `dlaždice míří do registru jednoho dossieru: ${uzke.join(", ")}`).toEqual([]);
  });

  test("odkazy dlaždic vedou na existující stránky", async ({ page }) => {
    // Navigace přes page, ne přes request fixture: ta v tomhle projektu
    // koliduje s přepisem URL a padá na „Request context disposed".
    await page.goto("/");
    const cile = [...new Set(await page.evaluate(() =>
      [...document.querySelectorAll("[data-dataset-tiles] a")].map((a) => new URL(a.href).pathname)))];
    expect(cile.length).toBeGreaterThan(1);
    for (const cesta of cile) {
      const r = await page.goto(cesta);
      expect(r?.status(), `${cesta} vrací ${r?.status()}`).toBeLessThan(400);
    }
  });
});
