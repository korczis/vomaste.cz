// Testy generovaných artefaktů fáze E (T-028): view modely nad
// syntetickým kanonickým fixture stromem, determinismus stub generátoru,
// check-generated gate (chybějící stub / sirotčí soubor / route parity)
// a lossless round-trip [[extra.timeline]] bloků přes migrátor.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { loadCanonicalTree } from "./load.mjs";
import { compileDataset } from "./compile.mjs";
import { validateShapeTree } from "./validate-shape.mjs";
import { buildViewModels, writeViewModels } from "./build-view-models.mjs";
import { buildStubs, writeStubs, STAGING_REL, SYNC_EXCLUDED } from "./generate-zola-content.mjs";
import { syncContent, isSyncedPath } from "./sync-content.mjs";
import { checkGenerated, routeOfStubPath } from "./check-generated.mjs";

const SCHEMA_BASE = "https://vomaste.cz/schemas/canonical";
const CONTEXT = "https://vomaste.cz/context/v1.jsonld";
const ID_BASE = "https://vomaste.cz/id";

const put = (root, rel, content) => {
  const file = join(root, ...rel.split("/"));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}\n`);
};

const envelope = (type, ldType, id) => ({
  $schema: `${SCHEMA_BASE}/${type}.schema.json`,
  schemaVersion: 1,
  "@context": CONTEXT,
  "@id": id,
  "@type": `vomaste:${ldType}`,
  recordType: type,
});

const SLUG = "example-subject";
const did = `${ID_BASE}/dossiers/${SLUG}`;
const rid = (registry, id) => `${did}/${registry}/${id}`;
const eid = (id) => `${ID_BASE}/entities/${id}`;
const ref = (id) => ({ "@id": id });

const TIMELINE_ENTRIES = [
  { date: "2026-01-05", title: "První událost", anchor: "kauza-test", dot: "dot-fact", subjects: ["example"] },
  { date: "23. 2. 2026", title: "Druhá událost (český volný formát data)", anchor: "kauza-test", dot: "dot-disputed" },
];

// Syntetický kanonický fixture strom (data/dossiers/**) — CLM-2 a CLM-10
// schválně přeskakují čísla kvůli numerickému řazení (CLM-2 < CLM-10).
function writeCanonicalFixture(root) {
  const out = (rel, record) => put(root, `data/dossiers/${rel}`, record);
  out(`${SLUG}/dossier.json`, {
    ...envelope("dossier", "Dossier", did),
    identifier: SLUG,
    slug: SLUG,
    title: "Example Subject",
    description: "Testovací dossier fáze E.",
    dossierType: "entity",
    canonicalDossier: SLUG,
    subject: "example",
    language: "cs",
    aliases: ["/stary-dossier/"],
    navigationVisible: true,
    updated: "2026-08-01",
    authorization: { records: ["AUTH-TEST-1"] },
    seo: { seoType: "ProfilePage" },
    contentBlocks: [
      { type: "markdown", value: "Tělo přehledu dossieru." },
      { type: "timeline", entries: TIMELINE_ENTRIES },
    ],
  });
  out(`${SLUG}/claims/clm-2.json`, {
    ...envelope("claim", "Claim", rid("claims", "CLM-2")),
    identifier: "CLM-2",
    dossier: ref(did),
    text: "První tvrzení.",
    status: "status-single",
    statusLabel: "1 ZDROJ",
    sources: [ref(rid("sources", "SRC-1"))],
    subjects: ["example"],
    order: 2,
    content: [{ type: "markdown", value: "Tělo CLM-2." }],
  });
  out(`${SLUG}/claims/clm-10.json`, {
    ...envelope("claim", "Claim", rid("claims", "CLM-10")),
    identifier: "CLM-10",
    dossier: ref(did),
    text: "Desáté tvrzení.",
    status: "status-corroborated",
    statusLabel: "CORROBORATED",
    sources: [ref(rid("sources", "SRC-1")), ref(rid("sources", "SRC-2"))],
    subjects: ["example"],
    order: 10,
    content: [{ type: "markdown", value: "Tělo CLM-10." }],
  });
  const source = (n, family) => ({
    ...envelope("source", "Source", rid("sources", `SRC-${n}`)),
    identifier: `SRC-${n}`,
    dossier: ref(did),
    title: `Zdroj SRC-${n}`,
    outlet: `Outlet ${family}`,
    sourceFamily: family,
    sourceType: "zpravodajství",
    url: `https://example.org/src-${n}`,
    published: "2026-07",
    retrieved: "2026-08-01",
    claims: [ref(rid("claims", n === 1 ? "CLM-2" : "CLM-10"))],
    subjects: ["example"],
    content: [{ type: "markdown", value: `Tělo SRC-${n}.` }],
    order: n,
  });
  out(`${SLUG}/sources/src-1.json`, source(1, "rodina-a"));
  out(`${SLUG}/sources/src-2.json`, source(2, "rodina-b"));
  out(`${SLUG}/cases/case-1.json`, {
    ...envelope("case", "Case", rid("cases", "CASE-1")),
    identifier: "CASE-1",
    dossier: ref(did),
    title: "Testovací kauza",
    summary: "Shrnutí testovací kauzy.",
    period: "2026",
    status: "status-single",
    statusLabel: "Otevřeno",
    anchor: "kauza-test",
    claims: [ref(rid("claims", "CLM-2")), ref(rid("claims", "CLM-10"))],
    sources: [ref(rid("sources", "SRC-1"))],
    subjects: ["example"],
    content: [{ type: "markdown", value: "Tělo kauzy." }],
    order: 1,
  });
  out(`${SLUG}/gaps/gap-1.json`, {
    ...envelope("gap", "Gap", rid("gaps", "GAP-1")),
    identifier: "GAP-1",
    dossier: ref(did),
    title: "Otevřená otázka",
    description: "Co zdroje nedokládají.",
    priority: "střední",
    checked: "2026-08-01",
    claims: [ref(rid("claims", "CLM-2"))],
    subjects: ["example"],
    content: [{ type: "markdown", value: "Tělo mezery." }],
    order: 1,
  });
  out(`${SLUG}/relations/edge-example-org.json`, {
    ...envelope("relation", "Relation", rid("relations", "edge-example-org")),
    identifier: "edge-example-org",
    relationId: "edge-example-org",
    dossier: ref(did),
    sourceEntity: ref(eid("example-person")),
    targetEntity: ref(eid("example-org")),
    relationType: "HOLDS_ROLE",
    label: "role v organizaci",
    status: "single",
    claims: [ref(rid("claims", "CLM-2"))],
    sources: [ref(rid("sources", "SRC-1"))],
    subjects: ["example"],
    directed: true,
  });
  out(`${SLUG}/updates/2026-08-01.json`, {
    ...envelope("update", "Update", rid("updates", "2026-08-01")),
    identifier: "2026-08-01",
    dossier: ref(did),
    date: "2026-08-01",
    summary: "Založení testovacího dossieru.",
  });
  out("_shared/entities/example-person.json", {
    ...envelope("entity", "Entity", eid("example-person")),
    identifier: "example-person",
    entityId: "example-person",
    title: "Example Subject",
    entityType: "person",
    publicationRole: "subject",
    dossierEnabled: true,
    dossierStatus: "authorized",
    coverageState: "full",
    dossiers: [SLUG],
    routeAliases: [`/dossiers/${SLUG}/entities/example-person/`],
  });
  out("_shared/entities/example-org.json", {
    ...envelope("entity", "Entity", eid("example-org")),
    identifier: "example-org",
    entityId: "example-org",
    title: "Example Org",
    entityType: "organization",
    publicationRole: "context",
    dossierEnabled: false,
    dossierStatus: "not_authorized",
    coverageState: "contextual",
    dossiers: [SLUG],
  });
}

