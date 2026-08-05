// Testy landing view modelu (T-063): výběr ukázkového dossieru, důkazní
// profil a inventář primárních dokumentů.
//
// Proč tenhle soubor existuje: `primaryCanonical` je vizitka projektu —
// titulní strana z něj bere ukázku řetězu tvrzení → zdroj → historie.
// Původní výběr bral PRVNÍHO kanonického vlastníka s neprázdným registrem
// tvrzení i zdrojů, jenže registr se řadí podle `order ?? 0`, takže každý
// nově založený dossier BEZ `order` skončil na začátku registru a tím
// i na titulní straně. Testuje se PRAVIDLO, ne dnešní data: konkrétní
// vítěz se mění každým rešeršním kolem a test vázaný na jeho slug by za
// týden hlídal minulost.
//
// Použití: node --test scripts/data/landing-view-model.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { loadCanonicalTree } from "./load.mjs";
import { compileDataset } from "./compile.mjs";
import {
  buildViewModels,
  isInstitutionalSourceUrl,
  primaryDocumentKind,
  pickPrimaryCanonical,
} from "./build-view-models.mjs";

const SCHEMA_BASE = "https://vomaste.cz/schemas/canonical";
const CONTEXT = "https://vomaste.cz/context/v1.jsonld";
const ID_BASE = "https://vomaste.cz/id";

const put = (root, rel, record) => {
  const file = join(root, ...rel.split("/"));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
};

const envelope = (type, ldType, id) => ({
  $schema: `${SCHEMA_BASE}/${type}.schema.json`,
  schemaVersion: 1,
  "@context": CONTEXT,
  "@id": id,
  "@type": `vomaste:${ldType}`,
  recordType: type,
});

/*
 * Zapíše jeden dossier: `claims` je pole [status, početZdrojů] a zdroje
 * se generují tak, aby vazba claim ↔ source byla oboustranná (view model
 * jinak nemá co resolvovat). `url` na zdroji řídí, jestli jde
 * o primární dokument instituce.
 */
function writeDossier(root, { slug, order, navigationVisible = true, claims, sourceUrl, outlet }) {
  const did = `${ID_BASE}/dossiers/${slug}`;
  const rid = (registry, id) => `${did}/${registry}/${id}`;
  const dossier = {
    ...envelope("dossier", "Dossier", did),
    identifier: slug,
    slug,
    title: slug,
    description: `Fixture ${slug}.`,
    dossierType: "entity",
    canonicalDossier: slug,
    subject: slug,
    language: "cs",
    navigationVisible,
    updated: "2026-08-05",
    authorization: { records: ["AUTH-TEST"] },
    contentBlocks: [],
  };
  if (order !== undefined) dossier.order = order;
  put(root, `data/dossiers/${slug}/dossier.json`, dossier);

  const sourceIds = new Set();
  claims.forEach(([status, sourceCount], index) => {
    const claimId = `CLM-${index + 1}`;
    const sources = Array.from({ length: sourceCount }, (_, i) => `SRC-${index + 1}-${i + 1}`);
    for (const s of sources) sourceIds.add(s);
    put(root, `data/dossiers/${slug}/claims/${claimId.toLowerCase()}.json`, {
      ...envelope("claim", "Claim", rid("claims", claimId)),
      identifier: claimId,
      dossier: { "@id": did },
      text: `Tvrzení ${claimId} dossieru ${slug}.`,
      status,
      statusLabel: status.replace("status-", "").toUpperCase(),
      sources: sources.map((s) => ({ "@id": rid("sources", s) })),
      subjects: [slug],
      order: index + 1,
      content: [],
    });
    sources.forEach((s, i) => {
      put(root, `data/dossiers/${slug}/sources/${s.toLowerCase()}.json`, {
        ...envelope("source", "Source", rid("sources", s)),
        identifier: s,
        dossier: { "@id": did },
        title: `Zdroj ${s}`,
        outlet: outlet ?? `Vydavatel ${i + 1}`,
        sourceFamily: "",
        sourceType: "zpravodajství",
        url: sourceUrl ?? `https://example-${i + 1}.invalid/${slug}/${s.toLowerCase()}`,
        published: "2026-07-01",
        retrieved: "2026-08-01",
        claims: [{ "@id": rid("claims", claimId) }],
        subjects: [slug],
        content: [],
        order: i + 1,
      });
    });
  });
}

