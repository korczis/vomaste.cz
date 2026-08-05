// Testy referenční integrity, redakční sémantiky a JSON-LD validace
// kanonického datasetu (T-028 fáze C). Zlé případy se vyrábějí mutací
// in-memory kopie syntetického fixture modelu — validátory pracují čistě
// nad modelem, takže žádné zlé soubory na disku nejsou potřeba.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalTree } from "./load.mjs";
import { validateReferences } from "./validate-references.mjs";
import { validateSemantics, loadAuthorizationIds, registeredDomain } from "./validate-semantics.mjs";
import { validateJsonLd, validateRecordJsonLd } from "./validate-jsonld.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURE = join(ROOT, "tests/fixtures/canonical/example-fixture");
const AUTHS = new Set(["AUTH-0000-00-00-TEST"]);

const baseModel = loadCanonicalTree(FIXTURE);
const clone = () => structuredClone(baseModel);
const find = (model, relPath) =>
  [...model.records, ...model.entities].find((w) => w.relPath === relPath) ?? null;

const CLAIM = "example-subject/claims/clm-01.json";
const SOURCE = "example-subject/sources/src-01.json";
const RELATION = "example-subject/relations/edge-example-org.json";
const DOSSIER = "example-subject/dossier.json";
const ORG = "_shared/entities/example-org.json";

// Přidá do modelu druhý syntetický balíček example-b s jedním zdrojem —
// cíl pro test cross-dossier kolize (cíl EXISTUJE, a přesto je odkaz chyba).
function addSecondPackage(model) {
  const source = structuredClone(find(model, SOURCE).record);
  source["@id"] = "https://vomaste.cz/id/dossiers/example-b/sources/SRC-01";
  source.dossier = { "@id": "https://vomaste.cz/id/dossiers/example-b" };
  source.claims = [];
  model.dossiers.push({ slug: "example-b", rootDir: join(FIXTURE, "example-b"), wrapper: null });
  model.records.push({ record: source, relPath: "example-b/sources/src-01.json", dossier: "example-b", registry: "sources" });
}

// --- validate-references -----------------------------------------------

test("fixture model projde referenční integritou beze zbytku", () => {
  assert.deepEqual(validateReferences(baseModel), []);
});

test("duplikátní @id je chyba", () => {
  const model = clone();
  find(model, "example-subject/gaps/gap-01.json").record["@id"] = find(model, CLAIM).record["@id"];
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes('duplikátní @id')), errors.join("\n"));
});

test("duplikátní identifier v rámci dossier+typ je chyba", () => {
  const model = clone();
  const dup = structuredClone(find(model, CLAIM));
  dup.relPath = "example-subject/claims/clm-02.json";
  dup.record["@id"] = "https://vomaste.cz/id/dossiers/example-subject/claims/CLM-02";
  // identifier zůstává CLM-01 → kolize v rámci dossieru+typu
  model.records.push(dup);
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes('duplikátní identifier "CLM-01"')), errors.join("\n"));
});

test("cross-dossier source reference je chyba, i když cíl existuje", () => {
  const model = clone();
  addSecondPackage(model);
  find(model, CLAIM).record.sources = [{ "@id": "https://vomaste.cz/id/dossiers/example-b/sources/SRC-01" }];
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes("cross-dossier") && e.includes(CLAIM)), errors.join("\n"));
});

test("reference na neexistující záznam je chyba", () => {
  const model = clone();
  find(model, CLAIM).record.sources = [{ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-99" }];
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes('neexistující záznam') && e.includes("SRC-99")), errors.join("\n"));
});

test("nesoulad cesty souboru a @id/identifieru je chyba (žádné implicitní vazby podle názvu)", () => {
  const model = clone();
  const claim = find(model, CLAIM);
  claim.record.identifier = "CLM-02"; // soubor se jmenuje clm-01.json
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes("neodpovídá umístění a identifieru")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes('očekávám cestu "example-subject/claims/clm-02.json"')), errors.join("\n"));
});

