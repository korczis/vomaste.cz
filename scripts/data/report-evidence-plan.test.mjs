// Testy evidenčního plánu (report-evidence-plan.mjs).
//
// Fixtury jsou syntetické in-memory modely stejného tvaru, jaký vrací
// loadCanonicalTree — testuje se tedy přesně to, co v produkci čte
// buildEvidencePlan, ale bez závislosti na reálném obsahu dossierů (ten
// se mění a testy by pak měřily redakci, ne kód).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildEvidencePlan,
  renderMarkdown,
  bandFor,
  dataHorizon,
  parseArgs,
  RISK_WEIGHTS,
  DEFAULT_STALE_DAYS,
} from "./report-evidence-plan.mjs";
import { compileDataset } from "./compile.mjs";

const CONTEXT = "https://vomaste.cz/context/v1.jsonld";
const idOf = (slug, registry, id) =>
  registry === "dossier"
    ? `https://vomaste.cz/id/dossiers/${slug}`
    : `https://vomaste.cz/id/dossiers/${slug}/${registry}/${id}`;

const ref = (slug, registry, id) => ({ "@id": idOf(slug, registry, id) });

const STATUS_VOCABULARY = {
  relPath: "_shared/vocabularies/claim-statuses.json",
  data: {
    id: "claim-statuses",
    values: [
      { value: "status-corroborated", label: "CORROBORATED" },
      { value: "status-single", label: "1 ZDROJ" },
      { value: "status-quote", label: "CITACE" },
      { value: "status-disputed", label: "SPORNÉ" },
    ],
  },
};

/*
 * makeModel({ slug, title, updated, claims, sources, gaps, cases, relations })
 * — jeden dossier; více dossierů se skládá mergeModels().
 *   claims:    [{ id, status, sources: [srcId] }]
 *   sources:   [{ id, outlet, url, sourceFamily }]
 *   gaps:      [{ id, priority, checked, status }]
 */
function makeModel({ slug, title = slug, updated = "2026-01-01", reviewedAt, dossierType = "entity", canonicalDossier, claims = [], sources = [], gaps = [], cases = [], relations = [] }) {
  const wrap = (record, registry, id) => ({
    record,
    relPath: `${slug}/${registry === "dossier" ? "dossier.json" : `${registry}/${String(id).toLowerCase()}.json`}`,
    dossier: slug,
    registry,
  });
  const records = [
    wrap(
      {
        "@context": CONTEXT,
        "@id": idOf(slug, "dossier"),
        recordType: "dossier",
        identifier: slug,
        slug,
        title,
        dossierType,
        ...(canonicalDossier ? { canonicalDossier } : {}),
        updated,
        ...(reviewedAt ? { reviewedAt } : {}),
      },
      "dossier",
      slug,
    ),
  ];
  for (const c of claims) {
    records.push(
      wrap(
        {
          "@context": CONTEXT,
          "@id": idOf(slug, "claims", c.id),
          recordType: "claim",
          identifier: c.id,
          text: `text ${c.id}`,
          status: c.status,
          sources: (c.sources ?? []).map((s) => ref(slug, "sources", s)),
        },
        "claims",
        c.id,
      ),
    );
  }
  for (const s of sources) {
    records.push(
      wrap(
        {
          "@context": CONTEXT,
          "@id": idOf(slug, "sources", s.id),
          recordType: "source",
          identifier: s.id,
          title: s.id,
          outlet: s.outlet ?? null,
          url: s.url ?? `https://${s.id.toLowerCase()}.example/${slug}`,
          retrieved: s.retrieved ?? "2026-01-01",
          ...(s.sourceFamily !== undefined ? { sourceFamily: s.sourceFamily } : {}),
        },
        "sources",
        s.id,
      ),
    );
  }
  for (const g of gaps) {
    records.push(
      wrap(
        {
          "@context": CONTEXT,
          "@id": idOf(slug, "gaps", g.id),
          recordType: "gap",
          identifier: g.id,
          title: g.id,
          priority: g.priority ?? "střední",
          checked: g.checked ?? "2026-01-01",
          ...(g.status ? { status: g.status } : {}),
        },
        "gaps",
        g.id,
      ),
    );
  }
  for (const c of cases) {
    records.push(
      wrap({ "@context": CONTEXT, "@id": idOf(slug, "cases", c), recordType: "case", identifier: c, title: c }, "cases", c),
    );
  }
  for (const r of relations) {
    records.push(
      wrap(
        {
          "@context": CONTEXT,
          "@id": idOf(slug, "relations", r),
          recordType: "relation",
          identifier: r,
          sourceEntity: { "@id": "https://vomaste.cz/id/entities/a" },
          targetEntity: { "@id": "https://vomaste.cz/id/entities/b" },
        },
        "relations",
        r,
      ),
    );
  }
  return {
    root: "/fixture",
    dossiers: [{ slug, rootDir: `/fixture/${slug}`, wrapper: records[0] }],
    records,
    entities: [],
    vocabularies: [STATUS_VOCABULARY],
  };
}

