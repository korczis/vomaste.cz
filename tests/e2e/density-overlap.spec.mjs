// Akceptace hustoty a detekce překrytí (coop T-021).
//
// Dvě věci, které dosud nikdo neměřil a které se na desktopu nepoznají:
//
// HUSTOTA — u katalogu je klíčová. Původní zeď karet měla na 390 px
// 1,5 dossieru na obrazovku; adresář má 6,8. Bez měřeného prahu se ale
// hustota tiše vrátí zpátky při první „drobné" úpravě rozestupů.
//
// PŘEKRYTÍ — toolbar nebo lepivá hlavička může zakrýt obsah pod sebou.
// Na desktopu je místa dost a nestane se to; na 390 px ano, a projeví se
// to tím, že první řádek tabulky je schovaný pod hlavičkou.
//
// Prahy vycházejí z NAMĚŘENÝCH hodnot, ne z přání: jsou nastavené tak,
// aby prošel dnešní stav a spadl jeho zhoršení.



import { test, expect } from "./fixtures.mjs";

// Cíl pro hustý katalog: aspoň čtyři záznamy na obrazovku při 390 px.
// Adresář dnes zvládá 6,8.
const CIL_ZAZNAMU_NA_OBRAZOVKU = 4;

// Registry: naměřené hodnoty po zkrácení dlouhého textu na mobilu.
// Prahy jsou pod dnešním stavem, ale nad tím, co byl stav PŘED opravou —
// takže spadnou, kdyby se zalamování textu vrátilo.
//
// Historie pro srovnání (Pixel 5, záznamů na obrazovku):
//   tvrzení 1,89 -> 8,60   zdroje 3,24 -> 6,96
//   mezery  2,73 -> 5,75   kauzy  0,95 -> 4,96
//
// Kauzy byly nejhorší: jedna zabrala víc než celý displej, tedy hůř než
// původní zeď karet na úvodní stránce. Příčinou nebyla struktura, ale
// zalamování dlouhého textu v indexu; plný text zůstává na detailu.
const MINIMUM_REGISTRU = {
  "/dossiers/andrej-babis/claims/": 4.5,
  "/dossiers/andrej-babis/sources/": 5.5,
  "/dossiers/andrej-babis/gaps/": 5.0,
  "/dossiers/andrej-babis/cases/": 3.5,
};

test.describe("hustota na mobilu", () => {
  test("adresář dossierů udrží hustý katalog", async ({ page, isMobile }) => {
    test.skip(!isMobile, "hustota se měří na mobilním viewportu");
    await page.goto("/dossiers/");
    await page.waitForTimeout(300);
    const { rozestup, viewport } = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-dossier-directory] [data-view]:not([hidden]) [data-record-key]")];
      const a = els[0]?.getBoundingClientRect();
      const b = els[1]?.getBoundingClientRect();
      return { rozestup: a && b ? b.y - a.y : 0, viewport: window.innerHeight };
    });
    expect(rozestup, "položka adresáře nemá rozestup").toBeGreaterThan(0);
    const naObrazovku = viewport / rozestup;
    expect(
      naObrazovku,
      `na obrazovku se vejde jen ${naObrazovku.toFixed(1)} dossieru (rozestup ${Math.round(rozestup)} px)`,
    ).toBeGreaterThanOrEqual(CIL_ZAZNAMU_NA_OBRAZOVKU);
  });

  for (const [url, minimum] of Object.entries(MINIMUM_REGISTRU)) {
    test(`registr ${url} zůstává hustý (min ${minimum}/obrazovku)`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "hustota se měří na mobilním viewportu");
      await page.goto(url);
      await page.waitForTimeout(300);
      const { rozestup, viewport } = await page.evaluate(() => {
        // Měří se PRÁVĚ VIDITELNÁ projekce, ne tbody: registry mají nově
        // tři pohledy a na mobilu je výchozí seznam, takže řádky tabulky
        // jsou skryté. Měřit je by znamenalo měřit něco, co uživatel
        // nevidí — a test by hlídal špatnou věc.
        const root = document.querySelector("[data-dossier-directory]");
        const items = root
          ? [...root.querySelectorAll("[data-view]:not([hidden]) [data-record-key]")]
          : [...document.querySelectorAll("tbody tr")].filter((r) => !r.hidden);
        const a = items[0]?.getBoundingClientRect();
        const b = items[1]?.getBoundingClientRect();
        return { rozestup: a && b ? b.y - a.y : 0, viewport: window.innerHeight };
      });
      expect(rozestup).toBeGreaterThan(0);
      const naObrazovku = viewport / rozestup;
      expect(
        naObrazovku,
        `hustota klesla na ${naObrazovku.toFixed(1)} záznamu na obrazovku`,
      ).toBeGreaterThanOrEqual(minimum);
    });
  }
});

test.describe("překrytí", () => {
  const STRANKY = ["/", "/dossiers/", "/dossiers/andrej-babis/claims/"];

  for (const url of STRANKY) {
    test(`${url}: lepivé prvky nezakrývají obsah`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "překrytí hrozí hlavně na úzkém displeji");
      await page.goto(url);
      await page.waitForTimeout(300);

      const kolize = await page.evaluate(() => {
        const lepive = [...document.querySelectorAll("*")].filter((el) => {
          const s = getComputedStyle(el);
          return (s.position === "sticky" || s.position === "fixed") && el.offsetHeight > 0;
        });
        const out = [];
        for (const el of lepive) {
          const r = el.getBoundingClientRect();
          if (r.height === 0 || r.width === 0) continue;
          // Bod těsně pod lepivým prvkem: co je tam skutečně navrchu?
          const x = Math.round(r.left + r.width / 2);
          const y = Math.round(r.bottom + 4);
          if (y < 0 || y > window.innerHeight) continue;
          const nahore = document.elementFromPoint(x, y);
          if (!nahore) continue;
          // Když je navrchu ten samý lepivý prvek, přesahuje přes obsah.
          if (el.contains(nahore) && nahore !== el) continue;
          if (nahore === el || el.contains(nahore)) {
            out.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} zasahuje pod svůj okraj`);
          }
        }
        return out;
      });
      expect(kolize, kolize.join("\n")).toEqual([]);
    });
  }

  test("první řádek tabulky není schovaný pod hlavičkou", async ({ page, isMobile }) => {
    // Nejčastější podoba překrytí: lepivá hlavička sedí na prvním řádku,
    // takže uživatel nevidí záznam, ke kterému ho odkaz dovedl.
    test.skip(!isMobile, "překrytí hrozí hlavně na úzkém displeji");
    await page.goto("/dossiers/andrej-babis/claims/?view=table");
    await page.waitForTimeout(300);
    const zakryto = await page.evaluate(() => {
      const row = document.querySelector("#claims-registry-table tbody tr");
      if (!row) return false;
      const r = row.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight) return false;
      const nahore = document.elementFromPoint(Math.round(r.left + 20), Math.round(r.top + r.height / 2));
      return nahore ? !row.contains(nahore) && nahore !== row : false;
    });
    expect(zakryto, "první řádek registru je něčím překrytý").toBe(false);
  });
});
