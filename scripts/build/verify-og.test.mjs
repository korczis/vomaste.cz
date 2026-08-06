// Testy brány sociálních a SEO metadat (T-076).
//
// Každé pravidlo má NEGATIVNÍ případ: bez něj by se dalo pozorovat jen
// to, že brána prochází, ne že ještě chytá. Fixtures jsou celé syntetické
// stromy (vlastní data/seo.toml + config.toml + content/ + „vydané" HTML),
// takže testy nezávisí na aktuálním obsahu repozitáře.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyOg, extractMeta, extractCanonical, extractPageNode, decodeEntities } from "./verify-og.mjs";

const REAL_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SEO_TOML = `
[site]
locale = "cs_CZ"
alternate_locales = []
twitter_card = "summary_large_image"
twitter_card_without_image = "summary"
og_image = "images/og/site.jpg"
og_image_width = 1200
og_image_height = 630
og_image_type = "image/jpeg"
og_image_alt = "alt webu"

[title]
separator = " — "
tagline = "tagline"
dossier_disambiguation = true

[description]
dossier_suffix = "Dossier: {label}."

[limits]
title_max = 30
title_min = 1
description_max = 60
description_min = 1

[enforce]
required_og = ["og:title", "og:description", "og:type", "og:url", "og:image", "og:image:alt", "og:locale", "og:site_name"]
required_twitter = ["twitter:card"]
without_canonical = ["404.html"]

[dossier_image]
path_template = "images/og/{slug}.jpg"
alt_template = "karta {label}"
alt_fallback = "karta"

[page_types.default]
og_type = "website"
seo_type = "WebPage"

[page_types.not_found]
og_type = "website"
seo_type = "WebPage"

[page_types.claim]
og_type = "article"
seo_type = "WebPage"
`;

const BASE = "https://example.test";

function page({
  title = "Titulek",
  description = "Popis stránky.",
  ogType = "article",
  url = `${BASE}/a/`,
  canonical = `${BASE}/a/`,
  image = `${BASE}/images/og/site.jpg`,
  imageAlt = "alt webu",
  locale = "cs_CZ",
  siteName = "example",
  card = "summary_large_image",
  ldName = title,
  ldDescription = description,
  ldUrl = url,
  extraHead = "",
} = {}) {
  const attr = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [{ "@type": "WebPage", name: ldName, description: ldDescription, url: ldUrl }],
  });
  return `<!doctype html><html lang=cs><head>
${canonical === null ? "" : `<link rel=canonical href="${attr(canonical)}">`}
${title === null ? "" : `<meta content="${attr(title)}" property=og:title>`}
${description === null ? "" : `<meta content="${attr(description)}" property=og:description>`}
${ogType === null ? "" : `<meta content="${attr(ogType)}" property=og:type>`}
${url === null ? "" : `<meta content="${attr(url)}" property=og:url>`}
${image === null ? "" : `<meta content="${attr(image)}" property=og:image>`}
${imageAlt === null ? "" : `<meta content="${attr(imageAlt)}" property="og:image:alt">`}
<meta content="${attr(locale)}" property=og:locale>
<meta content="${attr(siteName)}" property=og:site_name>
${card === null ? "" : `<meta content="${attr(card)}" name=twitter:card>`}
<meta content="${attr(title ?? "")}" name=twitter:title>
<meta content="${attr(description ?? "")}" name=twitter:description>
${image === null ? "" : `<meta content="${attr(image)}" name=twitter:image>`}
${extraHead}
<script type="application/ld+json">${ld}</script>
</head><body></body></html>`;
}

// Postaví syntetický kořen: data/seo.toml, config.toml, content/ a
// „vydaný" strom s obrázkem, na který og:image ukazuje.
function fixture(pages, { seoToml = SEO_TOML, contentFrontMatter = ['record_type = "claim"'] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "verify-og-"));
  mkdirSync(join(dir, "data"), { recursive: true });
  writeFileSync(join(dir, "data/seo.toml"), seoToml);
  writeFileSync(join(dir, "config.toml"), `base_url = "${BASE}"\ntitle = "example"\n`);
  mkdirSync(join(dir, "content"), { recursive: true });
  contentFrontMatter.forEach((extra, i) => {
    writeFileSync(join(dir, `content/page-${i}.md`), `+++\ntitle = "t"\n\n[extra]\n${extra}\n+++\n`);
  });
  const pub = join(dir, "public");
  mkdirSync(join(pub, "images/og"), { recursive: true });
  writeFileSync(join(pub, "images/og/site.jpg"), "jpeg");
  for (const [rel, html] of Object.entries(pages)) {
    mkdirSync(join(pub, dirname(rel)), { recursive: true });
    writeFileSync(join(pub, rel), html);
  }
  return { dir, pub, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function run(pages, opts) {
  const f = fixture(pages, opts);
  try {
    return verifyOg({ root: f.dir, publicRoot: f.pub });
  } finally {
    f.cleanup();
  }
}

test("úplná a konzistentní stránka projde", () => {
  const { errors, pages } = run({ "a/index.html": page() });
  assert.deepEqual(errors, []);
  assert.equal(pages, 1);
});

test("chybějící povinná značka shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ description: null }) });
  assert.equal(errors.length >= 1, true);
  assert.match(errors.join("\n"), /chybí <meta property="og:description">/);
});

