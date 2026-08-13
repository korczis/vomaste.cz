// Testy detektoru původního zjišťovatele (report-originator-gaps.mjs).
//
// Fixtury jsou syntetické in-memory modely stejného tvaru, jaký vrací
// loadCanonicalTree — testuje se tedy kód, ne aktuální obsah dossierů.
// Kdyby testy četly reálná data, měnily by se s každou redakční úpravou
// a přestaly by chránit logiku.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOriginatorGaps, ORIGINATORS } from "./report-originator-gaps.mjs";

const CONTEXT = "https://vomaste.cz/context/v1.jsonld";
const idOf = (slug, registry, id) =>
  registry === "dossier"
    ? `https://vomaste.cz/id/dossiers/${slug}`
    : `https://vomaste.cz/id/dossiers/${slug}/${registry}/${id}`;
const ref = (slug, registry, id) => ({ "@id": idOf(slug, registry, id) });

const wrap = (slug, record, registry, id) => ({
  record,
  relPath: `${slug}/${registry === "dossier" ? "dossier.json" : `${registry}/${String(id).toLowerCase()}.json`}`,
  dossier: slug,
  registry,
});

/*
 * makeDossier({ slug, claims, sources }) → model jednoho dossieru.
 *   claims:  [{ id, text, sources: [srcId] }]
 *   sources: [{ id, outlet, family?, published? }]
 */
function makeDossier({ slug, claims = [], sources = [] }) {
  const records = [
    wrap(
      slug,
      {
        "@context": CONTEXT,
        "@id": idOf(slug, "dossier"),
        recordType: "dossier",
        identifier: slug,
        slug,
        title: slug,
        dossierType: "entity",
        canonicalDossier: slug,
        subject: slug,
      },
      "dossier",
    ),
  ];
  for (const s of sources) {
    records.push(
      wrap(
        slug,
        {
          "@context": CONTEXT,
          "@id": idOf(slug, "sources", s.id),
          recordType: "source",
          identifier: s.id,
          dossier: ref(slug, "dossier"),
          outlet: s.outlet,
          ...(s.family ? { sourceFamily: s.family } : {}),
          ...(s.published ? { published: s.published } : {}),
          // Doména se odvozuje z outletu, ne z id: kdyby všechny fixturové
          // zdroje sdílely doménu, pravidlo o registrované doméně by je
          // označilo za závislé a testy by měřily něco jiného, než chtějí.
          url: `https://${s.outlet.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")}.test/${s.id.toLowerCase()}`,
        },
        "sources",
        s.id,
      ),
    );
  }
  for (const c of claims) {
    records.push(
      wrap(
        slug,
        {
          "@context": CONTEXT,
          "@id": idOf(slug, "claims", c.id),
          recordType: "claim",
          identifier: c.id,
          dossier: ref(slug, "dossier"),
          text: c.text,
          status: "status-single",
          statusLabel: "1 ZDROJ",
          sources: (c.sources ?? []).map((s) => ref(slug, "sources", s)),
        },
        "claims",
        c.id,
      ),
    );
  }
  return { root: "/fixture", dossiers: [{ slug, rootDir: `/fixture/${slug}`, wrapper: records[0] }], records, entities: [], vocabularies: [] };
}

const merge = (...models) => ({
  root: "/fixture",
  dossiers: models.flatMap((m) => m.dossiers),
  records: models.flatMap((m) => m.records),
  entities: [],
  vocabularies: [],
});

test("najde stopu: jeden hlas + tvrzení jmenuje necitovaný outlet", () => {
  const model = makeDossier({
    slug: "x",
    claims: [{ id: "CLM-01", text: "Podle zjištění Seznam Zpráv stát zaplatil miliardu.", sources: ["SRC-01", "SRC-02"] }],
    sources: [
      { id: "SRC-01", outlet: "Echo24", family: "ctk" },
      { id: "SRC-02", outlet: "Blesk.cz", family: "ctk" },
    ],
  });
  const r = buildOriginatorGaps(model);
  assert.equal(r.totals.findings, 1);
  assert.equal(r.findings[0].missingOriginator, "Seznam Zprávy");
  assert.equal(r.findings[0].claim, "CLM-01");
});