const compiledOf = (root) => compileDataset(loadCanonicalTree(join(root, "data/dossiers")));
const freshRoot = () => mkdtempSync(join(tmpdir(), "vomaste-landing-"));
const landingOf = (root) => buildViewModels(compiledOf(root)).get("landing.json");

// --- výběr ukázkového dossieru ------------------------------------------

test("dossier bez `order` nikdy nepředběhne dossier s pořadím", () => {
  const root = freshRoot();
  // Bez `order` a zapsaný jako první — přesně stav, který nově založený
  // dossier martin-pavlik vyrobil na produkci.
  writeDossier(root, { slug: "aaa-bez-poradi", claims: [["status-single", 1]] });
  writeDossier(root, { slug: "zzz-s-poradim", order: 7, claims: [["status-single", 1]] });
  assert.equal(landingOf(root).primaryCanonical, "zzz-s-poradim");
});

test("mezi dossiery s pořadím vyhrává nejsilnější evidence, ne nejnižší `order`", () => {
  const root = freshRoot();
  writeDossier(root, { slug: "prvni-slabsi", order: 1, claims: [["status-corroborated", 2], ["status-single", 1]] });
  writeDossier(root, {
    slug: "pozdejsi-silnejsi",
    order: 9,
    claims: [["status-corroborated", 2], ["status-corroborated", 2], ["status-corroborated", 2]],
  });
  assert.equal(landingOf(root).primaryCanonical, "pozdejsi-silnejsi");
});

test("při shodném počtu korroborací rozhoduje podíl, pak počet zdrojů, pak `order`", () => {
  const root = freshRoot();
  // Oba mají 2 korroborovaná tvrzení; „zredeny" jich má ale míň celkem,
  // takže jeho podíl doložení je vyšší.
  writeDossier(root, {
    slug: "rozredeny",
    order: 1,
    claims: [["status-corroborated", 2], ["status-corroborated", 2], ["status-single", 1], ["status-single", 1]],
  });
  writeDossier(root, { slug: "zhusteny", order: 2, claims: [["status-corroborated", 2], ["status-corroborated", 2]] });
  assert.equal(landingOf(root).primaryCanonical, "zhusteny");
});

test("kandidátem je jen dossier s neprázdným registrem tvrzení i zdrojů a viditelný v navigaci", () => {
  const root = freshRoot();
  writeDossier(root, { slug: "prazdny", order: 1, claims: [] });
  writeDossier(root, { slug: "skryty", order: 2, navigationVisible: false, claims: [["status-corroborated", 2]] });
  writeDossier(root, { slug: "viditelny", order: 3, claims: [["status-single", 1]] });
  assert.equal(landingOf(root).primaryCanonical, "viditelny");
});

test("bez jediného kandidáta je primaryCanonical null, ne pád", () => {
  const root = freshRoot();
  writeDossier(root, { slug: "prazdny", order: 1, claims: [] });
  const landing = landingOf(root);
  assert.equal(landing.primaryCanonical, null);
  assert.equal(landing.demoClaim, null);
});

test("pickPrimaryCanonical je deterministický — vstupní pořadí výsledek nemění", () => {
  const wrapper = (dossier, order) => ({ dossier, record: { order, navigationVisible: true } });
  const evidence = new Map([
    ["alfa", { claims: 4, sources: 4, corroborated: 2 }],
    ["beta", { claims: 4, sources: 4, corroborated: 2 }],
  ]);
  const forward = [wrapper("alfa", 1), wrapper("beta", 2)];
  assert.equal(pickPrimaryCanonical(forward, evidence), "alfa");
  assert.equal(pickPrimaryCanonical(forward.slice().reverse(), evidence), "alfa");
});

// --- důkazní profil ------------------------------------------------------