test("prázdná hodnota povinné značky shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ title: "", ldName: "" }) });
  assert.match(errors.join("\n"), /prázdná hodnota og:title/);
});

test("og:url musí sedět na kanonickou URL", () => {
  const { errors } = run({ "a/index.html": page({ canonical: `${BASE}/jina/` }) });
  assert.match(errors.join("\n"), /og:url .* != kanonická URL/);
});

test("chybějící kanonická URL mimo výjimku shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ canonical: null }) });
  assert.match(errors.join("\n"), /chybí <link rel="canonical">/);
});

test("stránka ve without_canonical smí být bez kanonické URL i bez og:url", () => {
  const { errors } = run({
    "404.html": page({ canonical: null, url: null, ldUrl: undefined }),
  });
  assert.deepEqual(errors, []);
});

test("stránka ve without_canonical NESMÍ kanonickou URL mít", () => {
  const { errors } = run({ "404.html": page({ canonical: `${BASE}/404.html` }) });
  assert.match(errors.join("\n"), /without_canonical/);
});

test("relativní og:image shodí bránu (sociální sítě ho nezobrazí)", () => {
  const { errors } = run({ "a/index.html": page({ image: "/images/og/site.jpg" }) });
  assert.match(errors.join("\n"), /není absolutní URL/);
});

test("og:image na neexistující soubor shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ image: `${BASE}/images/og/chybi.jpg` }) });
  assert.match(errors.join("\n"), /neexistuje/);
});

test("twitter:image se musí shodovat s og:image", () => {
  const html = page().replace(
    `name=twitter:image>`,
    `name=twitter:image data-x>`,
  );
  const withDifferent = html.replace(
    /<meta content="[^"]*" name=twitter:image data-x>/,
    `<meta content="${BASE}/images/og/jiny.jpg" name=twitter:image>`,
  );
  const { errors } = run({ "a/index.html": withDifferent });
  assert.match(errors.join("\n"), /twitter:image .* != og:image/);
});

test("překročení limitu délky z seo.toml shodí bránu", () => {
  const long = "x".repeat(31);
  const { errors } = run({ "a/index.html": page({ title: long, ldName: long }) });
  assert.match(errors.join("\n"), /og:title má 31 znaků, maximum z data\/seo\.toml je 30/);
});

test("rozpor og:title vs. JSON-LD name shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ ldName: "Něco jiného" }) });
  assert.match(errors.join("\n"), /og:title .* != JSON-LD name/);
});

test("rozpor og:description vs. JSON-LD description shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ ldDescription: "Jiný popis." }) });
  assert.match(errors.join("\n"), /og:description .* != JSON-LD description/);
});

test("stránka bez JSON-LD uzlu shodí bránu (není proti čemu ověřovat)", () => {
  const html = page().replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "");
  const { errors } = run({ "a/index.html": html });
  assert.match(errors.join("\n"), /nemá stránkový uzel JSON-LD/);
});

test("twitter:title se musí shodovat s og:title", () => {
  const html = page().replace(/<meta content="[^"]*" name=twitter:title>/, `<meta content="Jiný titulek" name=twitter:title>`);
  const { errors } = run({ "a/index.html": html });
  assert.match(errors.join("\n"), /twitter:title .* != og:title/);
});

test("twitter:description se musí shodovat s og:description", () => {
  const html = page().replace(
    /<meta content="[^"]*" name=twitter:description>/,
    `<meta content="Jiný popis." name=twitter:description>`,
  );
  const { errors } = run({ "a/index.html": html });
  assert.match(errors.join("\n"), /twitter:description != og:description/);
});

test("typ karty musí odpovídat tomu, zda jde obrázek", () => {
  const { errors } = run({ "a/index.html": page({ card: "summary" }) });
  assert.match(errors.join("\n"), /twitter:card "summary" neodpovídá stavu obrázku/);
});

test("og:type mimo slovník seo.page_types shodí bránu", () => {
  const { errors } = run({ "a/index.html": page({ ogType: "vymyslenytyp" }) });
  assert.match(errors.join("\n"), /není deklarován v žádném seo\.page_types/);
});

