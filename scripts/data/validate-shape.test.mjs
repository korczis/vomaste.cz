// Testy tvarového validátoru kanonického datového modelu (T-028 fáze B).
// Fixture data v tests/fixtures/canonical/example-fixture/ jsou plně
// syntetická — žádná reálná osoba, žádná reálná událost.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createValidators,
  validateRecordObject,
  validateShapeTree,
  RECORDS_ROOT,
} from "./validate-shape.mjs";
import { documentLoader, contextFileFor } from "./lib/context-loader.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURE = join(ROOT, "tests/fixtures/canonical/example-fixture");
const VOCAB_DIR = join(ROOT, "data/dossiers/_shared/vocabularies");

const loadFixture = (rel) => JSON.parse(readFileSync(join(FIXTURE, rel), "utf8"));

test("všechna kanonická schémata se zkompilují v Ajv2020 strict módu", () => {
  const { byRecordType, vocabulary } = createValidators();
  assert.deepEqual(
    Object.keys(byRecordType).sort(),
    ["case", "claim", "dossier", "entity", "gap", "relation", "source", "update"],
  );
  assert.ok(vocabulary);
});

test("validní syntetický fixture dossier projde beze zbytku", () => {
  const { errors, records } = validateShapeTree(FIXTURE);
  assert.deepEqual(errors, []);
  assert.equal(records, 7, "fixture má 7 kanonických záznamů (dossier + claim + source + case + gap + relation + update)");
});

test("chybějící povinné pole selže s cestou k souboru i poli", () => {
  const claim = loadFixture("claims/clm-01.json");
  delete claim.text;
  const errors = validateRecordObject(claim, "claims/clm-01.json");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^claims\/clm-01\.json: \(root\) must have required property 'text'/);
});

test("neznámý claim status selže na /status", () => {
  const claim = loadFixture("claims/clm-01.json");
  claim.status = "status-verified";
  const errors = validateRecordObject(claim, "claims/clm-01.json");
  assert.ok(errors.some((e) => e.includes("/status") && e.includes("must be equal to one of the allowed values")), errors.join("\n"));
});

test("cizí pole neprojde (additionalProperties:false) a hláška ho jmenuje", () => {
  const claim = loadFixture("claims/clm-01.json");
  claim.truthScore = 0.9;
  const errors = validateRecordObject(claim, "claims/clm-01.json");
  assert.ok(errors.some((e) => e.includes('cizí pole "truthScore"')), errors.join("\n"));
});

test("špatný @id prefix (mimo https://vomaste.cz/id/…) selže na /@id", () => {
  const claim = loadFixture("claims/clm-01.json");
  claim["@id"] = "https://example.com/id/dossiers/example-subject/claims/CLM-01";
  const errors = validateRecordObject(claim, "claims/clm-01.json");
  assert.ok(errors.some((e) => e.includes("/@id") && e.includes("must match pattern")), errors.join("\n"));
});

test("odkaz na zdroj musí být idRef objekt se správným tvarem IRI", () => {
  const claim = loadFixture("claims/clm-01.json");
  claim.sources = ["SRC-01"];
  const errors = validateRecordObject(claim, "claims/clm-01.json");
  assert.ok(errors.some((e) => e.includes("/sources/0")), errors.join("\n"));
});

test("claim mimo status-opinion vyžaduje aspoň jeden zdroj; status-opinion smí mít prázdné sources", () => {
  const claim = loadFixture("claims/clm-01.json");
  claim.sources = [];
  const errors = validateRecordObject(claim, "claims/clm-01.json");
  assert.ok(errors.some((e) => e.includes("/sources") && e.includes("fewer than 1 items")), errors.join("\n"));

  claim.status = "status-opinion";
  claim.statusLabel = "NÁZOR";
  assert.deepEqual(validateRecordObject(claim, "claims/clm-01.json"), []);
});

test("ne-kontextová hrana vyžaduje claims i sources; kontextová smí být bez obou", () => {
  const rel = loadFixture("relations/edge-example-org.json");
  rel.sources = [];
  let errors = validateRecordObject(rel, "relations/edge-example-org.json");
  assert.ok(errors.some((e) => e.includes("/sources") && e.includes("fewer than 1 items")), errors.join("\n"));

  rel.status = "contextual";
  rel.claims = [];
  assert.deepEqual(validateRecordObject(rel, "relations/edge-example-org.json"), []);
});

test("relationType mimo ALLOWED_RELATIONS neprojde", () => {
  const rel = loadFixture("relations/edge-example-org.json");
  rel.relationType = "FRIENDS_WITH";
  const errors = validateRecordObject(rel, "relations/edge-example-org.json");
  assert.ok(errors.some((e) => e.includes("/relationType")), errors.join("\n"));
});

