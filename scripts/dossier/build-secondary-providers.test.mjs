#!/usr/bin/env node
// Regression tests for build-secondary-providers.mjs (coop task T-011).
// Load-bearing behaviors: every dossier the primary registry knows about
// gets a secondary-nav entry with no hardcoded slug leaking in (every
// slug/route/count traces back to the compiled model or navigation.toml's
// dossier-free registry list); aggregate dossiers get no registry
// subtree; entity dossiers' per-registry counts match direct compiled-
// model counts; the entity explorer's facets sum to the row count.
// Runs the real generator over the real repo content into a throwaway
// --out dir, so repo data is never mutated by tests.

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "build-secondary-providers.mjs");
const REPO_ROOT = path.join(__dirname, "..", "..");

const out = mkdtempSync(path.join(tmpdir(), "vomaste-secondary-providers-test-"));
execFileSync("node", [SCRIPT, "--out", out], { stdio: "pipe" });
process.on("exit", () => rmSync(out, { recursive: true, force: true }));

const secondary = JSON.parse(readFileSync(path.join(out, "navigation-secondary.json"), "utf8"));
const catalog = JSON.parse(readFileSync(path.join(out, "dossier-catalog.json"), "utf8"));
const explorer = JSON.parse(readFileSync(path.join(out, "entity-explorer.json"), "utf8"));
const registry = loadDossierRegistry();

test("navigation-secondary.json has exactly one entry per known dossier, no more, no fewer", () => {
  const slugs = registry.map((d) => d.slug).sort();
  assert.deepEqual(Object.keys(secondary).sort(), slugs);
});

test("aggregate dossiers carry no registry subtree, entity dossiers carry all navigation.toml registries", () => {
  const navToml = readFileSync(path.join(REPO_ROOT, "data/navigation.toml"), "utf8");
  const registryCount = [...navToml.matchAll(/\[\[registries\]\]/g)].length;
  for (const d of registry) {
    const entry = secondary[d.slug];
    if (d.dossierType === "entity") {
      assert.equal(entry.isAggregate, false);
      assert.equal(entry.registries.length, registryCount, `${d.slug} missing a registry`);
    } else {
      assert.equal(entry.isAggregate, true);
      assert.deepEqual(entry.registries, []);
    }
  }
});

test("every secondary-nav registry route is dossier-scoped under that dossier's own route", () => {
  for (const [slug, entry] of Object.entries(secondary)) {
    for (const r of entry.registries) {
      assert.ok(r.route.startsWith(`/dossiers/${slug}/`), `${slug}/${r.id} route "${r.route}" is not scoped to its own dossier`);
    }
  }
});

test("dossier-catalog.json has one row per dossier, same slugs as navigation-secondary.json", () => {
  assert.equal(catalog.count, catalog.rows.length);
  assert.deepEqual(
    catalog.rows.map((r) => r.slug).sort(),
    Object.keys(secondary).sort(),
  );
});

test("entity-explorer facets sum to the row count (no entity double-counted or dropped in byType/byRole)", () => {
  assert.equal(explorer.count, explorer.rows.length);
  const byTypeSum = Object.values(explorer.facets.byType).reduce((a, b) => a + b, 0);
  const byRoleSum = Object.values(explorer.facets.byRole).reduce((a, b) => a + b, 0);
  assert.equal(byTypeSum, explorer.count);
  assert.equal(byRoleSum, explorer.count);
});

test("entity-explorer rows carry no dossier reference the catalog does not also know about", () => {
  const catalogSlugs = new Set(catalog.rows.map((r) => r.slug));
  for (const row of explorer.rows) {
    for (const d of row.dossiers) {
      assert.ok(catalogSlugs.has(d.slug), `entity "${row.entityId}" references unknown dossier "${d.slug}"`);
    }
  }
});

test("running the generator twice produces byte-identical output (deterministic)", () => {
  const out2 = mkdtempSync(path.join(tmpdir(), "vomaste-secondary-providers-test2-"));
  try {
    execFileSync("node", [SCRIPT, "--out", out2], { stdio: "pipe" });
    for (const file of ["navigation-secondary.json", "dossier-catalog.json", "entity-explorer.json"]) {
      assert.equal(readFileSync(path.join(out, file), "utf8"), readFileSync(path.join(out2, file), "utf8"), `${file} differs between two runs`);
    }
  } finally {
    rmSync(out2, { recursive: true, force: true });
  }
});