const freshRoot = () => {
  const root = mkdtempSync(join(tmpdir(), "vomaste-phase-e-"));
  writeCanonicalFixture(root);
  return root;
};

const compiledOf = (root) => compileDataset(loadCanonicalTree(join(root, "data/dossiers")));

function hashTree(dir, prefix = "") {
  const out = new Map();
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) for (const [k, v] of hashTree(join(dir, entry.name), rel)) out.set(k, v);
    else out.set(rel, createHash("sha256").update(readFileSync(join(dir, entry.name))).digest("hex"));
  }
  return out;
}

// --- view modely ---------------------------------------------------------

test("fixture strom prochází tvarovou bránou (poctivost fixture)", () => {
  const root = freshRoot();
  assert.deepEqual(validateShapeTree(join(root, "data/dossiers")).errors, []);
});

test("view modely: overview nese meta, počty, case karty i timeline", () => {
  const views = buildViewModels(compiledOf(freshRoot()));
  const overview = views.get(`dossiers/${SLUG}/overview.json`);
  assert.equal(overview.title, "Example Subject");
  assert.equal(overview.route, `/dossiers/${SLUG}/`);
  assert.deepEqual(overview.aliases, ["/stary-dossier/"]);
  // counts.entities = globální entity s členstvím v dossieru (fáze H —
  // dřívější stats.toml entities_total).
  assert.deepEqual(overview.counts, { claims: 2, sources: 2, cases: 1, gaps: 1, relations: 1, entities: 2 });
  assert.deepEqual(overview.authorization, { records: ["AUTH-TEST-1"] });
  // timeline blok projde do view modelu beze změny (lossless projekce)
  const timeline = overview.contentBlocks.find((b) => b.type === "timeline");
  assert.deepEqual(timeline.entries, TIMELINE_ENTRIES);
  // case karta s resolved routami claimů
  assert.equal(overview.cases.length, 1);
  assert.equal(overview.cases[0].anchor, "kauza-test");
  assert.deepEqual(
    overview.cases[0].claims.map((c) => c.route),
    [`/dossiers/${SLUG}/claims/clm-2/`, `/dossiers/${SLUG}/claims/clm-10/`],
  );
  // JSON-LD fragment = kompaktní record bez $schema
  assert.equal(overview.jsonld.$schema, undefined);
  assert.equal(overview.jsonld["@id"], did);
});

