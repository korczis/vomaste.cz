// Testy detektoru zdrojových rodin (scripts/osint/detect-source-family.mjs).
//
// Žádný test nesahá na síť ani na reálná data/dossiers/**: HTML se
// podstrkuje jako fixture, kandidáti a zápisy přes TEMP adresář, síť přes
// injektovaný fetch. Fixtures jsou zkrácené, ale TVAROVĚ VĚRNÉ výřezy
// skutečných stránek, které rozhodly revizi T-056 — proto jsou v nich
// zachované i detaily jako dvojí <meta name="author"> u Blesku nebo
// prázdná class u sigla-podpisu Respektu.
//
// Nejdůležitější testy tu nejsou ty na detekci, ale ty na ZDRŽENLIVOST:
// zmínka „řekl ČTK“ v textu nesmí vyrobit rodinu a --apply nesmí nikdy
// přepsat existující hodnotu. Chybná detekce se dá opravit; tiše
// přepsané kurátorské rozhodnutí se nepozná.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  detectFamily,
  looksLikePersonName,
  decodeBody,
  decodeEntities,
  metaAuthors,
  jsonLdAuthors,
  bylineTexts,
  siglaBylines,
  creditFooters,
  loadCandidates,
  applyProposals,
  assertWritablePath,
  isPhotoCredit,
  fetchHtml,
  detectAll,
  summarize,
  renderMarkdown,
  writeOutputs,
  ORIGIN_MARKERS,
} from "./detect-source-family.mjs";

// --- fixtures --------------------------------------------------------------

const page = (body, head = "") => `<!doctype html><html><head><meta charset="utf-8">${head}</head><body>${body}</body></html>`;

const ARTICLE_BODY = `<div class="article"><p>Vrchní soud v Praze zrušil zprošťující rozsudek. Předseda senátu to řekl ČTK po jednání.</p></div>`;

