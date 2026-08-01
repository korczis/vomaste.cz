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
import { validateSemantics, loadAuthorizationIds } from "./validate-semantics.mjs";
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

// Přidá druhý zdroj SRC-02 do example-subject; family/outlet podle parametrů.
function addSource(model, { sourceFamily = "", outlet = "Jiný deník" } = {}) {
  const src = structuredClone(find(model, SOURCE));
  src.relPath = "example-subject/sources/src-02.json";
  src.record["@id"] = "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02";
  src.record.identifier = "SRC-02";
  src.record.sourceFamily = sourceFamily;
  src.record.outlet = outlet;
  src.record.claims = [];
  model.records.push(src);
  return src;
}

test("status-single se 2 zdroji je chyba", () => {
  const model = clone();
  addSource(model);
  find(model, CLAIM).record.sources.push({ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-02" });
  const { errors } = validateSemantics(model, { authorizations: AUTHS });
  assert.ok(errors.some((e) => e.includes("status-single cituje 2 zdrojů")), errors.join("\n"));
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
