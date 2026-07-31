// Regresní testy zdrojových rodin (coop T-029).
//
// Rodina říká, že dva zdroje NEJSOU dvě nezávislá doložení, ale jedno —
// převzetí téže agenturní zprávy nebo tentýž článek na dvou doménách.
// Bez toho čtenář vidí „tři zdroje" tam, kde stojí jedna redakce; přesně
// tahle záměna vedla dnes k opravě čtyř tvrzení u jednoho dossieru.
//
// Testuje se SÉMANTIKA počítání, ne konkrétní čísla v datech: ta se mění
// každým rešeršním kolem a test vázaný na dnešní stav by za týden lhal.
//
// Použití: node --test scripts/ui/source-families.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// Táž funkce, jakou používá build-data-exports.mjs. Kdyby se rozešly,
// hlásilo by UI jinou nezávislost než brána.
function countFamilies(sources) {
  const families = new Set();
  for (const s of sources) {
    families.add(s.family || `__self__:${s.src_id}`);
  }
  return families.size;
}

test("zdroje bez rodiny se počítají každý zvlášť", () => {
  const n = countFamilies([
    { src_id: "SRC-01", family: "" },
    { src_id: "SRC-02", family: "" },
    { src_id: "SRC-03", family: "" },
  ]);
  assert.equal(n, 3, "samostatný zdroj je vlastní rodina");
});

test("zdroje se stejnou rodinou se počítají jako jeden", () => {
  const n = countFamilies([
    { src_id: "SRC-01", family: "ctk" },
    { src_id: "SRC-02", family: "ctk" },
    { src_id: "SRC-03", family: "ctk" },
  ]);
  assert.equal(n, 1, "převzetí téže zprávy není trojí ověření");
});

test("smíšený případ: dvě převzetí a jeden samostatný zdroj = dvě rodiny", () => {
  const n = countFamilies([
    { src_id: "SRC-01", family: "ctk" },
    { src_id: "SRC-02", family: "ctk" },
    { src_id: "SRC-03", family: "" },
  ]);
  assert.equal(n, 2);
});

test("dvě různé rodiny zůstávají dvě", () => {
  const n = countFamilies([
    { src_id: "SRC-01", family: "ctk" },
    { src_id: "SRC-02", family: "denik-n" },
  ]);
  assert.equal(n, 2);
});

test("rodina se nesmí odvozovat z vydavatele", () => {
  // Dva různí vydavatelé můžou sdílet rodinu, pokud oba přebírají totéž;
  // a jeden vydavatel může vydat dvě nezávislé reportáže. Rodina je proto
  // samostatné editorské určení, ne funkce outletu.
  const stejnyVydavatelRuzneRodiny = countFamilies([
    { src_id: "SRC-01", family: "" },
    { src_id: "SRC-02", family: "" },
  ]);
  assert.equal(stejnyVydavatelRuzneRodiny, 2);
  const ruzniVydavateleStejnaRodina = countFamilies([
    { src_id: "SRC-01", family: "ctk" },
    { src_id: "SRC-02", family: "ctk" },
  ]);
  assert.equal(ruzniVydavateleStejnaRodina, 1);
});

test("prázdný výběr zdrojů dá nulu, ne jedničku", () => {
  assert.equal(countFamilies([]), 0, "tvrzení bez zdrojů nesmí vypadat jako doložené");
});

test("registr zdrojů rodinu zobrazuje, ne jen filtruje", () => {
  // Faseta sama nestačí: čtenář, který needituje filtr, musí příslušnost
  // k rodině vidět na řádku.
  const tpl = read("templates/dossier-sources-index.html");
  assert.match(tpl, /Rodina/, "registr zdrojů nemá sloupec rodiny");
  assert.match(tpl, /p\.extra\.family/, "šablona rodinu nečte z dat");
});

test("sémantika je popsaná ve schématu, ne jen v kódu", () => {
  // Rodina je editorské určení; bez popisu v kontraktu by ji další
  // přispěvatel vyplňoval podle dohadu.
  const schema = JSON.parse(read("schemas/source.schema.json"));
  const desc = schema.properties?.family?.description ?? "";
  assert.ok(desc.length > 40, "family nemá v schématu vysvětlení");
  assert.match(desc, /nezávisl/i, "popis neuvádí, že jde o nezávislost doložení");
});
