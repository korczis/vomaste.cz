// Testy screeningu toku veřejných prostředků (scripts/osint/screen-public-money.mjs).
//
// Žádný test nesahá na síť ani na reálná data/dossiers/** a content/**:
// dumpy se podstrkují jako fixture přes injektovaný fetch, entity přes
// TEMP adresář. Síťové chybové cesty se testují falešným fetchem, protože
// právě ony rozhodují o tom, jestli skript při výpadku raději spadne, než
// aby ohlásil nulový objem.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  parseElement,
  decodeXmlText,
  stripCdata,
  extractRecord,
  zaznamSlices,
  newAccumulator,
  ingestRecord,
  summarize,
  renderMarkdown,
  parseAmount,
  smlouvaPlural,
  parseIcoList,
  parseMonth,
  monthsInRange,
  defaultWindow,
  clampToRegisterStart,
  icosFromEntities,
  assertWritablePath,
  assertDumpParsed,
  downloadDump,
  processMonth,
  writeOutputs,
  JSON_OUT,
  MD_OUT,
  ISRS_DUMP,
} from "./screen-public-money.mjs";

const SCRIPT = new URL("./screen-public-money.mjs", import.meta.url);

// --- fixture ---------------------------------------------------------------

const TARGET = "04449461"; // HYDROPROGRESS, s.r.o.
const OTHER = "01529820"; // MEDIA PROJECT CZ s.r.o.

function zaznam({
  id,
  verze = 1,
  platny = "1",
  withVat = "100000.00",
  withoutVat = null,
  publisherIco = "44992785",
  publisherName = "Statutární město Brno",
  partyIco = TARGET,
  partyName = "HYDROPROGRESS, s.r.o.",
}) {
  return `<zaznam>
  <casZverejneni>2025-03-04T10:00:00</casZverejneni>
  <hashZaznamu><![CDATA[a<b&c]]></hashZaznamu>
  <odkaz>https://smlouvy.gov.cz/smlouva/${id}</odkaz>
  <identifikator><idSmlouvy>${id}</idSmlouvy><idVerze>${verze}</idVerze></identifikator>
  <platnyZaznam>${platny}</platnyZaznam>
  <smlouva>
    <casUzavreni>2025-03-01T00:00:00</casUzavreni>
    <predmet>Oprava vodovodu &amp; kanalizace</predmet>
    ${withVat === null ? "" : `<hodnotaVcetneDph>${withVat}</hodnotaVcetneDph>`}
    ${withoutVat === null ? "" : `<hodnotaBezDph>${withoutVat}</hodnotaBezDph>`}
    <subjekt><nazev>${publisherName}</nazev><ico>${publisherIco}</ico></subjekt>
    <smluvniStrana><nazev>${partyName}</nazev><ico>${partyIco}</ico><prijemce>true</prijemce></smluvniStrana>
  </smlouva>
  <prilohy><priloha><nazevSouboru>smlouva.pdf</nazevSouboru></priloha></prilohy>
</zaznam>`;
}