test("og:locale musí být language_TERRITORY, ne holý jazykový kód", () => {
  const { errors } = run({ "a/index.html": page({ locale: "cs" }) });
  assert.match(errors.join("\n"), /není ve tvaru language_TERRITORY/);
});

test("přesměrovací stub aliasu je vyjmutý (stejná výjimka jako verify-jsonld)", () => {
  const stub = `<!doctype html><html><head><meta http-equiv="refresh" content="0; url=${BASE}/a/"><title>Redirect</title></head><body></body></html>`;
  const { errors, pages, redirectStubs } = run({ "a/index.html": page(), "stary/index.html": stub });
  assert.deepEqual(errors, []);
  assert.equal(pages, 1);
  assert.equal(redirectStubs, 1);
});

test("record_type bez záznamu v seo.page_types shodí bránu", () => {
  const { errors } = run({ "a/index.html": page() }, { contentFrontMatter: ['record_type = "novytyp"'] });
  assert.match(errors.join("\n"), /chybí \[page_types\."novytyp"\]/);
});

test("mrtvý typ stránky v seo.page_types shodí bránu", () => {
  const { errors } = run(
    { "a/index.html": page() },
    { seoToml: SEO_TOML + '\n[page_types.mrtvy]\nog_type = "website"\nseo_type = "WebPage"\n' },
  );
  assert.match(errors.join("\n"), /\[page_types\."mrtvy"\] není v content\/\*\* použitý/);
});

test("dossier se rozlišuje podle dossier_type (dossier.entity vs. dossier.aggregate)", () => {
  const { errors } = run(
    { "a/index.html": page() },
    {
      contentFrontMatter: ['record_type = "claim"', 'record_type = "dossier"\ndossier_type = "entity"'],
      seoToml: SEO_TOML,
    },
  );
  assert.match(errors.join("\n"), /chybí \[page_types\."dossier\.entity"\]/);
});

// --- parsovací primitiva ---------------------------------------------------

test('atribut se znakem ">" uvnitř uvozovek se nesmí rozbít', () => {
  // Reálný případ: titulek „platby firem skupiny za reklamu >270 mil. Kč".
  // Naivní <meta[^>]+> tag NENAJDE a ohlásí chybějící značku, která tam je.
  const html = `<meta content="reklama >270 mil. Kč" property=og:title><meta content="x" property=og:type>`;
  const meta = extractMeta(html);
  assert.equal(meta.get("og:title"), "reklama >270 mil. Kč");
  assert.equal(meta.get("og:type"), "x");
});

test("minifikovaný zápis: neuvozované hodnoty a přeházené pořadí atributů", () => {
  const meta = extractMeta(`<meta content=article property=og:type><meta property=og:locale content=cs_CZ>`);
  assert.equal(meta.get("og:type"), "article");
  assert.equal(meta.get("og:locale"), "cs_CZ");
});

test("HTML entity se dekódují před porovnáním s JSON-LD", () => {
  assert.equal(decodeEntities("a &amp; b &quot;c&quot; &#39;d&#39; &#x2014;"), "a & b \"c\" 'd' —");
  const meta = extractMeta(`<meta content="a &amp; b" property=og:title>`);
  assert.equal(meta.get("og:title"), "a & b");
});

test("kanonický odkaz a stránkový uzel se čtou i z minifikovaného HTML", () => {
  assert.equal(extractCanonical(`<link href=https://x/ rel=canonical>`), "https://x/");
  assert.equal(extractCanonical(`<link rel=icon href=/f.svg>`), null);
  const node = extractPageNode(
    `<script type=application/ld+json>{"@graph":[{"@type":"WebPage","name":"N"}]}</script>`,
  );
  assert.equal(node.name, "N");
});

// --- zapojení do pipeline --------------------------------------------------

test("verify:og běží v build pipeline až po zola build", async () => {
  const { MODES } = await import("./pipeline.mjs");
  const steps = MODES.build;
  const zolaIdx = steps.findIndex((s) => typeof s !== "string" && s.raw.includes("zola"));
  const ogIdx = steps.indexOf("verify:og");
  assert.ok(ogIdx !== -1, "build pipeline musí obsahovat verify:og");
  assert.ok(ogIdx > zolaIdx, "verify:og kontroluje vydané HTML, musí běžet po zola build");
  const pkg = JSON.parse(
    (await import("node:fs")).readFileSync(join(REAL_ROOT, "package.json"), "utf8"),
  );
  assert.equal(pkg.scripts["verify:og"], "node scripts/build/verify-og.mjs");
});