const mergeModels = (...models) => ({
  root: "/fixture",
  dossiers: models.flatMap((m) => m.dossiers),
  records: models.flatMap((m) => m.records),
  entities: [],
  vocabularies: [STATUS_VOCABULARY],
});

const bySlug = (plan, slug) => plan.dossiers.find((d) => d.slug === slug);

// --- počítání stavů --------------------------------------------------------

test("počítá deklarované stavy tvrzení podle slovníku, v jeho pořadí", () => {
  const model = makeModel({
    slug: "a",
    sources: [{ id: "SRC-01", outlet: "X" }],
    claims: [
      { id: "CLM-01", status: "status-quote", sources: ["SRC-01"] },
      { id: "CLM-02", status: "status-single", sources: ["SRC-01"] },
      { id: "CLM-03", status: "status-single", sources: ["SRC-01"] },
      { id: "CLM-04", status: "status-disputed", sources: ["SRC-01"] },
    ],
  });
  const plan = buildEvidencePlan(model, { asOf: "2026-01-01" });
  const d = bySlug(plan, "a");
  assert.equal(d.claims.total, 4);
  assert.deepEqual(d.claims.byStatus, { "status-single": 2, "status-quote": 1, "status-disputed": 1 });
  // pořadí klíčů kopíruje slovník (single < quote < disputed), ne abecedu
  assert.deepEqual(Object.keys(d.claims.byStatus), ["status-single", "status-quote", "status-disputed"]);
  assert.equal(plan.statusLabels["status-single"], "1 ZDROJ");
});

test("tvrzení bez pole status se počítá jako „(bez stavu)“ a nespadne", () => {
  const model = makeModel({ slug: "a", sources: [{ id: "SRC-01", outlet: "X" }], claims: [{ id: "CLM-01", sources: ["SRC-01"] }] });
  const plan = buildEvidencePlan(model, { asOf: "2026-01-01" });
  assert.deepEqual(bySlug(plan, "a").claims.byStatus, { "(bez stavu)": 1 });
});

// --- detekce „jedna rodina / jeden vydavatel" ------------------------------

