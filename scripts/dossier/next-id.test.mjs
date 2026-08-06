// Testy next-id.mjs — bezpečné "další volné ID" pro claim/source/case/gap
// registr, kontrolující lokální working tree i origin/master.
//
// Přidáno 2026-08-06 po reálné ID kolizi ze session 2026-08-05 (dvě
// souběžné instance obě spočítaly stejné "další volné" CLM-09/SRC-09/
// SRC-10 z lokální kopie, aniž zkontrolovaly origin — viz
// docs/coop/PROTOCOL.md, "ID kolize u souběžně rozšiřovaného dossieru").
// Testy běží čistě proti reálnému, existujícímu james-quick dossieru s
// `--no-fetch` (žádný síťový přístup, žádná závislost na aktuálním
// stavu origin/master v CI) a proti jednomu izolovanému mkdtemp scaffoldu
// pro nulový/jednozáznamový okrajový případ.
import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { nextId, maxIdFromFilenames } from "./next-id.mjs";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");

test("james-quick claims: next-id (--no-fetch) souhlasí s tím, co je skutečně na disku", () => {
  const result = nextId({ dossier: "james-quick", registry: "claims", fetch: false });
  assert.equal(result.prefix, "CLM");
  assert.ok(result.local >= 19, "james-quick má mít aspoň CLM-19 z dřívější session");
  assert.equal(result.next, result.local + 1);
});

test("neexistující dossier vyhodí čitelnou chybu, ne pád na chybějící adresář", () => {
  assert.throws(
    () => nextId({ dossier: "tenhle-dossier-neexistuje-nikdy", registry: "claims", fetch: false }),
    /neexistuje/,
  );
});

test("neznámý registr vyhodí čitelnou chybu s výčtem povolených hodnot", () => {
  assert.throws(() => nextId({ dossier: "james-quick", registry: "nesmysl", fetch: false }), /neznámý --registry/);
});

test("maxIdFromFilenames: prázdný seznam souborů dá 0 (next-id pak vrátí 1), ne pád", () => {
  assert.equal(maxIdFromFilenames([], "clm"), 0);
});

test("maxIdFromFilenames: ignoruje jiné prefixy a nečíselné/nesouvisející soubory", () => {
  const files = ["clm-01.json", "clm-03.json", "src-99.json", "README.md", "clm-not-a-number.json"];
  assert.equal(maxIdFromFilenames(files, "clm"), 3);
});

test("maxIdFromFilenames: dvouciferná čísla se řadí číselně, ne lexikograficky (9 < 10)", () => {
  assert.equal(maxIdFromFilenames(["clm-09.json", "clm-10.json"], "clm"), 10);
});

test("CLI: `npm run dossier:next-id -- --dossier=james-quick --registry=sources --no-fetch` vypíše next-id řádek", () => {
  const out = execFileSync(
    process.execPath,
    ["scripts/dossier/next-id.mjs", "--dossier=james-quick", "--registry=sources", "--no-fetch"],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.match(out, /^next-id: SRC-\d+$/m);
});