test("evidence rozpadá tvrzení podle stavu a počítá vydavatele i otevřené mezery", () => {
  const root = freshRoot();
  writeDossier(root, {
    slug: "dossier",
    order: 1,
    claims: [["status-corroborated", 2], ["status-single", 1], ["status-quote", 1]],
  });
  const { evidence } = landingOf(root);
  assert.deepEqual(evidence.claimsByStatus, {
    corroborated: 1,
    single: 1,
    quote: 1,
    disputed: 0,
    opinion: 0,
  });
  assert.equal(evidence.claims, 3);
  assert.equal(evidence.corroboratedPercent, 33);
  assert.equal(evidence.sources, 4);
  // Součet rozpadu se musí rovnat počtu tvrzení — jinak by dlaždice na
  // titulní straně tiše nesouhlasily s registrem.
  assert.equal(
    Object.values(evidence.claimsByStatus).reduce((a, b) => a + b, 0),
    evidence.claims,
  );
});

test("demoClaim upřednostní korroborované tvrzení a nese resolved zdroje", () => {
  const root = freshRoot();
  writeDossier(root, {
    slug: "dossier",
    order: 1,
    // Korroborované tvrzení je záměrně AŽ druhé v pořadí registru.
    claims: [["status-single", 1], ["status-corroborated", 2]],
  });
  const { demoClaim } = landingOf(root);
  assert.equal(demoClaim.status, "status-corroborated");
  assert.equal(demoClaim.sources.length, 2);
  assert.ok(demoClaim.sources.every((s) => s.route && s.identifier));
  assert.equal(demoClaim.contentPath, "dossiers/dossier/claims/clm-2.md");
});

// --- primární dokumenty --------------------------------------------------

test("primární dokument se pozná podle domény instituce, ne podle názvu vydavatele", () => {
  assert.equal(isInstitutionalSourceUrl("https://www.psp.cz/sqw/hlasy.sqw?g=1"), true);
  assert.equal(isInstitutionalSourceUrl("https://msp.gov.cz/tiskova-zprava"), true);
  assert.equal(isInstitutionalSourceUrl("https://www.eppo.europa.eu/en/media/news/x"), true);
  assert.equal(isInstitutionalSourceUrl("https://vyhledavac.nssoud.cz/DokumentOriginal/x"), true);
  // Weby, které se v datasetu popisují jako „oficiální primární zdroj",
  // ale institucí nejsou — právě kvůli nim se netestuje `sourceType`.
  assert.equal(isInstitutionalSourceUrl("https://www.parlamentnilisty.cz/clanek"), false);
  assert.equal(isInstitutionalSourceUrl("https://demagog.cz/vyrok/1"), false);
  assert.equal(isInstitutionalSourceUrl("nefunkční url"), false);
});

test("druh primárního dokumentu se určuje z názvu instituce, ne z domény", () => {
  assert.equal(primaryDocumentKind("Vrchní soud v Praze"), "court");
  assert.equal(primaryDocumentKind("Nejvyšší správní soud"), "court");
  assert.equal(primaryDocumentKind("Poslanecká sněmovna Parlamentu ČR"), "parliament");
  assert.equal(primaryDocumentKind("Ministerstvo spravedlnosti ČR"), "authority");
  assert.equal(primaryDocumentKind(null), "authority");
});

test("ukázky primárních dokumentů: jeden za druh, nejvíc doložených tvrzení vyhrává", () => {
  const root = freshRoot();
  writeDossier(root, {
    slug: "soudni",
    order: 1,
    outlet: "Městský soud v Praze",
    sourceUrl: "https://www.justice.cz/rozhodnuti/1",
    claims: [["status-single", 1]],
  });
  writeDossier(root, {
    slug: "snemovni",
    order: 2,
    outlet: "Poslanecká sněmovna Parlamentu ČR",
    sourceUrl: "https://www.psp.cz/sqw/hlasy.sqw?g=2",
    claims: [["status-single", 1]],
  });
  writeDossier(root, {
    slug: "redakcni",
    order: 3,
    outlet: "Nějaký deník",
    sourceUrl: "https://nejaky-denik.invalid/clanek",
    claims: [["status-single", 1]],
  });
  const landing = landingOf(root);
  assert.deepEqual(
    landing.primaryDocuments.map((d) => d.kind),
    ["court", "parliament"],
  );
  // Redakční zdroj se mezi primární dokumenty nepočítá.
  assert.equal(landing.evidence.institutionalSources, 2);
  // Ukázka nese instituci, ne titul záznamu — titulní strana nikoho nejmenuje.
  assert.ok(landing.primaryDocuments.every((d) => d.outlet && d.route && !("title" in d)));
});