test("nehlásí nic, když je jmenovaný outlet už citovaný", () => {
  const model = makeDossier({
    slug: "x",
    claims: [{ id: "CLM-01", text: "Podle zjištění Seznam Zpráv stát zaplatil miliardu.", sources: ["SRC-01", "SRC-02"] }],
    sources: [
      { id: "SRC-01", outlet: "Seznam Zprávy", family: "ctk" },
      { id: "SRC-02", outlet: "Blesk.cz", family: "ctk" },
    ],
  });
  assert.equal(buildOriginatorGaps(model).totals.findings, 0);
});

test("nehlásí tvrzení, které už má nezávislou dvojici", () => {
  const model = makeDossier({
    slug: "x",
    claims: [{ id: "CLM-01", text: "Podle zjištění Seznam Zpráv stát zaplatil miliardu.", sources: ["SRC-01", "SRC-02"] }],
    sources: [
      { id: "SRC-01", outlet: "Echo24", family: "ctk" },
      { id: "SRC-02", outlet: "Deník N", family: "denik-n" },
    ],
  });
  assert.equal(buildOriginatorGaps(model).totals.findings, 0);
});

// Regrese na skutečnou chybu: první, ruční verze detektoru porovnávala
// outlety podle prvního slova malými písmeny, takže hledaný „Deník N"
// se shodoval s „Deník.cz", „Ekonomický deník" i „Jihlavský deník" —
// a report byl nafouknutý o třetinu.
test("„Deník N“ se neshoduje s Deník.cz ani Ekonomickým deníkem", () => {
  const model = makeDossier({
    slug: "x",
    claims: [{ id: "CLM-01", text: "Jak napsal Deník N, úřad mlčel.", sources: ["SRC-01", "SRC-02"] }],
    sources: [
      { id: "SRC-01", outlet: "Deník.cz", family: "ctk" },
      { id: "SRC-02", outlet: "Ekonomický deník", family: "ctk" },
    ],
  });
  const r = buildOriginatorGaps(model);
  assert.equal(r.totals.findings, 1, "Deník N má zůstat hlášený jako chybějící");
  assert.deepEqual(r.findings[0].candidatesAlreadyInDossier, [], "cizí vydavatelé nesmí být kandidáti");
});

test("kandidát téhož vydavatele v dossieru se nabídne, ale jen jako stopa", () => {
  const model = makeDossier({
    slug: "x",
    claims: [{ id: "CLM-01", text: "Jak napsal Deník N, úřad mlčel.", sources: ["SRC-01"] }],
    sources: [
      { id: "SRC-01", outlet: "Echo24", family: "ctk" },
      { id: "SRC-09", outlet: "Deník N", family: "denik-n", published: "2026-01-15" },
    ],
  });
  const r = buildOriginatorGaps(model);
  assert.equal(r.totals.findings, 1);
  assert.equal(r.totals.withCandidateInDossier, 1);
  assert.deepEqual(
    r.findings[0].candidatesAlreadyInDossier.map((c) => c.identifier),
    ["SRC-09"],
  );
});

test("tvrzení bez citovaného zdroje se nehlásí (řeší jiná brána)", () => {
  const model = makeDossier({
    slug: "x",
    claims: [{ id: "CLM-01", text: "Podle Deník N se nic nestalo.", sources: [] }],
  });
  assert.equal(buildOriginatorGaps(model).totals.findings, 0);
});

test("výstup je deterministický a seřazený", () => {
  const model = merge(
    makeDossier({
      slug: "b",
      claims: [{ id: "CLM-02", text: "Podle Deník N …", sources: ["SRC-01"] }],
      sources: [{ id: "SRC-01", outlet: "Echo24", family: "ctk" }],
    }),
    makeDossier({
      slug: "a",
      claims: [{ id: "CLM-01", text: "Podle Deník N …", sources: ["SRC-01"] }],
      sources: [{ id: "SRC-01", outlet: "Echo24", family: "ctk" }],
    }),
  );
  const r = buildOriginatorGaps(model);
  assert.deepEqual(
    r.findings.map((f) => `${f.dossier}/${f.claim}`),
    ["a/CLM-01", "b/CLM-02"],
  );
  assert.deepEqual(buildOriginatorGaps(model), r);
});

test("seznam zjišťovatelů má unikátní kanonické názvy", () => {
  const names = ORIGINATORS.map((o) => o.canonical);
  assert.equal(new Set(names).size, names.length);
});