function tempTree() {
  const root = mkdtempSync(join(tmpdir(), "detect-source-family-"));
  const write = (dossier, id, record) => {
    const dir = join(root, "data", "dossiers", dossier, "sources");
    mkdirSync(dir, { recursive: true });
    const path = join(dir, `${id.toLowerCase()}.json`);
    writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
    return path;
  };
  return { root, write, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const source = (overrides = {}) => ({
  recordType: "source",
  identifier: "SRC-01",
  title: "SRC-01 — zdroj",
  outlet: "Blesk.cz",
  sourceType: "zpravodajství",
  url: "https://example.test/a",
  retrieved: "2026-08-05",
  order: 1,
  ...overrides,
});

// --- signál 1: strojová metadata autora ------------------------------------

test("meta name=author s ČTK ⇒ verdikt ctk (ČT24, Blesk.cz)", () => {
  const html = page(
    ARTICLE_BODY,
    `<meta name="author" content="CZECH NEWS CENTER a. s."><meta name="author" content="ČTK">`,
  );
  const result = detectFamily(html, { outlet: "Blesk.cz" });
  assert.equal(result.verdict, "ctk");
  assert.equal(result.family, "ctk");
  assert.match(result.evidence, /ČTK/);
  assert.equal(result.confidence, "high");
});

test("meta autorů se čtou VŠECHNY, ne první — vydavatel v prvním nesmí zastínit agenturu ve druhém", () => {
  const authors = metaAuthors(
    `<meta name="author" content="CZECH NEWS CENTER a. s."><meta property="article:author" content="ČTK">`,
  );
  assert.equal(authors.length, 2);
  assert.deepEqual(authors.map((a) => a.value), ["CZECH NEWS CENTER a. s.", "ČTK"]);
});

// --- signál 2: JSON-LD -----------------------------------------------------

test("JSON-LD author s ČTK ⇒ ctk (Česká justice)", () => {
  const html = page(
    ARTICLE_BODY,
    `<script type="application/ld+json">{"@type":"NewsArticle","author":{"name":"ČTK"},"headline":"Soud"}</script>`,
  );
  assert.equal(detectFamily(html).verdict, "ctk");
});

test("JSON-LD pole autorů: jmenovitý redaktor + ČTK ⇒ ctk, ne own (Sport.cz „Martin Kézr, ČTK“)", () => {
  const html = page(
    ARTICLE_BODY,
    `<script type="application/ld+json">{"@type":"NewsArticle","author":[{"@type":"Person","name":"Martin Kézr"},{"@type":"Person","name":"ČTK"}]}</script>`,
  );
  const result = detectFamily(html);
  assert.equal(result.verdict, "ctk", "agenturní značka v podpisu má přednost před jménem redaktora");
});

test("rozbité JSON-LD nezhavaruje a nechá platit ostatní signály", () => {
  const html = page(
    ARTICLE_BODY,
    `<script type="application/ld+json">{tohle není JSON</script><meta name="author" content="ČTK">`,
  );
  assert.deepEqual(jsonLdAuthors(html), []);
  assert.equal(detectFamily(html).verdict, "ctk");
});

// --- signál 3: viditelná byline --------------------------------------------

for (const [label, byline] of [
  ["Echo24, čtk", `<a rel="author" href="/author/echo24">Echo24</a>, <a rel="author" href="/author/ctk">čtk</a>`],
  ["ČTK,red", `<span class="author">ČTK,red</span>`],
  ["ČTK, jas", `<span class="article-author">ČTK, jas</span>`],
  ["Martin Kézr, ČTK", `<div class="byline">Martin Kézr, ČTK</div>`],
  ["Redakce + ČTK", `<div class="autor">Redakce + ČTK</div>`],
]) {
  test(`viditelná byline „${label}“ ⇒ ctk`, () => {
    const result = detectFamily(page(`${byline}${ARTICLE_BODY}`), { outlet: "Echo24" });
    assert.equal(result.verdict, "ctk", `byline „${label}“ se nerozpoznala`);
    assert.ok(result.evidence, "verdikt bez doslovné evidence nesmí vzniknout");
  });
}

test("podpisový element delší než 200 znaků není podpis, ale odstavec textu", () => {
  const long = "x".repeat(250);
  assert.deepEqual(bylineTexts(`<div class="author">${long}</div>`), []);
});

// --- signál 4: sigla-podpis a patička --------------------------------------

test("sigla-podpis „čtk, tb“ v samostatném odstavci ⇒ ctk (Respekt, informační servis)", () => {
  const html = page(`${ARTICLE_BODY}<p class="">čtk, tb</p>`);
  const result = detectFamily(html, { outlet: "Respekt" });
  assert.equal(result.verdict, "ctk");
  assert.match(result.evidence, /čtk, tb/);
});

test("sigla-podpis bez agenturní zkratky se ignoruje — krátký odstavec není důkaz", () => {
  assert.deepEqual(siglaBylines(`<p>red, tb</p><p>Domácí</p>`), []);
});

for (const [label, mark] of [
  ["(čtk)", `<p>Text odstavce. (čtk)</p>`],
  ["–ČTK/RED–", `<p>Text odstavce. –ČTK/RED–</p>`],
  ["- ČTK -", `<p>Text odstavce. - ČTK -</p>`],
]) {
  test(`agenturní značka „${label}“ v textu ⇒ ctk`, () => {
    const result = detectFamily(page(`${ARTICLE_BODY}${mark}`), { outlet: "Deník.cz" });
    assert.equal(result.verdict, "ctk", `značka „${label}“ se nerozpoznala`);
  });
}

test("patička „Zdroj: ČTK“ přebije jmenovitého autora v metadatech (Advokátní deník)", () => {
  const html = page(
    `${ARTICLE_BODY}<p><em>Zdroj: ČTK<br /></em><em>Foto: pixabay.com</em></p>`,
    `<meta name="author" content="Ivana Sýkorová" />`,
  );
  const result = detectFamily(html, { outlet: "Advokátní deník" });
  assert.equal(result.verdict, "ctk", "agenturní kredit má přednost před jménem redaktorky, která zprávu jen zpracovala");
  assert.match(result.evidence, /Zdroj: ČTK/);
});

test("odkaz na autorský rozcestník /author/ctk/ ⇒ ctk (Ekonomický deník, Romea.cz)", () => {
  const html = page(
    `<div class="head"><a href="https://ekonomickydenik.cz/author/redakce/"><span>Redakce</span></a>` +
      `<a href="https://ekonomickydenik.cz/author/ctk/"><span>ČTK</span></a></div>${ARTICLE_BODY}`,
  );
  const result = detectFamily(html, { outlet: "Ekonomický deník" });
  assert.equal(result.verdict, "ctk");
});

test("popisek a hodnota v oddělených elementech se přečtou taky (Tiscali.cz)", () => {
  const html = page(
    `${ARTICLE_BODY}<div class="row"><div class="col"><small class="pr-1">Zdroje:</small></div>` +
      `<div class="col pl-0"><a href="http://www.ctk.cz" title="ČTK">ČTK</a></div></div>`,
  );
  assert.equal(detectFamily(html, { outlet: "Tiscali.cz" }).verdict, "ctk");
});

// --- fotografický kredit není kredit textu ---------------------------------

for (const credit of ["ČTK/Petr Švancara", "ČTK / Šálek Václav", "ČTK, Kamaryt Michal, Profimedia", "ČTK, Profimedia"]) {
  test(`fotokredit „${credit}“ rodinu NEVYROBÍ — snímek z agentury není agenturní text`, () => {
    assert.equal(isPhotoCredit(credit), true);
    const html = page(`${ARTICLE_BODY}<figcaption>Zdroj: ${credit}</figcaption>`, `<meta name="author" content="Jana Nováková">`);
    assert.notEqual(detectFamily(html, { outlet: "Investigace.cz" }).verdict, "ctk");
  });
}

test("kredit „Zdroj: ČTK/ČT24“ fotokredit NENÍ — za lomítkem stojí médium, ne fotograf", () => {
  assert.equal(isPhotoCredit("ČTK/ČT24"), false);
  assert.equal(detectFamily(page(`${ARTICLE_BODY}<p>Zdroj: ČTK/ČT24</p>`), { outlet: "ČT24" }).verdict, "ctk");
});

test("agenturní značka s fotobankou se ignoruje — „(Profimedia, Enex, Reuters, ČTK)“ je kredit fotky", () => {
  const html = page(`${ARTICLE_BODY}<p>Text. (Profimedia, Enex, Reuters, ČTK)</p>`, `<meta name="author" content="Jana Nováková">`);
  assert.equal(detectFamily(html, { outlet: "TN.cz" }).verdict, "own");
});

test("popisek fotky v JSON-LD se nepočítá jako text stránky", () => {
  const html = page(
    `<p>Text bez podpisu.</p>`,
    `<script type="application/ld+json">{"@type":"NewsArticle","image":{"caption":"Zdroj: ČTK"}}</script>`,
  );
  assert.equal(detectFamily(html, { outlet: "ČT24" }).verdict, "unknown");
});

// --- widget „nejčtenější autoři" není podpis článku ------------------------

test("autorské rozcestníky se berou jen první tři — widget cizích autorů není kredit (Seznam Zprávy)", () => {
  const links = ["vojtech-blazek-172", "barbora-kucerova-924", "barbora-doubravova-1788", "reuters-1799", "ctk-74"]
    .map((slug) => `<a href="https://www.seznamzpravy.cz/autor/${slug}">x</a>`)
    .join("");
  const credits = creditFooters(links);
  assert.deepEqual(credits.map((c) => c.evidence), [
    "odkaz na autorský rozcestník /vojtech-blazek-172/",
    "odkaz na autorský rozcestník /barbora-kucerova-924/",
    "odkaz na autorský rozcestník /barbora-doubravova-1788/",
  ]);
  const html = page(
    `${ARTICLE_BODY}${links}`,
    `<script type="application/ld+json">{"@type":"NewsArticle","author":{"@type":"Person","name":"Vojtěch Blažek"}}</script>`,
  );
  assert.equal(detectFamily(html, { outlet: "Seznam Zprávy" }).verdict, "own");
});

test("autorský rozcestník ČTK na prvním místě podpis JE (Seznam Zprávy, agenturní zpráva)", () => {
  const links = ["ctk-74", "barbora-kucerova-924", "reuters-1799"]
    .map((slug) => `<a href="https://www.seznamzpravy.cz/autor/${slug}">x</a>`)
    .join("");
  assert.equal(detectFamily(page(`${ARTICLE_BODY}${links}`), { outlet: "Seznam Zprávy" }).verdict, "ctk");
});

test("autorský rozcestník se čte i jako čitelné jméno — jmenovitý autor projde testem osoby", () => {
  const credits = creditFooters(`<a href="/autor/tomas-lindner/">T. L.</a>`);
  assert.deepEqual(credits.map((c) => c.text), ["Tomas Lindner"]);
});

// --- zdrženlivost: co NESMÍ vyrobit rodinu ---------------------------------

test("pouhá zmínka „řekl ČTK“ v těle článku rodinu NEVYROBÍ", () => {
  const html = page(ARTICLE_BODY, `<meta name="author" content="Jana Nováková">`);
  const result = detectFamily(html, { outlet: "Deník N" });
  assert.equal(result.verdict, "own", "zmínka agentury v citaci není kredit původu");
});

test("jmenovitý autor bez agenturní značky ⇒ own a rodina se NEVYPLŇUJE", () => {
  const html = page(
    ARTICLE_BODY,
    `<script type="application/ld+json">{"@type":"NewsArticle","author":{"@type":"Person","name":"Lukáš Prchal"}}</script>`,
  );
  const result = detectFamily(html, { outlet: "Deník N" });
  assert.equal(result.verdict, "own");
  assert.equal(result.family, null, "own nikdy nenavrhuje rodinu — fallback na outlet je správný");
  assert.equal(result.confidence, "high");
});

test("stránka bez jakéhokoli podpisu ⇒ unknown, ne own", () => {
  const result = detectFamily(page(`<p>Text bez podpisu.</p>`));
  assert.equal(result.verdict, "unknown");
  assert.equal(result.family, null);
  assert.equal(result.signal, "no-credit");
});

test("nečitelné tělo (403/paywall bez HTML) ⇒ unknown", () => {
  for (const body of ["", "   "]) {
    const result = detectFamily(body);
    assert.equal(result.verdict, "unknown");
    assert.equal(result.family, null);
  }
});

test("nerozhodné kredity (jen jméno vydavatele) ⇒ unknown, ne own", () => {
  const result = detectFamily(page(ARTICLE_BODY, `<meta name="author" content="Hlídač státu z.ú.">`));
  assert.equal(result.verdict, "unknown");
  assert.equal(result.signal, "credits-inconclusive");
});

test("verzálková značka vydavatele není jmenovitý autor (FTV Prima, ROMEA)", () => {
  assert.equal(looksLikePersonName("FTV Prima"), false);
  assert.equal(looksLikePersonName("Hrot24 HG8w7"), false);
  assert.equal(looksLikePersonName("Redakce Ekonomického deníku"), false);
  assert.equal(looksLikePersonName("Lukáš Prchal"), true);
  assert.equal(looksLikePersonName("Natálie Šebestová"), true);
});

test("skripty a styly se do kreditů nepočítají — inline JSON není podpis", () => {
  const html = page(`<script>var author = "ČTK";</script><p>Text.</p>`);
  assert.equal(detectFamily(html).verdict, "unknown");
});

// --- jiné rodiny než ČTK: navrhují se podle PŮVODU, ne podle vydavatele ----

test("přetisk cizí redakce navrhne rodinu podle původu, ne podle vydavatele", () => {
  const html = page(`${ARTICLE_BODY}<p>Zdroj: Seznam Zprávy</p>`);
  const result = detectFamily(html, { outlet: "Blesk.cz" });
  assert.equal(result.verdict, "seznam-zpravy-syndication");
  assert.equal(result.family, "seznam-zpravy-syndication");
});

test("vlastní značka vydavatele v jeho vlastním podpisu není přetisk", () => {
  const html = page(`${ARTICLE_BODY}<p>Zdroj: Seznam Zprávy</p>`);
  const result = detectFamily(html, { outlet: "Seznam Zprávy" });
  assert.notEqual(result.verdict, "seznam-zpravy-syndication");
});

test("holé „AP“ není značka původu — jen plný název Associated Press", () => {
  const ap = ORIGIN_MARKERS.find((m) => m.family === "associated-press");
  assert.equal(ap.match.test("Zdroj: ap"), false);
  assert.equal(ap.match.test("Zdroj: Associated Press"), true);
});

// --- kódování --------------------------------------------------------------

test("windows-1250 se dekóduje podle hlavičky — jinak by „ČTK“ propadlo jako nezjištěné", () => {
  const bytes = Uint8Array.from([0xc8, 0x54, 0x4b]); // "ČTK" ve windows-1250
  assert.equal(decodeBody(bytes, "text/html; charset=windows-1250"), "ČTK");
});

test("kódování se bere i z <meta charset>, když ho hlavička neuvádí", () => {
  const head = Buffer.from('<html><head><meta charset="windows-1250"></head><body>', "latin1");
  const bytes = Uint8Array.from([...head, 0xc8, 0x54, 0x4b]);
  assert.match(decodeBody(bytes, "text/html"), /ČTK$/);
});

test("HTML entity se dekódují, aby &nbsp; nerozbila podpis", () => {
  assert.equal(decodeEntities("Echo24,&nbsp;&#269;tk"), "Echo24, čtk");
});

// --- kandidáti -------------------------------------------------------------

test("kandidáti = jen zdroje s prázdnou rodinou a s URL", () => {
  const tree = tempTree();
  try {
    tree.write("dossier-a", "SRC-01", source({ identifier: "SRC-01" }));
    tree.write("dossier-a", "SRC-02", source({ identifier: "SRC-02", sourceFamily: "ctk" }));
    tree.write("dossier-a", "SRC-03", source({ identifier: "SRC-03", sourceFamily: "   " }));
    const noUrl = source({ identifier: "SRC-04" });
    delete noUrl.url;
    tree.write("dossier-a", "SRC-04", noUrl);
    const candidates = loadCandidates(join(tree.root, "data", "dossiers"));
    assert.deepEqual(candidates.map((c) => c.id), ["SRC-01", "SRC-03"]);
  } finally {
    tree.cleanup();
  }
});

// --- síť -------------------------------------------------------------------

test("HTTP 403 nekončí prázdným tělem, ale přiznaným unknown", async () => {
  const response = await fetchHtml("https://example.test/a", {
    fetchImpl: async () => ({ ok: false, status: 403 }),
    retries: 1,
    sleepImpl: async () => {},
  });
  assert.equal(response.ok, false);
  assert.equal(response.status, 403);
  const proposals = await detectAll([{ dossier: "d", id: "SRC-01", url: "https://example.test/a", outlet: "iROZHLAS.cz" }], {
    fetchImpl: async () => ({ ok: false, status: 403 }),
    rateLimitMs: 0,
    sleepImpl: async () => {},
  });
  assert.equal(proposals[0].verdict, "unknown");
  assert.equal(proposals[0].httpStatus, 403);
  assert.match(proposals[0].signal, /403/);
});

test("síťová chyba se zopakuje právě jednou", async () => {
  let calls = 0;
  const response = await fetchHtml("https://example.test/a", {
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new Error("ECONNRESET");
      return { ok: true, status: 200, headers: { get: () => "text/html; charset=utf-8" }, arrayBuffer: async () => Buffer.from(page(ARTICLE_BODY, `<meta name="author" content="ČTK">`)) };
    },
    retries: 1,
    sleepImpl: async () => {},
  });
  assert.equal(calls, 2);
  assert.equal(response.ok, true);
  assert.equal(detectFamily(response.html).verdict, "ctk");
});

test("trvalá síťová chyba po retry ⇒ unknown s důvodem, nikdy ne own", async () => {
  const response = await fetchHtml("https://example.test/a", {
    fetchImpl: async () => {
      throw new Error("ETIMEDOUT");
    },
    retries: 1,
    sleepImpl: async () => {},
  });
  assert.equal(response.ok, false);
  assert.match(response.error, /ETIMEDOUT/);
});

test("rate limit se dodržuje mezi požadavky", async () => {
  const waits = [];
  await detectAll(
    [
      { dossier: "d", id: "SRC-01", url: "https://example.test/1", outlet: null },
      { dossier: "d", id: "SRC-02", url: "https://example.test/2", outlet: null },
    ],
    {
      fetchImpl: async () => ({ ok: true, status: 200, headers: { get: () => "text/html" }, arrayBuffer: async () => Buffer.from(page(ARTICLE_BODY)) }),
      rateLimitMs: 600,
      sleepImpl: async (ms) => waits.push(ms),
    },
  );
  assert.deepEqual(waits, [600], "mezi dvěma zdroji se čeká právě jednou");
});

// --- zápisové zámky detekčního režimu --------------------------------------

test("detekce nesmí zapsat do kanonických dat ani do content/", () => {
  assert.throws(() => assertWritablePath(join(process.cwd(), "data", "dossiers", "x", "sources", "src-01.json")), /mimo povolené cesty/);
  assert.throws(() => assertWritablePath(join(process.cwd(), "content", "dossiers", "x", "_index.md")), /mimo povolené cesty/);
  assert.doesNotThrow(() => assertWritablePath(join(process.cwd(), "data", "generated", "source-family-proposals.json")));
  assert.doesNotThrow(() => assertWritablePath(join(process.cwd(), "reports", "source-family-proposals.md")));
});

test("writeOutputs vyrobí návrhy i report a NIC nezapíše do dossierů", () => {
  const tree = tempTree();
  try {
    const proposals = [
      { dossier: "d", id: "SRC-01", url: "u", outlet: "Blesk.cz", verdict: "ctk", family: "ctk", evidence: "meta ČTK", confidence: "high", signal: "meta:ČTK", httpStatus: 200 },
      { dossier: "d", id: "SRC-02", url: "u", outlet: "Deník N", verdict: "own", family: null, evidence: "Lukáš Prchal", confidence: "high", signal: "jsonld:Person", httpStatus: 200 },
    ];
    const { jsonPath, mdPath } = writeOutputs(proposals, { generatedAt: "2026-08-05T00:00:00.000Z" }, {
      json: join(tree.root, "proposals.json"),
      md: join(tree.root, "proposals.md"),
    });
    const doc = JSON.parse(readFileSync(jsonPath, "utf8"));
    assert.equal(doc.processed, 2);
    assert.deepEqual(doc.byVerdict, { ctk: 1, own: 1 });
    assert.match(readFileSync(mdPath, "utf8"), /Návrhy zdrojových rodin/);
  } finally {
    tree.cleanup();
  }
});

test("report jmenuje důvod u každého unknown", () => {
  const md = renderMarkdown(
    [{ dossier: "d", id: "SRC-09", url: "u", outlet: "iROZHLAS.cz", verdict: "unknown", family: null, evidence: null, confidence: "none", signal: "fetch-failed: HTTP 403", httpStatus: 403 }],
    { generatedAt: "2026-08-05T00:00:00.000Z" },
  );
  assert.match(md, /fetch-failed: HTTP 403/);
  assert.match(md, /SRC-09/);
});

test("summarize počítá verdikty, ne zdroje", () => {
  const summary = summarize([{ verdict: "ctk" }, { verdict: "ctk" }, { verdict: "own" }, { verdict: "unknown" }]);
  assert.equal(summary.processed, 4);
  assert.deepEqual(summary.byVerdict, { ctk: 2, own: 1, unknown: 1 });
});

// --- --apply ---------------------------------------------------------------

test("--apply zapíše rodinu ctk do prázdného pole a zachová pořadí klíčů", () => {
  const tree = tempTree();
  try {
    const path = tree.write("dossier-a", "SRC-01", source());
    const { written, skipped } = applyProposals(
      [{ dossier: "dossier-a", id: "SRC-01", path, verdict: "ctk", evidence: "meta ČTK" }],
      { root: tree.root },
    );
    assert.equal(written.length, 1);
    assert.equal(skipped.length, 0);
    const record = JSON.parse(readFileSync(path, "utf8"));
    assert.equal(record.sourceFamily, "ctk");
    assert.deepEqual(Object.keys(record).slice(0, 7), [
      "recordType",
      "identifier",
      "title",
      "outlet",
      "sourceFamily",
      "sourceType",
      "url",
    ]);
    assert.ok(readFileSync(path, "utf8").endsWith("}\n"), "soubor končí newlinem jako zbytek datasetu");
  } finally {
    tree.cleanup();
  }
});

test("--apply NIKDY nepřepíše existující rodinu", () => {
  const tree = tempTree();
  try {
    const path = tree.write("dossier-a", "SRC-01", source({ sourceFamily: "seznam-zpravy-syndication" }));
    const before = readFileSync(path, "utf8");
    const { written, skipped } = applyProposals(
      [{ dossier: "dossier-a", id: "SRC-01", path, verdict: "ctk", evidence: "meta ČTK" }],
      { root: tree.root },
    );
    assert.equal(written.length, 0);
    assert.equal(skipped.length, 1);
    assert.match(skipped[0].reason, /už je vyplněná/);
    assert.equal(readFileSync(path, "utf8"), before, "soubor se nesměl změnit ani o bajt");
  } finally {
    tree.cleanup();
  }
});

test("--apply ignoruje own i unknown — rodinu vyplňuje jen doložený agenturní původ", () => {
  const tree = tempTree();
  try {
    const own = tree.write("dossier-a", "SRC-01", source({ identifier: "SRC-01" }));
    const unknown = tree.write("dossier-a", "SRC-02", source({ identifier: "SRC-02" }));
    const { written, skipped } = applyProposals(
      [
        { dossier: "dossier-a", id: "SRC-01", path: own, verdict: "own" },
        { dossier: "dossier-a", id: "SRC-02", path: unknown, verdict: "unknown" },
      ],
      { root: tree.root },
    );
    assert.equal(written.length, 0);
    assert.equal(skipped.length, 2);
    for (const path of [own, unknown]) {
      assert.equal(JSON.parse(readFileSync(path, "utf8")).sourceFamily, undefined);
    }
  } finally {
    tree.cleanup();
  }
});

test("--apply ignoruje i navrženou JINOU rodinu — o té rozhoduje člověk", () => {
  const tree = tempTree();
  try {
    const path = tree.write("dossier-a", "SRC-01", source());
    const { written, skipped } = applyProposals(
      [{ dossier: "dossier-a", id: "SRC-01", path, verdict: "seznam-zpravy-syndication", family: "seznam-zpravy-syndication" }],
      { root: tree.root },
    );
    assert.equal(written.length, 0);
    assert.match(skipped[0].reason, /zapisuje se jen "ctk"/);
    assert.equal(JSON.parse(readFileSync(path, "utf8")).sourceFamily, undefined);
  } finally {
    tree.cleanup();
  }
});

test("--apply --dry-run nezapíše nic, ale plán vrátí", () => {
  const tree = tempTree();
  try {
    const path = tree.write("dossier-a", "SRC-01", source());
    const { written } = applyProposals([{ dossier: "dossier-a", id: "SRC-01", path, verdict: "ctk" }], {
      root: tree.root,
      dryRun: true,
    });
    assert.equal(written.length, 1);
    assert.equal(JSON.parse(readFileSync(path, "utf8")).sourceFamily, undefined);
  } finally {
    tree.cleanup();
  }
});

test("--apply hlásí chybějící soubor, místo aby ho vyrobil", () => {
  const tree = tempTree();
  try {
    const { written, skipped } = applyProposals(
      [{ dossier: "neexistuje", id: "SRC-99", verdict: "ctk" }],
      { root: tree.root },
    );
    assert.equal(written.length, 0);
    assert.match(skipped[0].reason, /neexistuje/);
  } finally {
    tree.cleanup();
  }
});
