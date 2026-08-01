import { test, expect } from "./fixtures.mjs";

// České skloňování po číslovce.
//
// Adresář vypisoval „32 zdroje" a „13 mezery" — tvar, který po tomhle
// čísle v češtině nestojí. Vznikalo to tím, že se popisek sloupce
// („Zdroje") jen převedl na malá písmena a použil pro libovolný počet.
//
// Test kontroluje PRAVIDLO nad vším, co se na stránce vyskytne, ne výčet
// dnešních hodnot: seznam čísel se mění každým rešeršním kolem a test
// vázaný na dnešní stav by za týden hlídal minulost.
const TVARY = {
  zdroj: { one: "zdroj", few: "zdroje", many: "zdrojů" },
  kauza: { one: "kauza", few: "kauzy", many: "kauz" },
  mezera: { one: "mezera", few: "mezery", many: "mezer" },
  entita: { one: "entita", few: "entity", many: "entit" },
  vztah: { one: "vztah", few: "vztahy", many: "vztahů" },
  dossier: { one: "dossier", few: "dossiery", many: "dossierů" },
};

// Očekávaný tvar podle českého pravidla: 1 → jednotné, 2–4 → množné
// nominativ, 0 a 5+ → genitiv množného. Rozsah 11–14 se NEřeší zvlášť:
// v češtině (na rozdíl od ruštiny) je „11 zdrojů" tvořeno stejně jako
// „15 zdrojů".
function ocekavany(n, t) {
  if (n === 1) return t.one;
  if (n >= 2 && n <= 4) return t.few;
  return t.many;
}

// Delší tvary první a unicodová hranice místo \b: JS \b pracuje s ASCII,
// takže mezi „j" a „ů" vidí hranici slova a „zdrojů" by se matchlo jako
// „zdroj". Test by pak hlásil chyby, které v textu nejsou.
const VSECHNY = [...new Set(Object.values(TVARY).flatMap((t) => [t.one, t.few, t.many]))]
  .sort((a, b) => b.length - a.length);
const VZOR = new RegExp(`(\\d+)\\s+(${VSECHNY.join("|")})(?![\\p{L}])`, "gu");

test.describe("skloňování po číslovce", () => {
  // ?view=list schválně: ve výchozí tabulce jsou počty holá čísla ve
  // sloupcích, takže by test neměl co kontrolovat. Slova se vypisují
  // v seznamu a dlaždicích.
  for (const url of ["/dossiers/?view=list", "/dossiers/?view=grid", "/"]) {
    test(`${url}: každý počet má správný tvar`, async ({ page }) => {
      await page.goto(url);
      const text = await page.evaluate(() => document.body.innerText);

      const chyby = [];
      let kontrolovano = 0;
      for (const [, cislo, slovo] of text.matchAll(VZOR)) {
        const n = Number(cislo);
        const skupina = Object.values(TVARY).find((t) => [t.one, t.few, t.many].includes(slovo));
        if (!skupina) continue;
        kontrolovano++;
        const chce = ocekavany(n, skupina);
        if (slovo !== chce) chyby.push(`„${n} ${slovo}" má být „${n} ${chce}"`);
      }

      // Bez tohohle by test prošel i tehdy, kdyby se počty přestaly
      // vypisovat úplně — hlídal by prázdnou množinu.
      expect(kontrolovano, "na stránce nejsou žádné počty ke kontrole").toBeGreaterThan(5);
      expect([...new Set(chyby)], [...new Set(chyby)].join("\n")).toEqual([]);
    });
  }

  test("tvar se mění podle čísla, ne podle popisku sloupce", async ({ page }) => {
    // Konkrétní důkaz, že jde o pravidlo a ne o náhodu: na stránce musí
    // existovat aspoň dvě různá čísla u téhož pojmu s různým tvarem.
    await page.goto("/dossiers/?view=list");
    const text = await page.evaluate(() => document.body.innerText);
    const tvary = new Set();
    for (const [, , slovo] of text.matchAll(/(\d+)\s+(kauzy|kauza|kauz)(?![\p{L}])/gu)) tvary.add(slovo);
    expect(tvary.size, `nalezené tvary: ${[...tvary].join(", ")}`).toBeGreaterThan(1);
  });
});