test("view modely: registry index řadí numericky a resolvuje reference", () => {
  const views = buildViewModels(compiledOf(freshRoot()));
  const index = views.get(`dossiers/${SLUG}/claims-index.json`);
  assert.deepEqual(
    index.rows.map((r) => r.identifier),
    ["CLM-2", "CLM-10"], // numerické řazení, ne lexikografické
  );
  assert.deepEqual(
    index.rows[1].sources.map((s) => s.identifier),
    ["SRC-1", "SRC-2"],
  );
  const relations = views.get(`dossiers/${SLUG}/relations-index.json`);
  assert.equal(relations.rows[0].from.title, "Example Subject");
  assert.equal(relations.rows[0].to.route, "/entities/example-org/");
});

test("view modely: detail má resolved refs, sousedy CLM-2 < CLM-10 a related záznamy", () => {
  const views = buildViewModels(compiledOf(freshRoot()));
  const clm2 = views.get(`dossiers/${SLUG}/claims/clm-2.json`);
  assert.equal(clm2.neighbors.prev, null);
  assert.equal(clm2.neighbors.next.identifier, "CLM-10");
  assert.deepEqual(
    clm2.resolved.sources.map((s) => [s.identifier, s.route]),
    [["SRC-1", `/dossiers/${SLUG}/sources/src-1/`]],
  );
  assert.deepEqual(clm2.related.cases.map((c) => c.identifier), ["CASE-1"]);
  assert.deepEqual(clm2.related.gaps.map((g) => g.identifier), ["GAP-1"]);
  assert.deepEqual(clm2.related.relations.map((r) => r.identifier), ["edge-example-org"]);

  const clm10 = views.get(`dossiers/${SLUG}/claims/clm-10.json`);
  assert.equal(clm10.neighbors.prev.identifier, "CLM-2");
  assert.equal(clm10.neighbors.next, null);
  assert.equal(clm10.record.text, "Desáté tvrzení.");
});

test("view modely: entita nese dossiery, relace i claims/sources z relací", () => {
  const views = buildViewModels(compiledOf(freshRoot()));
  const entity = views.get("entities/example-org.json");
  assert.deepEqual(entity.dossiers.map((d) => d.route), [`/dossiers/${SLUG}/`]);
  assert.equal(entity.relations.length, 1);
  assert.equal(entity.relations[0].direction, "incoming");
  assert.equal(entity.relations[0].other.entityId, "example-person");
  assert.deepEqual(entity.claims.map((c) => c.identifier), ["CLM-2"]);
  assert.deepEqual(entity.sources.map((s) => s.identifier), ["SRC-1"]);

  const index = views.get("entities-index.json");
  assert.equal(index.count, 2);
  const landing = views.get("landing.json");
  assert.deepEqual(landing.totals, { dossiers: 1, entities: 2, claims: 2, sources: 2, cases: 1, gaps: 1, relations: 1 });
  const map = views.get("map.json");
  assert.equal(map.nodes.length, 2);
  assert.equal(map.edges[0].route, `/dossiers/${SLUG}/relations/edge-example-org/`);
});

// --- stub generátor ------------------------------------------------------