test("pole dossier musí ukazovat na vlastnící balíček", () => {
  const model = clone();
  find(model, CLAIM).record.dossier = { "@id": "https://vomaste.cz/id/dossiers/example-b" };
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes("neodpovídá vlastnícímu balíčku")), errors.join("\n"));
});

test("relation s neexistující entitou je chyba", () => {
  const model = clone();
  find(model, RELATION).record.targetEntity = { "@id": "https://vomaste.cz/id/entities/ghost" };
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes("neexistující entitu") && e.includes("ghost")), errors.join("\n"));
});

test("entity.dossiers musí odkazovat na existující balíčky", () => {
  const model = clone();
  find(model, ORG).record.dossiers = ["nonexistent-dossier"];
  const errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes('"nonexistent-dossier"')), errors.join("\n"));
});

test("claim mimo status-opinion musí mít aspoň jeden existující zdroj; status-opinion ne", () => {
  const model = clone();
  const claim = find(model, CLAIM);
  claim.record.sources = [];
  let errors = validateReferences(model);
  assert.ok(errors.some((e) => e.includes("nemá žádný existující citovaný zdroj")), errors.join("\n"));

  claim.record.status = "status-opinion";
  errors = validateReferences(model);
  assert.deepEqual(errors, []);
});

// --- validate-semantics --------------------------------------------------