test("syntetický entity záznam projde a hlídá enumy entityType/coverageState", () => {
  const entity = {
    $schema: "https://vomaste.cz/schemas/canonical/entity.schema.json",
    schemaVersion: 1,
    "@context": "https://vomaste.cz/context/v1.jsonld",
    "@id": "https://vomaste.cz/id/entities/example-entity",
    "@type": "vomaste:Entity",
    recordType: "entity",
    identifier: "example-entity",
    entityId: "example-entity",
    title: "Example Subject",
    entityType: "person",
    publicationRole: "subject",
    dossierEnabled: true,
    dossierStatus: "authorized",
    coverageState: "full",
    dossiers: ["example-subject"],
    subjectOf: [{ "@id": "https://vomaste.cz/id/dossiers/example-subject" }],
  };
  // $schema klíč v datech je literál — v testu ho JS objekt zapisuje bez uvozovek jen jako klíč "$schema"
  assert.deepEqual(validateRecordObject(entity, "_shared/entities/example-entity.json"), []);

  const bad = { ...entity, entityType: "alien" };
  const errors = validateRecordObject(bad, "_shared/entities/example-entity.json");
  assert.ok(errors.some((e) => e.includes("/entityType")), errors.join("\n"));
});

test("entity dossier bez autorizace neprojde; aggregate vyžaduje aggregates", () => {
  const dossier = loadFixture("dossier.json");
  delete dossier.authorization;
  let errors = validateRecordObject(dossier, "dossier.json");
  assert.ok(errors.some((e) => e.includes("'authorization'")), errors.join("\n"));

  const agg = loadFixture("dossier.json");
  agg.dossierType = "aggregate";
  delete agg.canonicalDossier;
  delete agg.subject;
  errors = validateRecordObject(agg, "dossier.json");
  assert.ok(errors.some((e) => e.includes("'aggregates'")), errors.join("\n"));
  agg.aggregates = ["example-a", "example-b"];
  assert.deepEqual(validateRecordObject(agg, "dossier.json"), []);
});

test("neznámý recordType je srozumitelná chyba, ne pád", () => {
  const errors = validateRecordObject({ recordType: "wiretap" }, "x.json");
  assert.equal(errors.length, 1);
  assert.match(errors[0], /neznámý nebo chybějící recordType "wiretap"/);
});

test("slovníky v repu odpovídají mini-schématu a jsou synchronní s enumy v _defs", () => {
  const { ajv } = createValidators();
  const defs = JSON.parse(readFileSync(join(ROOT, "schemas/canonical/_defs.schema.json"), "utf8")).$defs;
  const vocabValues = (name) =>
    JSON.parse(readFileSync(join(VOCAB_DIR, `${name}.json`), "utf8")).values.map((v) => v.value);

  assert.deepEqual(vocabValues("claim-statuses").sort(), [...defs.claimStatus.enum].sort());
  assert.deepEqual(vocabValues("entity-types").sort(), [...defs.entityType.enum].sort());
  assert.deepEqual(vocabValues("relation-types").sort(), [...defs.relationType.enum].sort());
  assert.deepEqual(vocabValues("coverage-states").sort(), [...defs.coverageState.enum].sort());
  // source-types je záměrně otevřená množina — jen mini-schéma, žádný enum.
  assert.ok(ajv);
});

test("strom data/dossiers projde (dnes: 0 kanonických záznamů, slovníky validní)", () => {
  const { errors, vocabularies } = validateShapeTree(RECORDS_ROOT);
  assert.deepEqual(errors, []);
  assert.equal(vocabularies, 5);
});

test("context loader vrací lokální kontext pro veřejnou URL a mapuje verze", () => {
  const url = "https://vomaste.cz/context/v1.jsonld";
  const { document, documentUrl, contextUrl } = documentLoader(url);
  assert.equal(documentUrl, url);
  assert.equal(contextUrl, null);
  assert.equal(document["@context"].vomaste, "https://vomaste.cz/ns#");
  assert.match(contextFileFor(url), /data\/dossiers\/_shared\/context\/vomaste-v1\.jsonld$/);
});

test("context loader odmítá cizí URL i neexistující verzi — žádný network fetch", () => {
  assert.throws(() => documentLoader("https://schema.org"), /network fetch disabled during build/);
  assert.throws(() => documentLoader("http://vomaste.cz/context/v1.jsonld"), /network fetch disabled/);
  assert.throws(() => documentLoader("https://vomaste.cz/context/v99.jsonld"), /neexistující lokální verzi/);
});