const dump = (records) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<dump xmlns="http://portal.gov.cz/rejstriky/ISRS/1.2/">
<mesic>3</mesic><rok>2025</rok><casGenerovani>2025-04-01T02:00:00</casGenerovani><dokoncenyMesic>true</dokoncenyMesic>
${records.join("\n")}
</dump>`;

const fetchReturning = (body, { status = 200 } = {}) =>
  async () => new Response(body, { status });

const collect = async (source) => {
  const out = [];
  for await (const slice of source) out.push(slice);
  return out;
};

// --- parsování -------------------------------------------------------------

test("parsuje jeden záznam dumpu na normalizovaný tvar", () => {
  const record = extractRecord(zaznam({ id: "111", verze: 7, withVat: "1234567.00" }));

  assert.equal(record.contractId, "111");
  assert.equal(record.versionId, 7);
  assert.equal(record.valid, true);
  assert.equal(record.amount, 1234567);
  assert.equal(record.amountKind, "sDph");
  assert.equal(record.subject, "Oprava vodovodu & kanalizace", "entity se dekódují");
  assert.deepEqual(record.publisher, { ico: "44992785", name: "Statutární město Brno" });
  assert.deepEqual(record.parties, [{ ico: TARGET, name: "HYDROPROGRESS, s.r.o." }]);
  assert.equal(record.link, "https://smlouvy.gov.cz/smlouva/111");
});

test("CDATA se neplete do tokenizace a nerozbije záznam", () => {
  assert.equal(stripCdata("<a><![CDATA[x<y&z]]></a>"), "<a>x&lt;y&amp;z</a>");
  const record = extractRecord(zaznam({ id: "112" }));
  assert.equal(record.contractId, "112", "'<' uvnitř CDATA nesmí useknout parsování");
});

test("decodeXmlText zvládá pojmenované i číselné entity", () => {
  assert.equal(decodeXmlText("a &amp; b &lt;c&gt; &#65; &#x42;"), "a & b <c> A B");
});

test("<smlouva> se neplete se <smluvniStrana> (shodný prefix)", () => {
  const parsed = parseElement(zaznam({ id: "113" }));
  const smlouva = parsed.zaznam.smlouva;
  assert.ok(smlouva.smluvniStrana, "smluvniStrana musí zůstat potomkem smlouvy");
  assert.equal(smlouva.subjekt.ico, "44992785");
});

test("opakované elementy se sbírají do pole", () => {
  const twoParties = zaznam({ id: "114" }).replace(
    "</smlouva>",
    `<smluvniStrana><nazev>Druhá s.r.o.</nazev><ico>${OTHER}</ico></smluvniStrana></smlouva>`,
  );
  const record = extractRecord(twoParties);
  assert.equal(record.parties.length, 2);
  assert.deepEqual(record.parties.map((p) => p.ico), [TARGET, OTHER]);
});

test("parseAmount: desetinná čárka, mezery, nesmysl", () => {
  assert.equal(parseAmount("1234567.00"), 1234567);
  assert.equal(parseAmount("1 234 567,50"), 1234567.5);
  assert.equal(parseAmount(""), null);
  assert.equal(parseAmount(null), null);
  assert.equal(parseAmount("neuvedeno"), null);
});

test("stream krájí <zaznam> i přes hranice chunků", async () => {
  const xml = dump([zaznam({ id: "1" }), zaznam({ id: "2" }), zaznam({ id: "3" })]);
  // rozsekej na 64B kousky, aby značky padly doprostřed chunku
  const chunks = [];
  for (let i = 0; i < xml.length; i += 64) chunks.push(Buffer.from(xml.slice(i, i + 64), "utf8"));

  const slices = await collect(zaznamSlices(chunks));
  assert.equal(slices.length, 3);
  assert.deepEqual(slices.map((s) => extractRecord(s).contractId), ["1", "2", "3"]);
});

// --- agregace --------------------------------------------------------------

test("agregace sečte částky a seskupí objednatele", () => {
  const acc = newAccumulator([TARGET]);
  for (const slice of [
    zaznam({ id: "1", withVat: "100000.00" }),
    zaznam({ id: "2", withVat: "250000.50" }),
    zaznam({
      id: "3",
      withVat: "40000.00",
      publisherIco: "00064581",
      publisherName: "Ministerstvo dopravy",
    }),
  ]) {
    ingestRecord(acc, extractRecord(slice));
  }

  const summary = summarize(acc, {
    months: [{ year: 2025, month: 3 }],
    checkedAt: "2026-08-03",
    anomalies: { recordsSeen: 3, unparsedRecords: 0 },
  });
  const [result] = summary.results;

  assert.equal(result.contractCount, 3);
  assert.equal(result.totalAmount, 390000.5);
  assert.equal(result.name, "HYDROPROGRESS, s.r.o.");
  assert.equal(result.publishers.length, 2);
  // seřazeno podle objemu sestupně
  assert.deepEqual(
    result.publishers.map((p) => [p.name, p.count, p.amount]),
    [
      ["Statutární město Brno", 2, 350000.5],
      ["Ministerstvo dopravy", 1, 40000],
    ],
  );
});

test("verze téže smlouvy se NEsčítají — drží se jen platná/nejvyšší", () => {
  const acc = newAccumulator([TARGET]);
  // tři zveřejněné verze jedné smlouvy: dodatek zvýšil hodnotu
  ingestRecord(acc, extractRecord(zaznam({ id: "9", verze: 1, platny: "0", withVat: "100000.00" })));
  ingestRecord(acc, extractRecord(zaznam({ id: "9", verze: 2, platny: "0", withVat: "150000.00" })));
  ingestRecord(acc, extractRecord(zaznam({ id: "9", verze: 3, platny: "1", withVat: "180000.00" })));

  const [result] = summarize(acc, {
    months: [{ year: 2025, month: 3 }],
    checkedAt: "2026-08-03",
    anomalies: { recordsSeen: 3, unparsedRecords: 0 },
  }).results;

  assert.equal(result.contractCount, 1, "jedna smlouva, ne tři");
  assert.equal(result.totalAmount, 180000, "platí poslední platná verze");
});

test("smlouva bez uvedené hodnoty se počítá, ale objem je spodní odhad", () => {
  const acc = newAccumulator([TARGET]);
  ingestRecord(acc, extractRecord(zaznam({ id: "1", withVat: "50000.00" })));
  ingestRecord(acc, extractRecord(zaznam({ id: "2", withVat: null })));

  const [result] = summarize(acc, {
    months: [{ year: 2025, month: 3 }],
    checkedAt: "2026-08-03",
    anomalies: { recordsSeen: 2, unparsedRecords: 0 },
  }).results;

  assert.equal(result.contractCount, 2);
  assert.equal(result.totalAmount, 50000);
  assert.equal(result.contractsWithoutAmount, 1);
  assert.match(renderMarkdown({ ...summarizeShell(result) }), /spodní odhad/);
});

test("hodnota bez DPH se použije jen jako záloha a je v reportu rozlišená", () => {
  const acc = newAccumulator([TARGET]);
  ingestRecord(acc, extractRecord(zaznam({ id: "1", withVat: null, withoutVat: "80000.00" })));

  const [result] = summarize(acc, {
    months: [{ year: 2025, month: 3 }],
    checkedAt: "2026-08-03",
    anomalies: { recordsSeen: 1, unparsedRecords: 0 },
  }).results;

  assert.equal(result.totalAmount, 80000);
  assert.deepEqual(result.amountKinds, { sDph: 0, bezDph: 1, neuvedena: 0 });
});

test("IČO v roli zveřejňovatele se nemíchá do objemu přijatých peněz", () => {
  const acc = newAccumulator(["44992785"]); // město = objednatel
  ingestRecord(acc, extractRecord(zaznam({ id: "1", withVat: "100000.00" })));

  const [result] = summarize(acc, {
    months: [{ year: 2025, month: 3 }],
    checkedAt: "2026-08-03",
    anomalies: { recordsSeen: 1, unparsedRecords: 0 },
  }).results;

  assert.equal(result.contractCount, 0, "jako objednatel nepřijímá");
  assert.equal(result.contractsAsPublisher, 1);
  assert.equal(result.totalAmount, 0);
});

function summarizeShell(result) {
  return {
    generator: "test",
    source: "test",
    checkedAt: "2026-08-03",
    coverage: { from: "2025-03", to: "2025-03", months: 1 },
    anomalies: { recordsSeen: 2, unparsedRecords: 0 },
    results: [result],
  };
}

// --- nulový nález ----------------------------------------------------------

test("nulový nález: dump je v pořádku, ale IČO v něm není", async () => {
  const acc = newAccumulator([TARGET]);
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-"));
  try {
    const stats = await processMonth(acc, { year: 2025, month: 3 }, {
      cache: false,
      dir,
      fetchImpl: fetchReturning(dump([zaznam({ id: "1", partyIco: "99999999", partyName: "Někdo jiný" })])),
    });
    assert.equal(stats.seen, 1);
    assert.equal(stats.anomalies, 0);

    const summary = summarize(acc, {
      months: [{ year: 2025, month: 3 }],
      checkedAt: "2026-08-03",
      anomalies: { recordsSeen: 1, unparsedRecords: 0 },
    });
    const [result] = summary.results;
    assert.equal(result.contractCount, 0);
    assert.equal(result.totalAmount, 0);
    assert.deepEqual(result.publishers, []);

    // report musí nulu vysvětlit, ne ji vydávat za zjištění o subjektu
    const md = renderMarkdown(summary);
    assert.match(md, /Počet smluv: \*\*0\*\*/);
    assert.match(md, /To není zjištění o subjektu/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("dump bez jediného <zaznam> je TVRDÁ CHYBA, ne prázdný výsledek", async () => {
  const acc = newAccumulator([TARGET]);
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-"));
  try {
    await assert.rejects(
      processMonth(acc, { year: 2025, month: 3 }, {
        cache: false,
        dir,
        // schéma se posunulo: element se jmenuje jinak
        fetchImpl: fetchReturning("<dump><polozka><ico>04449461</ico></polozka></dump>"),
      }),
      /nebyl nalezen ani jeden element <zaznam>|rozešlo mapování schématu/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("assertDumpParsed vysvětlí, že nula neznamená 'žádné smlouvy'", () => {
  assert.throws(() => assertDumpParsed({ year: 2025, month: 3, seen: 0 }), /neznamená „žádné smlouvy"/);
  assert.doesNotThrow(() => assertDumpParsed({ year: 2025, month: 3, seen: 1 }));
});

// --- chyby sítě ------------------------------------------------------------

test("výpadek sítě: srozumitelná hláška, žádné dopočítávání", async () => {
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-"));
  try {
    await assert.rejects(
      downloadDump(2025, 3, {
        cache: false,
        dir,
        fetchImpl: async () => {
          throw Object.assign(new Error("read ECONNRESET"), { name: "TypeError" });
        },
      }),
      (error) => {
        assert.match(error.message, /nepodařilo se stáhnout/);
        assert.match(error.message, /ECONNRESET/);
        assert.match(error.message, /nedopočítává chybějící měsíc odhadem/);
        return true;
      },
    );
    assert.equal(existsSync(join(dir, "dump_2025_03.xml")), false, "nic se nesmí uložit");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("timeout se hlásí jako timeout, ne jako prázdný měsíc", async () => {
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-"));
  try {
    await assert.rejects(
      downloadDump(2025, 3, {
        cache: false,
        dir,
        fetchImpl: async () => {
          throw Object.assign(new Error("aborted"), { name: "AbortError" });
        },
      }),
      /timeout po \d+ ms/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("HTTP 404 a 5xx mají vlastní, rozlišitelnou hlášku", async () => {
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-"));
  try {
    await assert.rejects(
      downloadDump(2099, 1, { cache: false, dir, fetchImpl: fetchReturning("", { status: 404 }) }),
      /neexistuje \(HTTP 404/,
    );
    await assert.rejects(
      downloadDump(2025, 3, { cache: false, dir, fetchImpl: fetchReturning("", { status: 503 }) }),
      /vrátil HTTP 503/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("stažený dump se cachuje a podruhé se po síti nesahá", async () => {
  const acc = newAccumulator([TARGET]);
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-"));
  try {
    const first = await processMonth(acc, { year: 2025, month: 3 }, {
      cache: true,
      dir,
      fetchImpl: fetchReturning(dump([zaznam({ id: "1" })])),
    });
    assert.equal(first.fromCache, false);

    const second = await processMonth(newAccumulator([TARGET]), { year: 2025, month: 3 }, {
      cache: true,
      dir,
      fetchImpl: async () => {
        throw new Error("síť se neměla použít");
      },
    });
    assert.equal(second.fromCache, true);
    assert.equal(second.seen, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// --- vstupy ----------------------------------------------------------------

test("parseIcoList přijme seznam a odmítne nesmysl", () => {
  assert.deepEqual(parseIcoList("04449461,01529820"), ["04449461", "01529820"]);
  assert.deepEqual(parseIcoList(" 04449461 , 04449461 "), ["04449461"], "duplicity se slévají");
  assert.throws(() => parseIcoList("123"), /8 číslic/);
  assert.throws(() => parseIcoList("04449461,abc"), /abc/);
});

test("--from-external-ids čte externalIds.ico i .ares, jinak nic", () => {
  const dir = mkdtempSync(join(tmpdir(), "screen-pm-ent-"));
  try {
    const entity = (id, externalIds) => {
      const record = { entityId: id, title: id, ...(externalIds ? { externalIds } : {}) };
      writeFileSync(join(dir, `${id}.json`), JSON.stringify(record), "utf8");
    };
    entity("a", { ico: "04449461" });
    entity("b", { ares: "01529820" }); // tvar, který reálně zapisuje expand-entity
    entity("c", null); // bez externalIds — dnešní stav všech entit
    entity("d", { ico: "123" }); // nevalidní, ignoruje se
    writeFileSync(join(dir, "rozbity.json"), "{ not json", "utf8");

    const found = icosFromEntities(dir);
    assert.deepEqual(found.map((f) => f.ico).sort(), ["01529820", "04449461"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("dnešní kanonické entity dávají jen validní IČO (dnes žádné)", () => {
  const found = icosFromEntities();
  assert.ok(Array.isArray(found));
  for (const f of found) assert.match(f.ico, /^\d{8}$/);
});

test("chybějící adresář entit není pád", () => {
  assert.deepEqual(icosFromEntities(join(tmpdir(), "neexistuje-screen-pm")), []);
});

// --- období ----------------------------------------------------------------

test("období: parsování, rozsah, výchozí okno, ořez na start registru", () => {
  assert.deepEqual(parseMonth("2025-03", "--from"), { year: 2025, month: 3 });
  assert.throws(() => parseMonth("2025-13", "--from"), /mimo rozsah/);
  assert.throws(() => parseMonth("bře 2025", "--from"), /RRRR-MM/);

  assert.equal(monthsInRange({ year: 2025, month: 11 }, { year: 2026, month: 2 }).length, 4);
  assert.deepEqual(monthsInRange({ year: 2025, month: 12 }, { year: 2026, month: 1 }), [
    { year: 2025, month: 12 },
    { year: 2026, month: 1 },
  ]);
  assert.throws(() => monthsInRange({ year: 2026, month: 5 }, { year: 2026, month: 1 }), /--from je až za --to/);

  // výchozí okno končí posledním DOKONČENÝM měsícem
  const w = defaultWindow(new Date(Date.UTC(2026, 7, 3))); // srpen 2026
  assert.deepEqual(w.to, { year: 2026, month: 7 });
  assert.deepEqual(w.from, { year: 2025, month: 8 });
  assert.equal(monthsInRange(w.from, w.to).length, 12);

  // přelom roku
  const jan = defaultWindow(new Date(Date.UTC(2026, 0, 15)));
  assert.deepEqual(jan.to, { year: 2025, month: 12 });

  // registr běží od 7/2016
  assert.deepEqual(clampToRegisterStart({ year: 2010, month: 1 }), { year: 2016, month: 7 });
  assert.deepEqual(clampToRegisterStart({ year: 2020, month: 5 }), { year: 2020, month: 5 });
});

// --- report ----------------------------------------------------------------

test("report nese všechny povinné výhrady v hlavičce", () => {
  const acc = newAccumulator([TARGET]);
  ingestRecord(acc, extractRecord(zaznam({ id: "1" })));
  const md = renderMarkdown(
    summarize(acc, {
      months: [{ year: 2025, month: 3 }],
      checkedAt: "2026-08-03",
      anomalies: { recordsSeen: 1, unparsedRecords: 0 },
    }),
  );

  assert.match(md, /Evidenční přehled, ne obvinění/);
  assert.match(md, /sama o sobě nedokládá žádné pochybení/);
  assert.match(md, /není autorizační rozhodnutí/);
  assert.match(md, /Datum kontroly: \*\*2026-08-03\*\*/);
  assert.match(md, /HYDROPROGRESS, s\.r\.o\./);
  assert.match(md, /Objednatelé/);
  assert.match(md, /Statutární město Brno/);
});

test("česká shoda u počtu smluv bez hodnoty", () => {
  assert.equal(smlouvaPlural(1), "1 smlouva nemá");
  assert.equal(smlouvaPlural(2), "2 smlouvy nemají");
  assert.equal(smlouvaPlural(4), "4 smlouvy nemají");
  assert.equal(smlouvaPlural(5), "5 smluv nemá");
  assert.equal(smlouvaPlural(11), "11 smluv nemá");
});

test("prázdný vstup vyrobí report, který to řekne", () => {
  const md = renderMarkdown({
    generator: "test",
    source: "test",
    checkedAt: "2026-08-03",
    coverage: { from: null, to: null, months: 0 },
    anomalies: { recordsSeen: 0, unparsedRecords: 0 },
    results: [],
  });
  assert.match(md, /Žádné vstupy/);
});

// --- statický gate: kam smí skript zapisovat -------------------------------

test("assertWritablePath odmítne content/ i data/dossiers/", () => {
  const root = new URL("../../", import.meta.url).pathname;

  for (const forbidden of [
    join(root, "content/dossiers/babis/index.md"),
    join(root, "content/entities/x.md"),
    join(root, "data/dossiers/_shared/entities/x.json"),
    join(root, "data/dossiers/babis/claims/clm-1.json"),
    join(root, "AGENTS.md"),
    join(root, "data/authorizations.toml"),
  ]) {
    assert.throws(
      () => assertWritablePath(forbidden),
      /zápis mimo povolené cesty odmítnut/,
      `musí odmítnout ${forbidden}`,
    );
  }

  for (const allowed of [JSON_OUT, MD_OUT, join(root, ".tmp/public-money/dump_2025_03.xml")]) {
    assert.doesNotThrow(() => assertWritablePath(allowed), `musí povolit ${allowed}`);
  }

  // Strážce hlídá integritu repozitáře, ne obecný filesystem — cesta mimo
  // repo (dočasný adresář testu) projde záměrně.
  assert.doesNotThrow(() => assertWritablePath(join(tmpdir(), "screen-pm", "dump.xml")));
});

test("writeOutputs nezapíše do content/ ani do dossierů", () => {
  const root = new URL("../../", import.meta.url).pathname;
  const summary = {
    generator: "t",
    source: "t",
    checkedAt: "2026-08-03",
    coverage: { from: "2025-03", to: "2025-03", months: 1 },
    anomalies: { recordsSeen: 0, unparsedRecords: 0 },
    results: [],
  };
  assert.throws(
    () => writeOutputs(summary, { jsonOut: join(root, "content/x.json"), mdOut: MD_OUT }),
    /zápis mimo povolené cesty/,
  );
  assert.throws(
    () => writeOutputs(summary, { jsonOut: JSON_OUT, mdOut: join(root, "data/dossiers/x.md") }),
    /zápis mimo povolené cesty/,
  );
});

test("výchozí výstupy míří mimo content/ a mimo kanonická data", () => {
  assert.match(JSON_OUT, /data\/generated\/public-money-screening\.json$/);
  assert.match(MD_OUT, /reports\/public-money-screening\.md$/);
  for (const out of [JSON_OUT, MD_OUT]) {
    assert.ok(!out.includes("/content/"), "výstup nesmí být v content/");
    assert.ok(!out.includes("/data/dossiers/"), "výstup nesmí být v data/dossiers/");
  }
});

test("statický gate: žádné volání zápisu do content/ ani data/dossiers/", () => {
  const source = readFileSync(SCRIPT, "utf8");
  const writeCalls = [
    ...source.matchAll(
      /\b(writeFileSync|appendFileSync|createWriteStream|renameSync|rmSync|cpSync|mkdirSync|writeFile|unlinkSync)\s*\(([^;]*?)\)/g,
    ),
  ];
  assert.ok(writeCalls.length > 0, "gate musí něco kontrolovat");

  for (const [whole, fn, args] of writeCalls) {
    assert.ok(
      !/content\/|data\/dossiers|authorizations\.toml|AGENTS\.md/.test(args),
      `zápisové volání ${fn}(${args.trim()}) míří do zakázané oblasti:\n${whole}`,
    );
  }

  // ENTITIES_DIR (data/dossiers/...) smí existovat jen pro ČTENÍ
  assert.match(source, /const ENTITIES_DIR = join\(ROOT, "data", "dossiers"/);
  assert.ok(
    !/writeFileSync\([^)]*ENTITIES_DIR/.test(source),
    "do adresáře entit se nikdy nezapisuje",
  );
});

test("mapování schématu registru žije na jednom místě", () => {
  // Kdyby se názvy elementů rozlezly po parseru, oprava po změně schématu
  // by byla archeologie. Test drží kontrakt "jedno místo".
  assert.equal(ISRS_DUMP.record, "zaznam");
  assert.equal(ISRS_DUMP.publisher, "subjekt");
  assert.equal(ISRS_DUMP.party, "smluvniStrana");
  const source = readFileSync(SCRIPT, "utf8");
  const body = source.slice(source.indexOf("export const ISRS_DUMP"));
  const afterMapping = body.slice(body.indexOf("};"));
  assert.ok(
    !/"smluvniStrana"|"hodnotaVcetneDph"|"platnyZaznam"/.test(afterMapping),
    "názvy elementů se nesmí opakovat mimo ISRS_DUMP",
  );
});