test("stub generátor: determinismus — dva běhy dají identické bajty", () => {
  const root = freshRoot();
  const compiled = compiledOf(root);
  const outA = join(root, "staging-a");
  const outB = join(root, "staging-b");
  writeStubs(buildStubs(compiled, { contentRoot: root }), outA);
  writeStubs(buildStubs(compiled, { contentRoot: root }), outB);
  assert.deepEqual([...hashTree(outA).entries()], [...hashTree(outB).entries()]);
  // opakovaný zápis do téhož adresáře také nezmění jediný bajt
  const before = hashTree(outA);
  writeStubs(buildStubs(compiled, { contentRoot: root }), outA);
  assert.deepEqual([...hashTree(outA).entries()], [...before.entries()]);
});

test("stub generátor: stub nese record_id, view_model a přenesené aliasy", () => {
  const root = freshRoot();
  const stubs = buildStubs(compiledOf(root), { contentRoot: root });
  const clm2 = stubs.get(`dossiers/${SLUG}/claims/clm-2.md`);
  assert.match(clm2, /^title = "CLM-2"$/m);
  assert.match(clm2, /^template = "dossier-claim\.html"$/m);
  assert.match(clm2, /^record_id = "https:\/\/vomaste\.cz\/id\/dossiers\/example-subject\/claims\/CLM-2"$/m);
  assert.match(clm2, /^view_model = "generated\/views\/dossiers\/example-subject\/claims\/clm-2\.json"$/m);
  assert.match(clm2, /GENERATED FILE\. DO NOT EDIT\./);
  // aliasy: dossier z kanonického záznamu, entita z routeAliases
  assert.match(stubs.get(`dossiers/${SLUG}/_index.md`), /^aliases = \["\/stary-dossier\/"\]$/m);
  assert.match(stubs.get("entities/example-person.md"), /aliases = \["\/dossiers\/example-subject\/entities\/example-person\/"\]/);
  // updates nemají routu → žádný stub
  assert.equal([...stubs.keys()].some((p) => p.includes("/updates/")), false);
});

// --- sync-content (fáze F swap) ------------------------------------------

test("isSyncedPath: pokrývá záznamy, registry indexy, dossier _index a entity — ne kořeny ani aux indexy", () => {
  assert.equal(isSyncedPath(`dossiers/${SLUG}/_index.md`), true);
  assert.equal(isSyncedPath(`dossiers/${SLUG}/claims/_index.md`), true);
  assert.equal(isSyncedPath(`dossiers/${SLUG}/claims/clm-2.md`), true);
  assert.equal(isSyncedPath("entities/example-person.md"), true);
  for (const excluded of SYNC_EXCLUDED) assert.equal(isSyncedPath(excluded), false);
  assert.equal(isSyncedPath(`dossiers/${SLUG}/evidence/_index.md`), false);
  assert.equal(isSyncedPath(`dossiers/${SLUG}/entities/_index.md`), false);
  assert.equal(isSyncedPath("entities/person/_index.md"), false, "entity-type sekce nejsou synchronizované");
});

test("sync-content: kopíruje staging do content, maže sirotky, nechává výjimky; idempotentní", () => {
  const root = freshRoot();
  generateAll(root);
  // ručně psané soubory, kterých se sync nesmí dotknout
  put(root, "content/dossiers/_index.md", "+++\ntitle = \"Dossiery\"\n+++\nRuční tělo.\n");
  put(root, `content/dossiers/${SLUG}/evidence/_index.md`, "+++\ntitle = \"Registr evidence\"\n+++\n");
  // sirotčí záznam bez kanonického protějšku — musí zaniknout
  put(root, `content/dossiers/${SLUG}/claims/clm-99.md`, "+++\ntitle = \"CLM-99\"\n+++\n");

  const first = syncContent({ root });
  assert.ok(first.copied.length > 0);
  assert.deepEqual(first.deleted, [`dossiers/${SLUG}/claims/clm-99.md`]);
  assert.equal(readFileSync(join(root, "content/dossiers/_index.md"), "utf8").includes("Ruční tělo."), true);
  assert.equal(
    readFileSync(join(root, `content/dossiers/${SLUG}/claims/clm-2.md`), "utf8"),
    readFileSync(join(root, STAGING_REL, `dossiers/${SLUG}/claims/clm-2.md`), "utf8"),
  );
  // idempotence: druhý běh nic nemění
  const second = syncContent({ root });
  assert.deepEqual({ copied: second.copied, deleted: second.deleted }, { copied: [], deleted: [] });
});

