// Testy čtečky data/seo.toml (T-076).
//
// Parser je vlastní (repozitář nemá TOML závislost), takže jeho chování
// musí být pokryté testy — jinak by se konfigurace mohla rozejít s tím,
// co čte Zola přes load_data, a nikdo by si toho nevšiml.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseToml, assertSeoShape, loadSeoConfig, readBaseUrl } from "./seo-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("parser: tabulky, podtabulky a klíč v uvozovkách s tečkou", () => {
  const out = parseToml(`
[site]
locale = "cs_CZ"
width = 1200
flag = true

[page_types.default]
og_type = "website"

[page_types."dossier.entity"]
og_type = "profile"
`);
  assert.equal(out.site.locale, "cs_CZ");
  assert.equal(out.site.width, 1200);
  assert.equal(out.site.flag, true);
  assert.equal(out.page_types.default.og_type, "website");
  // Klíč v uvozovkách je JEDEN klíč "dossier.entity", ne vnořená tabulka.
  assert.equal(out.page_types["dossier.entity"].og_type, "profile");
  assert.equal(out.page_types.dossier, undefined);
});

test("parser: pole inline i víceřádkové, prázdné pole", () => {
  const out = parseToml(`
[a]
inline = ["x", "y"]
empty = []
multi = [
  "p",
  "q",
]
`);
  assert.deepEqual(out.a.inline, ["x", "y"]);
  assert.deepEqual(out.a.empty, []);
  assert.deepEqual(out.a.multi, ["p", "q"]);
});

test("parser: # uvnitř řetězce není komentář", () => {
  const out = parseToml(`
[a]
color = "#000000 # ne komentář"
after = "x" # tohle komentář je
`);
  assert.equal(out.a.color, "#000000 # ne komentář");
  assert.equal(out.a.after, "x");
});

test("parser: nepodporovaná konstrukce je tvrdá chyba, ne tiché přeskočení", () => {
  assert.throws(() => parseToml(`[[items]]\nid = "x"\n`), /pole tabulek/);
  assert.throws(() => parseToml(`[a]\nx = 1.5\n`), /nepodporovaná hodnota/);
  assert.throws(() => parseToml(`[a]\nx = "neuzavřeno\n`), /neuzavřený řetězec/);
  assert.throws(() => parseToml(`[a\nx = "y"\n`), /nedokončená hlavička/);
  assert.throws(() => parseToml(`holy radek\n`), /není ani tabulka/);
});

// --- tvarová brána ---------------------------------------------------------

const MINIMAL = `
[site]
locale = "cs_CZ"
twitter_card = "summary_large_image"
twitter_card_without_image = "summary"
og_image = "images/og/site.jpg"
og_image_alt = "alt"
og_image_type = "image/jpeg"
og_image_width = 1200
og_image_height = 630
alternate_locales = []

[title]
separator = " — "
tagline = "t"
dossier_disambiguation = true

[description]
dossier_suffix = "Dossier: {label}."

[limits]
title_max = 120
title_min = 1
description_max = 201
description_min = 1

[enforce]
required_og = ["og:title"]
required_twitter = ["twitter:card"]
without_canonical = []

[dossier_image]
path_template = "images/og/{slug}.jpg"
alt_template = "a {label}"
alt_fallback = "a"

[page_types.default]
og_type = "website"
seo_type = "WebPage"
`;

test("tvarová brána: minimální validní konfigurace projde", () => {
  assert.doesNotThrow(() => assertSeoShape(parseToml(MINIMAL)));
});

test("tvarová brána: chybějící klíč je chyba, ne undefined uprostřed validace", () => {
  assert.throws(() => assertSeoShape(parseToml(MINIMAL.replace('locale = "cs_CZ"', ""))), /chybí "site.locale"/);
  assert.throws(() => assertSeoShape(parseToml(MINIMAL.replace("title_max = 120", ""))), /chybí "limits.title_max"/);
});

test("tvarová brána: typ stránky bez og_type/seo_type neprojde", () => {
  assert.throws(
    () => assertSeoShape(parseToml(MINIMAL + '\n[page_types.claim]\nseo_type = "WebPage"\n')),
    /page_types\."claim" nemá og_type/,
  );
  assert.throws(
    () => assertSeoShape(parseToml(MINIMAL + '\n[page_types.claim]\nog_type = "article"\n')),
    /page_types\."claim" nemá seo_type/,
  );
});

test("tvarová brána: fallback page_types.default je povinný", () => {
  const withoutDefault = MINIMAL.replace("[page_types.default]", "[page_types.claim]");
  assert.throws(() => assertSeoShape(parseToml(withoutDefault)), /musí obsahovat "default"/);
});

test("tvarová brána: nulová minimální délka by povolila prázdný titulek", () => {
  assert.throws(() => assertSeoShape(parseToml(MINIMAL.replace("title_min = 1", "title_min = 0"))), /aspoň 1/);
});

// --- skutečný soubor v repozitáři ------------------------------------------

test("data/seo.toml v repozitáři se načte a projde tvarovou bránou", () => {
  const seo = loadSeoConfig(ROOT);
  assert.ok(seo.page_types.default, "musí existovat fallback typ stránky");
  assert.ok(seo.enforce.required_og.includes("og:url"));
  assert.equal(readBaseUrl(ROOT).startsWith("https://"), true);
});

test("config.toml už metadatovou politiku nevlastní (jeden zdroj pravdy)", () => {
  // Regrese proti návratu duplicity: dokud tyhle klíče žily v config.toml
  // I v data/seo.toml, mohla se každá vrstva rozhodovat podle jiné hodnoty.
  const config = readFileSync(join(ROOT, "config.toml"), "utf8");
  for (const key of ["og_image", "og_image_alt", "og_type", "seo_type", "locale", "title_tagline"]) {
    assert.equal(
      new RegExp(`^${key}\\s*=`, "m").test(config),
      false,
      `config.toml nesmí znovu definovat "${key}" — vlastníkem je data/seo.toml`,
    );
  }
});
