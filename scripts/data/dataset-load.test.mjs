// Testy discovery a loaderu kanonického datasetu (T-028 fáze C).
// Fixture tests/fixtures/canonical/example-fixture/ je plně syntetická
// (žádná reálná osoba); zlé stromy se staví v runtime temp adresáři.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverDossierPackages } from "./discover.mjs";
import { loadCanonicalTree } from "./load.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURE = join(ROOT, "tests/fixtures/canonical/example-fixture");

const makeTempRoot = () => mkdtempSync(join(tmpdir(), "canonical-fixture-"));

test("discover najde balíček podle dossier.json, přeskočí _shared a řadí deterministicky", () => {
  const root = makeTempRoot();
  try {
    for (const slug of ["zeta", "alpha"]) {
      mkdirSync(join(root, slug), { recursive: true });
      writeFileSync(join(root, slug, "dossier.json"), "{}");
    }
    mkdirSync(join(root, "_shared", "entities"), { recursive: true });
    writeFileSync(join(root, "_shared", "entities", "x.json"), "{}");
    // adresář bez dossier.json není balíček; vnořený dossier.json se nehledá (žádná rekurze)
    mkdirSync(join(root, "not-a-package", "nested"), { recursive: true });
    writeFileSync(join(root, "not-a-package", "nested", "dossier.json"), "{}");

    const found = discoverDossierPackages(root);
    assert.deepEqual(found.map((p) => p.slug), ["alpha", "zeta"]);
    assert.equal(found[0].rootDir, join(root, "alpha"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("discover na example-fixture vrací example-subject", () => {
  assert.deepEqual(discoverDossierPackages(FIXTURE).map((p) => p.slug), ["example-subject"]);
});

test("discover na neexistujícím rootu vrací prázdný seznam", () => {
  assert.deepEqual(discoverDossierPackages(join(FIXTURE, "does-not-exist")), []);
});

test("load načte celý fixture balíček + sdílené entity s korektními wrappery", () => {
  const model = loadCanonicalTree(FIXTURE);
  assert.equal(model.root, FIXTURE);
  assert.equal(model.dossiers.length, 1);
  assert.equal(model.records.length, 7, "dossier + claim + source + case + gap + relation + update");
  assert.equal(model.entities.length, 2);
  assert.deepEqual(model.vocabularies, [], "fixture root nemá vlastní slovníky");

  const claim = model.records.find((w) => w.relPath === "example-subject/claims/clm-01.json");
  assert.ok(claim);
  assert.equal(claim.dossier, "example-subject");
  assert.equal(claim.registry, "claims");
  assert.equal(claim.record.identifier, "CLM-01");

  const dossier = model.records.find((w) => w.registry === "dossier");
  assert.equal(dossier.relPath, "example-subject/dossier.json");
  assert.equal(model.dossiers[0].wrapper, dossier);

  const entity = model.entities.find((w) => w.relPath === "_shared/entities/example-entity.json");
  assert.equal(entity.dossier, null);
  assert.equal(entity.registry, "entities");
});

test("load hlásí chybu parsování s cestou k souboru a selže jako celek", () => {
  const root = makeTempRoot();
  try {
    mkdirSync(join(root, "broken", "claims"), { recursive: true });
    writeFileSync(join(root, "broken", "dossier.json"), "{}");
    writeFileSync(join(root, "broken", "claims", "clm-01.json"), "{ not json");
    assert.throws(
      () => loadCanonicalTree(root),
      (e) => e.message.includes("broken/claims/clm-01.json") && e.message.includes("neplatný JSON"),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("load odmítne JSON v neznámém registry adresáři i stray JSON na kořeni balíčku", () => {
  const root = makeTempRoot();
  try {
    mkdirSync(join(root, "pkg", "wiretaps"), { recursive: true });
    writeFileSync(join(root, "pkg", "dossier.json"), "{}");
    writeFileSync(join(root, "pkg", "wiretaps", "x.json"), "{}");
    writeFileSync(join(root, "pkg", "extra.json"), "{}");
    assert.throws(
      () => loadCanonicalTree(root),
      (e) => e.message.includes("pkg/wiretaps") && e.message.includes("pkg/extra.json"),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