test("fixture model projde sémantikou (s injektovanou autorizací) bez chyb i varování", () => {
  const { errors, warnings } = validateSemantics(baseModel, { authorizations: AUTHS });
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

// Přidá druhý zdroj SRC-02 do example-subject; family/outlet/url podle
// parametrů. Výchozí URL je jiná doména než SRC-01 — od pravidla S10 je
// shodná registrovaná doména sama o sobě důvodem nenezávislosti, takže
// klon se stejnou URL by testoval něco jiného, než co jeho název tvrdí.
function addSource(
  model,
  { sourceFamily = "", outlet = "Jiný deník", url = "https://jiny-denik.invalid/clanek/example-subject" } = {},
) {
  const src = structuredClone(find(model, SOURCE));
  src.relPath = "example-subject/sources/src-02.json";
  src.record["@id"] = "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02";
  src.record.identifier = "SRC-02";
  src.record.sourceFamily = sourceFamily;
  src.record.outlet = outlet;
  src.record.url = url;
  src.record.claims = [];
  model.records.push(src);
  return src;
}

test("status-single se 2 zdroji ze 2 nezávislých rodin je chyba", () => {
  const model = clone();
  addSource(model);
  find(model, CLAIM).record.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(errors.some((e) => e.includes("status-single cituje 2 zdroj(ů) z 2 nezávislých source families")), errors.join("\n"));
});

test("status-single se 2 zdroji TÉŽE rodiny je správně (nezávislost přes rodiny, 6b0bd4d)", () => {
  // Dva zdroje téže rodiny (převzatá agenturní zpráva) = jedno doložení;
  // kontrola slepá k rodinám by správnou opravu zablokovala.
  const model = clone();
  addSource(model, { sourceFamily: "ctk", outlet: "Deník B" });
  find(model, SOURCE).record.sourceFamily = "ctk";
  find(model, CLAIM).record.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(errors.filter((e) => e.includes("status-single")), [], errors.join("\n"));
});

test("status-corroborated s jedinou source family je chyba (sourceFamily i outlet fallback)", () => {
  // stejná explicitní rodina
  let model = clone();
  addSource(model, { sourceFamily: "ctk", outlet: "Deník B" });
  find(model, SOURCE).record.sourceFamily = "ctk";
  const claim = find(model, CLAIM).record;
  claim.status = "status-corroborated";
  claim.statusLabel = "POTVRZENO VÍCE ZDROJI";
  claim.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  let result = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(result.errors.some((e) => e.includes("status-corroborated") && e.includes("rodin")), result.errors.join("\n"));

  // chybějící rodina → rodina = outlet; stejný outlet = jedna rodina
  model = clone();
  addSource(model, { outlet: "Example Daily" });
  const claim2 = find(model, CLAIM).record;
  claim2.status = "status-corroborated";
  claim2.statusLabel = "POTVRZENO VÍCE ZDROJI";
  claim2.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  result = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(result.errors.some((e) => e.includes("status-corroborated")), result.errors.join("\n"));

  // dvě skutečně různé rodiny → OK
  model = clone();
  addSource(model, { outlet: "Jiný deník" });
  const claim3 = find(model, CLAIM).record;
  claim3.status = "status-corroborated";
  claim3.statusLabel = "POTVRZENO VÍCE ZDROJI";
  claim3.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  result = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(result.errors, []);
});

test("ne-kontextová hrana bez evidence je chyba; kontextová smí být bez ní", () => {
  const model = clone();
  const rel = find(model, RELATION).record;
  rel.claims = [];
  let { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(errors.some((e) => e.includes("nemá plnou evidenci")), errors.join("\n"));

  rel.status = "contextual";
  rel.sources = [];
  ({ errors } = validateSemantics(model, { authorizations: AUTHS }));
  assert.deepEqual(errors, []);
});

test("hrana single se 2 zdroji je chyba; corroborated s 1 rodinou je warning (zrcadlí validate-graph)", () => {
  const model = clone();
  addSource(model, { outlet: "Example Daily" });
  const rel = find(model, RELATION).record;
  rel.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  const single = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(single.errors.some((e) => e.includes('statusem "single" cituje 2')), single.errors.join("\n"));

  rel.status = "corroborated";
  const corr = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(corr.errors, []);
  assert.ok(corr.warnings.some((w) => w.includes("jedné source family")), corr.warnings.join("\n"));
});

test("neexistující autorizační záznam je chyba; prázdné authorization.records také", () => {
  const model = clone();
  find(model, DOSSIER).record.authorization.records = ["AUTH-9999-99-99-GHOST"];
  let { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(errors.some((e) => e.includes("AUTH-9999-99-99-GHOST") && e.includes("neexistuje")), errors.join("\n"));

  find(model, DOSSIER).record.authorization.records = [];
  ({ errors } = validateSemantics(model, { authorizations: AUTHS }));
  assert.ok(errors.some((e) => e.includes("bez authorization.records")), errors.join("\n"));
});

test("reálný registr autorizací se dá načíst a fixture id v něm opravdu není", () => {
  const real = loadAuthorizationIds();
  assert.ok(real.size > 0, "data/authorizations.toml má aspoň jeden záznam");
  assert.ok(!real.has("AUTH-0000-00-00-TEST"), "syntetický testovací záznam nesmí být v reálném registru");
});

test("kontextová entita nesmí být subjektem dossieru (subjectOf/dossierEnabled/authorized)", () => {
  const model = clone();
  const org = find(model, ORG).record;
  org.subjectOf = [{ "@id": "https://vomaste.cz/id/dossiers/example-subject" }];
  org.dossierEnabled = true;
  org.dossierStatus = "authorized";
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(errors.some((e) => e.includes("subjectOf")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("dossierEnabled=true")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes('"authorized"')), errors.join("\n"));
});

// --- S10: týž vydavatel nezakládá korroboraci ----------------------------
//
// Díra, kterou S10 zavírá: `familyOf` sahá po outletu jen u prázdné
// `sourceFamily`, takže dva články TÉHOŽ vydavatele — jeden s rodinou,
// druhý bez — dostaly různé klíče a S2 je brala jako dvě nezávislé
// redakce. Fixtury mutují jediné pole, aby bylo vidět, co přesně nález
// spouští.

const SRC02 = "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02";

// status-corroborated se dvěma zdroji, jejichž identitu vydavatele
// nastaví volající.
function corroboratedOn(model, sourceOptions) {
  addSource(model, sourceOptions);
  const claim = find(model, CLAIM).record;
  claim.status = "status-corroborated";
  claim.statusLabel = "POTVRZENO VÍCE ZDROJI";
  claim.sources.push({ "@id": SRC02 });
  return claim;
}

test("S10: týž outlet s rozdílnou sourceFamily NEZAKLÁDÁ korroboraci", () => {
  const model = clone();
  // SRC-01 zůstává bez rodiny (klíč `outlet:Example Daily`), SRC-02 má
  // rodinu `ctk` (klíč `family:ctk`) — pro S2 dvě rodiny, fakticky ale
  // jeden vydavatel. Přesně případ FORUM 24 SRC-10 + SRC-25.
  corroboratedOn(model, { sourceFamily: "ctk", outlet: "Example Daily", url: "https://jina-domena.invalid/x" });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(
    errors.some((e) => e.includes("žádná dvojice nepochází od dvou různých vydavatelů")),
    errors.join("\n"),
  );
  assert.ok(errors.some((e) => e.includes('týž outlet "Example Daily"')), errors.join("\n"));
});

test("S10: táž registrovaná doména NEZAKLÁDÁ korroboraci ani při jiném outletu", () => {
  const model = clone();
  // Regionální mutace téhož vydavatele: jiný název, jiná rodina, jedna
  // doména (`prazsky.denik.cz` i `denik.cz` → `denik.cz`).
  find(model, SOURCE).record.url = "https://www.denik.cz/clanek/a";
  corroboratedOn(model, {
    sourceFamily: "ctk",
    outlet: "Pražský deník",
    url: "https://prazsky.denik.cz/clanek/b",
  });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(
    errors.some((e) => e.includes("táž registrovaná doména denik.cz")),
    errors.join("\n"),
  );
});

test("S10: dva různí vydavatelé zůstávají korroborací (pravidlo nepřestřeluje)", () => {
  const model = clone();
  corroboratedOn(model, { sourceFamily: "ctk", outlet: "Jiný deník" });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(errors, []);
});

test("S10 nespojuje instituce pod sdíleným veřejným sufixem (edu.gov.cz vs mze.gov.cz)", () => {
  const model = clone();
  find(model, SOURCE).record.url = "https://edu.gov.cz/zprava";
  corroboratedOn(model, {
    sourceFamily: "",
    outlet: "Ministerstvo zemědělství ČR",
    url: "https://mze.gov.cz/zprava",
  });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(errors, []);
  assert.equal(registeredDomain("https://edu.gov.cz/x"), "edu.gov.cz");
  assert.equal(registeredDomain("https://domaci.hn.cz/c1-1"), "hn.cz");
  assert.equal(registeredDomain("https://www.forum24.cz/a"), "forum24.cz");
});

test("S10: status-single se dvěma články téhož outletu je SPRÁVNĚ, i když se rodiny liší", () => {
  // Zrcadlo prvního testu: co nezakládá korroboraci, nesmí ani nutit
  // k povýšení statusu. Bez tohohle by S1 hlásila „2 rodiny".
  const model = clone();
  addSource(model, { sourceFamily: "ctk", outlet: "Example Daily", url: "https://jina-domena.invalid/x" });
  find(model, CLAIM).record.sources.push({ "@id": SRC02 });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(errors, []);
});

test("S10 platí i pro hrany (S4) — v severitě hostitelského pravidla, tedy warning", () => {
  const model = clone();
  addSource(model, { sourceFamily: "ctk", outlet: "Example Daily", url: "https://jina-domena.invalid/x" });
  const rel = find(model, RELATION).record;
  rel.status = "corroborated";
  rel.sources.push({ "@id": SRC02 });
  const { errors, warnings } = validateSemantics(model, { authorizations: AUTHS });
  assert.deepEqual(errors, []);
  assert.ok(
    warnings.some((w) => w.includes("(S10)") && w.includes('týž outlet "Example Daily"')),
    warnings.join("\n"),
  );
});

test("S10 je grandfatherovatelné pravidlo (evidenční řada, na rozdíl od S5/S6)", () => {
  const model = clone();
  const claim = corroboratedOn(model, {
    sourceFamily: "ctk",
    outlet: "Example Daily",
    url: "https://jina-domena.invalid/x",
  });
  const baseline = [{ "@id": claim["@id"], rule: "S10", reason: "test" }];
  const { errors, warnings } = validateSemantics(model, { authorizations: AUTHS, baseline });
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => w.startsWith("baseline (grandfathered S10)")), warnings.join("\n"));
});

// --- validate-jsonld -----------------------------------------------------

test("všechny fixture záznamy projdou JSON-LD expanzí (lokální kontext, safe mode)", async () => {
  assert.deepEqual(await validateJsonLd(baseModel), []);
});

test("neznámý top-level klíč mimo kontext je pojmenovaná chyba", async () => {
  const record = structuredClone(find(baseModel, CLAIM).record);
  record.truthScore = 0.9;
  const errors = await validateRecordJsonLd(record, CLAIM);
  assert.ok(errors.some((e) => e.includes('klíč "truthScore"')), errors.join("\n"));
});

test("neznámý vnořený klíč chytí safe mode expanze", async () => {
  const record = structuredClone(find(baseModel, CLAIM).record);
  record.content[1].secretNote = "x"; // quote blok
  const errors = await validateRecordJsonLd(record, CLAIM);
  assert.ok(errors.some((e) => e.includes("expanze selhala")), errors.join("\n"));
});

test("$schema je jediný povolený ne-sémantický klíč a expanze zachovává @id", async () => {
  const record = structuredClone(find(baseModel, SOURCE).record);
  assert.ok(record.$schema, "fixture záznam nese $schema");
  const errors = await validateRecordJsonLd(record, SOURCE);
  assert.deepEqual(errors, []);
});

test("cizí @context URL je chyba, žádný network fetch", async () => {
  const record = structuredClone(find(baseModel, CLAIM).record);
  record["@context"] = "https://schema.org";
  const errors = await validateRecordJsonLd(record, CLAIM);
  assert.ok(errors.some((e) => e.includes("nejde načíst")), errors.join("\n"));
});

// --- S9: provenance refs entit ------------------------------------------

test("S9: provenance ref rozlišitelný v dossieru entity projde", () => {
  const model = clone();
  find(model, ORG).record.provenance = {
    discoveredAt: "2026-08-02",
    discoveredVia: ["test"],
    claimRefs: ["CLM-01"],
    sourceRefs: ["SRC-01"],
  };
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(!errors.some((e) => e.includes("S9") || e.includes("provenance")), errors.join("\n"));
});

test("S9: provenance ref na neexistující SRC v dossierech entity je chyba", () => {
  const model = clone();
  find(model, ORG).record.provenance = {
    discoveredAt: "2026-08-02",
    discoveredVia: ["test"],
    sourceRefs: ["SRC-99"],
  };
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(
    errors.some((e) => e.includes('provenance.sourceRefs "SRC-99"')),
    errors.join("\n"),
  );
});

test("S9: ref mimo pole dossiers entity je chyba i když jinde existuje", () => {
  const model = clone();
  addSecondPackage(model);
  const org = find(model, ORG).record;
  org.dossiers = ["example-b"]; // v example-b existuje jen SRC-01, žádný CLM-01
  org.provenance = {
    discoveredAt: "2026-08-02",
    discoveredVia: ["test"],
    claimRefs: ["CLM-01"],
  };
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(
    errors.some((e) => e.includes('provenance.claimRefs "CLM-01"')),
    errors.join("\n"),
  );
});