test("E1+ chytí ≥2 zdroje jedné rodiny — potenciál na korroboraci", () => {
  const model = makeModel({
    slug: "a",
    sources: [
      { id: "SRC-01", outlet: "Deník N", sourceFamily: "ctk", url: "https://denikn.cz/1" },
      { id: "SRC-02", outlet: "ČT24", sourceFamily: "ctk", url: "https://ct24.cz/2" },
    ],
    claims: [{ id: "CLM-01", status: "status-single", sources: ["SRC-01", "SRC-02"] }],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a");
  assert.deepEqual(d.claims.evidence, { E0: 0, E1: 0, "E1+": 1, E2: 0 });
  assert.deepEqual(d.examples.oneVoice, ["CLM-01"]);
});

test("E1+ chytí i dva články TÉHOŽ vydavatele s rozdílnou rodinou (S10)", () => {
  const model = makeModel({
    slug: "a",
    sources: [
      { id: "SRC-01", outlet: "FORUM 24", sourceFamily: "ctk", url: "https://forum24.cz/1" },
      { id: "SRC-02", outlet: "FORUM 24", sourceFamily: "", url: "https://forum24.cz/2" },
    ],
    claims: [{ id: "CLM-01", status: "status-single", sources: ["SRC-01", "SRC-02"] }],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a");
  assert.equal(d.claims.evidence["E1+"], 1, "týž outlet nezakládá nezávislé doložení");
});

test("E1+ chytí i shodnou registrovanou doménu napříč subdoménami", () => {
  const model = makeModel({
    slug: "a",
    sources: [
      { id: "SRC-01", outlet: "HN domácí", url: "https://domaci.hn.cz/1" },
      { id: "SRC-02", outlet: "HN archiv", url: "https://archiv.hn.cz/2" },
    ],
    claims: [{ id: "CLM-01", sources: ["SRC-01", "SRC-02"] }],
  });
  assert.equal(bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a").claims.evidence["E1+"], 1);
});

test("E2: dva nezávislí vydavatelé se nepočítají jako potenciál", () => {
  const model = makeModel({
    slug: "a",
    sources: [
      { id: "SRC-01", outlet: "Deník N", url: "https://denikn.cz/1" },
      { id: "SRC-02", outlet: "iRozhlas", url: "https://irozhlas.cz/2" },
    ],
    claims: [{ id: "CLM-01", status: "status-corroborated", sources: ["SRC-01", "SRC-02"] }],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a");
  assert.deepEqual(d.claims.evidence, { E0: 0, E1: 0, "E1+": 0, E2: 1 });
  assert.equal(d.riskPoints, 0, "hotová evidence nedává body");
});

test("E0/E1: tvrzení bez zdroje a s jediným zdrojem", () => {
  const model = makeModel({
    slug: "a",
    sources: [{ id: "SRC-01", outlet: "X" }],
    claims: [
      { id: "CLM-01", sources: [] },
      { id: "CLM-02", sources: ["SRC-01"] },
    ],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a");
  assert.deepEqual(d.claims.evidence, { E0: 1, E1: 1, "E1+": 0, E2: 0 });
  assert.equal(d.riskPoints, RISK_WEIGHTS.claimsNoSource + RISK_WEIGHTS.claimsSingleSource);
});

// --- vzorec priority -------------------------------------------------------

test("riskPoints se rovná vzorci z hlavičky modulu, položku po položce", () => {
  const model = makeModel({
    slug: "a",
    updated: "2026-06-01",
    sources: [
      { id: "SRC-01", outlet: "A", url: "https://a.example/1" },
      { id: "SRC-02", outlet: "A", url: "https://a.example/2" },
    ],
    claims: [
      { id: "CLM-01", sources: [] }, // E0  → 3
      { id: "CLM-02", sources: ["SRC-01"] }, // E1  → 2
      { id: "CLM-03", sources: ["SRC-01", "SRC-02"] }, // E1+ → 1
    ],
    gaps: [
      { id: "GAP-01", priority: "vysoká", checked: "2026-06-01" }, // 2
      { id: "GAP-02", priority: "nízká", checked: "2026-01-01" }, // 1 + 1 (zastaralá)
      { id: "GAP-03", priority: "vysoká", checked: "2026-06-01", status: "closed" }, // 0
    ],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-06-01", staleDays: 30 }), "a");
  assert.deepEqual(d.riskBreakdown, {
    claimsNoSource: 1,
    claimsSingleSource: 1,
    claimsOneVoice: 1,
    gapsOpenHigh: 1,
    gapsOpenRest: 1,
    gapsStale: 1,
  });
  assert.equal(d.riskPoints, 3 + 2 + 1 + 2 + 1 + 1);
  assert.equal(d.gaps.open, 2);
  assert.equal(d.gaps.closed, 1);
  assert.equal(d.gaps.stale, 1);
});

test("zdroje bez sourceFamily se měří, ale do skóre nevstupují", () => {
  const model = makeModel({
    slug: "a",
    sources: [
      { id: "SRC-01", outlet: "A" },
      { id: "SRC-02", outlet: "B", sourceFamily: "ctk" },
    ],
    claims: [],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a");
  assert.deepEqual(d.sources, { total: 2, withFamily: 1, withoutFamily: 1 });
  assert.equal(d.riskPoints, 0);
  assert.ok(d.nextSteps.some((s) => s.text.includes("sourceFamily")));
});

test("pásmo priority je Pareto podíl práce NAD dossierem, ne pevný práh", () => {
  assert.equal(bandFor(0, 0), "žádná", "nula bodů je vždy „žádná“, bez ohledu na podíl");
  assert.equal(bandFor(999, 0), "vysoká", "první dossier se z „vysoké“ nevyřadí vlastní vahou");
  assert.equal(bandFor(10, 0.4999), "vysoká", "dossier, který práh teprve překročí, do skupiny patří");
  assert.equal(bandFor(10, 0.5), "střední");
  assert.equal(bandFor(10, 0.7999), "střední");
  assert.equal(bandFor(1, 0.8), "nízká");
});

test("pásma se rozdělí podle kumulativního podílu na celkovém objemu práce", () => {
  const heavy = makeModel({
    slug: "heavy",
    sources: [{ id: "SRC-01", outlet: "A" }],
    claims: Array.from({ length: 10 }, (_, i) => ({ id: `CLM-${i + 1}`, sources: ["SRC-01"] })),
  });
  const light = makeModel({
    slug: "light",
    sources: [{ id: "SRC-01", outlet: "A" }],
    claims: [{ id: "CLM-01", sources: ["SRC-01"] }],
  });
  const empty = makeModel({ slug: "empty" });
  const plan = buildEvidencePlan(mergeModels(heavy, light, empty), { asOf: "2026-01-01" });
  assert.deepEqual(plan.dossiers.map((d) => [d.slug, d.priority]), [
    ["heavy", "vysoká"],
    ["light", "nízká"],
    ["empty", "žádná"],
  ]);
  assert.equal(plan.totals.riskPoints, 22);
});

// --- řazení a determinismus ------------------------------------------------

test("stabilní řazení: body sestupně, při shodě slug vzestupně", () => {
  const mk = (slug, n) =>
    makeModel({
      slug,
      sources: [{ id: "SRC-01", outlet: "A" }],
      claims: Array.from({ length: n }, (_, i) => ({ id: `CLM-${i + 1}`, sources: ["SRC-01"] })),
    });
  // pořadí vstupu je záměrně jiné než očekávaný výstup
  const plan = buildEvidencePlan(mergeModels(mk("zeta", 1), mk("beta", 3), mk("alfa", 1), mk("gama", 3)), {
    asOf: "2026-01-01",
  });
  assert.deepEqual(plan.dossiers.map((d) => d.slug), ["beta", "gama", "alfa", "zeta"]);
});

test("dva běhy nad stejným modelem dají identický JSON i markdown", () => {
  const model = mergeModels(
    makeModel({
      slug: "a",
      sources: [{ id: "SRC-01", outlet: "A" }],
      claims: [{ id: "CLM-01", status: "status-single", sources: ["SRC-01"] }],
      gaps: [{ id: "GAP-01" }],
      cases: ["CASE-01"],
      relations: ["edge-a-b"],
    }),
    makeModel({ slug: "b", updated: "2026-02-02" }),
  );
  const first = buildEvidencePlan(model, { asOf: "2026-03-01" });
  const second = buildEvidencePlan(model, { asOf: "2026-03-01" });
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(renderMarkdown(first), renderMarkdown(second));
  // žádný otisk hodin: v reportu nesmí být čas běhu
  assert.ok(!/\d{4}-\d{2}-\d{2}T\d{2}:/.test(renderMarkdown(first)), "markdown nesmí nést timestamp běhu");
});

// --- prázdný dossier a hraniční stavy --------------------------------------

test("prázdný dossier nespadne a dostane prioritu „žádná“", () => {
  const plan = buildEvidencePlan(makeModel({ slug: "prazdny" }), { asOf: "2026-01-01" });
  const d = bySlug(plan, "prazdny");
  assert.deepEqual(d.claims.evidence, { E0: 0, E1: 0, "E1+": 0, E2: 0 });
  assert.deepEqual(d.claims.byStatus, {});
  assert.deepEqual(d.sources, { total: 0, withFamily: 0, withoutFamily: 0 });
  assert.equal(d.gaps.total, 0);
  assert.equal(d.gaps.oldestChecked, null);
  assert.equal(d.riskPoints, 0);
  assert.equal(d.priority, "žádná");
  assert.equal(d.nextSteps.length, 1);
  assert.match(d.nextSteps[0].text, /žádný odvozený krok/);
  assert.ok(renderMarkdown(plan).includes("prazdny"));
});

test("dataset bez jediného bodu nedělí nulou", () => {
  const plan = buildEvidencePlan(mergeModels(makeModel({ slug: "a" }), makeModel({ slug: "b" })), { asOf: "2026-01-01" });
  assert.equal(plan.totals.riskPoints, 0);
  for (const d of plan.dossiers) {
    assert.equal(d.share, 0);
    assert.equal(d.cumulativeShare, 0);
    assert.equal(d.priority, "žádná");
  }
});

test("entity view se označí jako view a jeho evidence se nezdvojuje", () => {
  const model = mergeModels(
    makeModel({ slug: "kanon", sources: [{ id: "SRC-01", outlet: "A" }], claims: [{ id: "CLM-01", sources: ["SRC-01"] }] }),
    makeModel({ slug: "pohled", canonicalDossier: "kanon" }),
  );
  const plan = buildEvidencePlan(model, { asOf: "2026-01-01" });
  assert.equal(bySlug(plan, "pohled").role, "view");
  assert.equal(bySlug(plan, "pohled").claims.total, 0);
  assert.equal(bySlug(plan, "kanon").role, "entity");
  assert.equal(plan.totals.claims, 1, "tvrzení se počítá právě jednou");
});

// --- další kroky -----------------------------------------------------------

test("další kroky nesou čísla, ze kterých vznikly, a řadí se podle přínosu", () => {
  const model = makeModel({
    slug: "a",
    sources: [
      { id: "SRC-01", outlet: "A", url: "https://a.example/1" },
      { id: "SRC-02", outlet: "A", url: "https://a.example/2" },
    ],
    claims: [
      { id: "CLM-01", sources: ["SRC-01"] },
      { id: "CLM-02", sources: ["SRC-01", "SRC-02"] },
      { id: "CLM-03", sources: ["SRC-01", "SRC-02"] },
      { id: "CLM-04", sources: ["SRC-01", "SRC-02"] },
    ],
    gaps: [{ id: "GAP-01", priority: "vysoká" }],
  });
  const d = bySlug(buildEvidencePlan(model, { asOf: "2026-01-01" }), "a");
  const texts = d.nextSteps.map((s) => s.text);
  assert.match(texts[0], /^3 tvrzení má ≥2 zdroje, ale všechny z jedné rodiny/);
  assert.ok(texts[0].includes("CLM-02"), "krok jmenuje konkrétní záznamy, aby šel ověřit");
  assert.deepEqual(
    d.nextSteps.map((s) => s.points),
    [...d.nextSteps.map((s) => s.points)].sort((x, y) => y - x),
    "kroky jsou seřazené podle přínosu do skóre",
  );
  assert.ok(texts.some((t) => /1 otevřených mezer s prioritou/.test(t)));
});

// --- horizont a CLI --------------------------------------------------------

test("datový horizont je nejnovější datum v datech, ne čas běhu", () => {
  const model = makeModel({
    slug: "a",
    updated: "2026-03-01",
    reviewedAt: "2026-03-02",
    sources: [{ id: "SRC-01", outlet: "A", retrieved: "2026-05-09" }],
    gaps: [{ id: "GAP-01", checked: "2026-04-01" }],
  });
  assert.equal(dataHorizon(compileDataset(model)), "2026-05-09");
  assert.equal(buildEvidencePlan(model).asOf, "2026-05-09");
  assert.equal(buildEvidencePlan(model, { asOf: "2026-01-01" }).asOf, "2026-01-01", "--as-of přebíjí horizont");
});

test("prázdný dataset nemá horizont a report se přesto vygeneruje", () => {
  const model = { root: "/fixture", dossiers: [], records: [], entities: [], vocabularies: [] };
  const plan = buildEvidencePlan(model);
  assert.equal(plan.asOf, null);
  assert.deepEqual(plan.dossiers, []);
  assert.ok(renderMarkdown(plan).startsWith("# Evidenční plán práce"));
});

test("parseArgs čte --as-of, --stale-days a --json", () => {
  assert.deepEqual(parseArgs([]), { asOf: null, staleDays: DEFAULT_STALE_DAYS, json: false });
  assert.deepEqual(parseArgs(["--as-of=2026-01-02", "--stale-days=7", "--json"]), {
    asOf: "2026-01-02",
    staleDays: 7,
    json: true,
  });
});

// --- markdown --------------------------------------------------------------

test("markdown nese vzorec, souhrn, pořadí i plán per dossier", () => {
  const model = mergeModels(
    makeModel({
      slug: "a",
      title: "Alfa",
      sources: [{ id: "SRC-01", outlet: "A" }],
      claims: [{ id: "CLM-01", status: "status-single", sources: ["SRC-01"] }],
      gaps: [{ id: "GAP-01", priority: "vysoká" }],
    }),
    makeModel({ slug: "b", title: "Beta" }),
  );
  const md = renderMarkdown(buildEvidencePlan(model, { asOf: "2026-01-01" }));
  assert.ok(md.includes("riskPoints = 3·E0 + 2·E1 + 1·E1+"), "vzorec je součástí reportu");
  assert.ok(md.includes("## Souhrn"));
  assert.ok(md.includes("## Pořadí dossierů"));
  assert.ok(md.includes("### 1. Alfa — `a`"));
  assert.ok(md.includes("### 2. Beta — `b`"));
  assert.ok(md.includes("needitovat ručně"), "report se hlásí jako generovaný");
  assert.ok(md.endsWith("\n"), "trailing newline");
});
