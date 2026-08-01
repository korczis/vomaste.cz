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
    await page.goto("/");
    const faq = page.locator("section[aria-labelledby='faq-heading'] details");
    await expect(faq).toHaveCount(12);
    for (const d of await faq.all()) {
      await d.locator("summary").click();
      await expect(d.locator("p")).toBeVisible();
    }
  });
});
