// Testy orchestrace pipeline (T-028 fáze G) + parity helperu.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MODES } from "./pipeline.mjs";
import { hashTree, formatManifest } from "./hash-tree.mjs";

const ROOT = join(join(fileURLToPath(import.meta.url), "..", "..", ".."));
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

test("každý režim pipeline začíná kanonickou bránou data:validate", () => {
  for (const [mode, steps] of Object.entries(MODES)) {
    assert.equal(steps[0], "data:validate", `režim ${mode} musí začínat data:validate`);
  }
});

test("každý npm krok pipeline existuje v package.json", () => {
  for (const steps of Object.values(MODES)) {
    for (const step of steps) {
      if (typeof step !== "string") continue;
      assert.ok(pkg.scripts[step], `package.json nemá script "${step}"`);
    }
  }
});

test("build režim drží validátory a post-build verify brány", () => {
  // T-028 fáze H: validate:dossier/validate:schemas/validate:graph
  // zanikly — jejich pravidla vlastní kanonické validátory
  // (validate-references R1–R7, validate-semantics S1–S8,
  // validate-registry-table T1–T8, schemas/canonical/) v kroku
  // data:validate a schema brána exportů v build:data-exports.
  const steps = MODES.build;
  for (const validator of ["data:validate", "validate:navigation", "verify:anchors", "verify:jsonld", "verify:export"]) {
    assert.ok(steps.includes(validator), `build musí dál obsahovat ${validator}`);
  }
  for (const removed of ["validate:dossier", "validate:schemas", "validate:graph"]) {
    assert.ok(!steps.includes(removed), `${removed} zanikl s fází H — vlastníkem pravidel jsou kanonické validátory`);
  }
  // zola build musí běžet až po generátorech a před post-build verify
  const zolaIdx = steps.findIndex((s) => typeof s !== "string" && s.raw.includes("zola"));
  assert.ok(zolaIdx > steps.indexOf("build:search-index"));
  assert.ok(zolaIdx < steps.indexOf("verify:anchors"));
});

test("npm run build deleguje na pipeline (jediný entrypoint)", () => {
  assert.equal(pkg.scripts.build, "node scripts/build/pipeline.mjs build");
});

test("hash-tree: deterministický manifest a detekce změny", () => {
  const dir = mkdtempSync(join(tmpdir(), "hash-tree-"));
  try {
    mkdirSync(join(dir, "sub"));
    writeFileSync(join(dir, "a.json"), "{}\n");
    writeFileSync(join(dir, "sub", "b.json"), "[]\n");
    const first = formatManifest(hashTree(dir));
    const second = formatManifest(hashTree(dir));
    assert.equal(first, second, "dva běhy nad stejným stromem musí dát stejný manifest");
    assert.match(first, /^[0-9a-f]{64} {2}a\.json\n[0-9a-f]{64} {2}sub\/b\.json\n$/);
    writeFileSync(join(dir, "sub", "b.json"), "[1]\n");
    const third = formatManifest(hashTree(dir));
    assert.notEqual(first, third, "změna bajtů musí změnit manifest");
    assert.equal(first.split("\n")[0], third.split("\n")[0], "nezměněný soubor drží hash");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
