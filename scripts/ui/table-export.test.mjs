// Regresní testy exportu výřezu tabulky (coop T-019,
// assets/js/modules/table-filter.js).
//
// Nosné chování je escapování. Export míří do tabulkového procesoru, tedy
// do cizího softwaru, ne jen do textového souboru — a dva druhy vstupu tam
// dokážou napáchat škodu:
//
//   1. uvozovky, čárky a konce řádků rozbijí strukturu CSV, takže se
//      sloupce rozjedou a hodnoty se přiřadí k cizím řádkům;
//   2. text začínající na =, +, - nebo @ vyhodnotí Excel a LibreOffice
//      jako VZOREC. Titulek zdroje může legitimně začínat pomlčkou, takže
//      to není hypotetický vstup — a vzorec v cizím sešitu může volat
//      externí odkaz. Proto se před takovou hodnotu vkládá apostrof.
//
// Použití: node --test scripts/ui/table-export.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { csvCell, toCsv } from "../../assets/js/modules/table-filter.js";

test("běžná hodnota se jen uzavře do uvozovek", () => {
  assert.equal(csvCell("Vláda ČR"), '"Vláda ČR"');
});

test("uvozovka uvnitř se zdvojí podle RFC 4180", () => {
  assert.equal(csvCell('řekl "ne"'), '"řekl ""ne"""');
});

test("čárka nerozbije sloupce", () => {
  const csv = toCsv(["a", "b"], [["x,y", "z"]]);
  assert.equal(csv.split("\r\n")[1], '"x,y","z"');
});

test("konec řádku uvnitř hodnoty nerozbije řádky", () => {
  const csv = toCsv(["a"], [["prvni\ndruhy"]]);
  assert.equal(csv.split("\r\n").length, 2, "vícedřádková hodnota zůstává jedním záznamem");
});

test("hodnota začínající = se neutralizuje jako vzorec", () => {
  assert.equal(csvCell("=1+1"), `"'=1+1"`);
});

test("pomlčka na začátku se neutralizuje — titulky tak reálně začínají", () => {
  assert.equal(csvCell("-5 % rozpočtu"), `"'-5 % rozpočtu"`);
});

test("plus i zavináč jsou taky spouštěče vzorce", () => {
  assert.equal(csvCell("+A1"), `"'+A1"`);
  assert.equal(csvCell("@SUM(A1)"), `"'@SUM(A1)"`);
});

test("prázdná a chybějící hodnota dá prázdné pole, ne text undefined", () => {
  assert.equal(csvCell(""), '""');
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell(undefined), '""');
});

test("hlavička je první řádek a řádky ji následují ve stejném pořadí sloupců", () => {
  const csv = toCsv(["ID", "Stav"], [["CLM-01", "1 ZDROJ"], ["CLM-02", "CITACE"]]);
  assert.deepEqual(csv.split("\r\n"), ['"ID","Stav"', '"CLM-01","1 ZDROJ"', '"CLM-02","CITACE"']);
});

test("číslo se exportuje jako text, ne jako prázdné pole", () => {
  assert.equal(csvCell(0), '"0"', "nula je hodnota, ne chybějící údaj");
  assert.equal(csvCell(42), '"42"');
});