test("check-generated --content: drift content/ vs staging je chyba brány", async () => {
  const root = freshRoot();
  generateAll(root);
  syncContent({ root });
  const clean = await checkGenerated({ root, content: true });
  assert.deepEqual(clean.errors, [], clean.errors.join("\n"));
  assert.equal(clean.summary.contentParity.mismatched, 0);

  // ruční edit generovaného adaptéru = drift
  const file = join(root, `content/dossiers/${SLUG}/claims/clm-2.md`);
  writeFileSync(file, readFileSync(file, "utf8").replace("CLM-2", "CLM-2-EDITED"));
  const drifted = await checkGenerated({ root, content: true });
  assert.ok(drifted.errors.some((e) => e.includes("content parity") && e.includes("clm-2.md")), drifted.errors.join("\n"));
});

// --- check-generated gate ------------------------------------------------

function generateAll(root) {
  const compiled = compiledOf(root);
  writeViewModels(buildViewModels(compiled), join(root, "data/generated/views"));
  writeStubs(buildStubs(compiled, { contentRoot: root }), join(root, STAGING_REL));
}

test("check-generated: čistý stav projde (bez routes.json jen warning)", async () => {
  const root = freshRoot();
  generateAll(root);
  const { errors, warnings } = await checkGenerated({ root });
  assert.deepEqual(errors, [], errors.join("\n"));
  assert.ok(warnings.some((w) => w.includes("routes.json")), warnings.join("\n"));
});

test("check-generated: chytí odebraný stub i sirotčí soubory", async () => {
  const root = freshRoot();
  generateAll(root);
  rmSync(join(root, STAGING_REL, "dossiers", SLUG, "claims", "clm-2.md"));
  put(root, `${STAGING_REL}/dossiers/${SLUG}/claims/clm-99.md`, "+++\ntitle = \"CLM-99\"\n+++\n");
  put(root, "data/generated/views/orphan.json", "{}\n");
  const { errors } = await checkGenerated({ root });
  assert.ok(errors.some((e) => e.includes("stub chybí") && e.includes("clm-2.md")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("sirotčí stub") && e.includes("clm-99.md")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("sirotčí view model") && e.includes("orphan.json")), errors.join("\n"));
});

test("check-generated: route parity vypíše rozdíly proti routes.json", async () => {
  const root = freshRoot();
  generateAll(root);
  // syntetický manifest: jedna routa navíc, jedna staging routa chybí
  const compiled = compiledOf(root);
  const manifest = Object.fromEntries(
    Object.entries(compiled.routes).map(([k, v]) => [k, { type: v.type, dossier: v.dossier, route: v.route }]),
  );
  manifest["dossiers"] = { type: "dossier-registry", dossier: null, route: "/dossiers/" };
  manifest["ENTITIES-INDEX"] = { type: "entity-index", dossier: null, route: "/entities/" };
  for (const registry of ["claims", "sources", "cases", "gaps", "relations"]) {
    manifest[`${registry.toUpperCase()}-INDEX:${SLUG}`] = { type: `${registry}-index`, dossier: SLUG, route: `/dossiers/${SLUG}/${registry}/` };
  }
  manifest["example-subject:CLM-77"] = { type: "claim", dossier: SLUG, route: `/dossiers/${SLUG}/claims/clm-77/` };
  put(root, "data/generated/routes.json", manifest);
  const { errors, summary } = await checkGenerated({ root });
  assert.equal(summary.routeParity.compared, true);
  assert.deepEqual(summary.routeParity.missing, [`/dossiers/${SLUG}/claims/clm-77/`]);
  assert.deepEqual(summary.routeParity.extra, []);
  assert.ok(errors.some((e) => e.includes("clm-77")), errors.join("\n"));
});

test("routeOfStubPath mapuje _index i záznamy na Zola routy", () => {
  assert.equal(routeOfStubPath("dossiers/_index.md"), "/dossiers/");
  assert.equal(routeOfStubPath(`dossiers/${SLUG}/_index.md`), `/dossiers/${SLUG}/`);
  assert.equal(routeOfStubPath(`dossiers/${SLUG}/claims/_index.md`), `/dossiers/${SLUG}/claims/`);
  assert.equal(routeOfStubPath(`dossiers/${SLUG}/claims/clm-2.md`), `/dossiers/${SLUG}/claims/clm-2/`);
  assert.equal(routeOfStubPath("entities/agrofert.md"), "/entities/agrofert/");
});
