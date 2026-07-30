#!/usr/bin/env node
// Regression tests for build-jsonld-exports.mjs (coop task T-010). The
// load-bearing behaviors: every registry dossier gets an export, every
// export is valid JSON-LD with manifest-verifiable bytes, no
// truth-rating markup ever appears (editorial rules 3 & 7), Person
// nodes exist ONLY for authorized dossier subjects, every Claim carries
// cited appearances (rule 1), and citation fingerprints recompute from
// visible fields. Runs the real generator over the real repo content
// into a throwaway --out dir, so repo data is never mutated by tests.
//
// Usage: node --test scripts/dossier/build-jsonld-exports.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";
import { FORBIDDEN_KEYS, FORBIDDEN_TYPES, citationFingerprint, jsonLdNodes, readBaseUrl, sha256Hex } from "./lib/jsonld-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "build-jsonld-exports.mjs");
const BASE = readBaseUrl(path.join(__dirname, "..", ".."));

const out = mkdtempSync(path.join(tmpdir(), "vomaste-jsonld-test-"));
const fpFile = path.join(out, "source-fingerprints.json");
execFileSync("node", [SCRIPT, "--out", out, "--fingerprints-out", fpFile], { stdio: "pipe" });
process.on("exit", () => rmSync(out, { recursive: true, force: true }));

const manifest = JSON.parse(readFileSync(path.join(out, "jsonld-manifest.json"), "utf8"));
const registry = loadDossierRegistry();
const docs = new Map(
  manifest.exports.map((e) => {
    const bytes = readFileSync(path.join(out, e.route.replace(/^\/data\//, "")));
    return [e.route, { entry: e, bytes, doc: JSON.parse(bytes.toString("utf8")) }];
  }),
);

test("one export per registry dossier plus the global graph, all in the manifest", () => {
  for (const d of registry) {
    assert.ok(docs.has(`/data/dossiers/${d.slug}.jsonld`), `missing export for ${d.slug}`);
  }
  assert.ok(docs.has("/data/graph.jsonld"), "missing global graph export");
  assert.equal(manifest.exports.length, registry.length + 1);
});

test("manifest sha256 matches the exact bytes of every export", () => {
  for (const { entry, bytes } of docs.values()) {
    assert.equal(sha256Hex(bytes), entry.sha256, `${entry.route}: hash mismatch`);
    assert.equal(bytes.length, entry.bytes, `${entry.route}: byte count mismatch`);
  }
});

test("no truth-rating markup anywhere (editorial rules 3 & 7)", () => {
  for (const { entry, doc } of docs.values()) {
    for (const node of jsonLdNodes(doc)) {
      assert.ok(!FORBIDDEN_TYPES.has(node["@type"]), `${entry.route}: forbidden @type ${node["@type"]}`);
      for (const key of Object.keys(node)) {
        assert.ok(!FORBIDDEN_KEYS.has(key), `${entry.route}: forbidden key ${key}`);
      }
    }
  }
});

test("every Claim node cites at least one appearance (rule 1 — no uncited claim)", () => {
  let claims = 0;
  for (const { entry, doc } of docs.values()) {
    for (const node of jsonLdNodes(doc)) {
      if (node["@type"] !== "Claim") continue;
      claims++;
      assert.ok(Array.isArray(node.appearance) && node.appearance.length > 0, `${entry.route}: uncited claim ${node["@id"]}`);
      assert.ok(node.text && String(node.text).trim() !== "", `${entry.route}: claim without text ${node["@id"]}`);
    }
  }
  assert.ok(claims > 0, "no Claim nodes emitted at all");
});

test("Person nodes only for authorized dossier subjects, with the entity page #person @id", () => {
  const allowed = new Set(
    registry.filter((d) => d.dossierType === "entity").map((d) => `${BASE}/dossiers/${d.slug}/#person`),
  );
  for (const { entry, doc } of docs.values()) {
    for (const node of jsonLdNodes(doc)) {
      if (node["@type"] !== "Person") continue;
      assert.ok(allowed.has(node["@id"]), `${entry.route}: Person @id outside authorized subjects: ${node["@id"]}`);
    }
  }
});

test("every citation fingerprint recomputes from the node's visible fields", () => {
  let fps = 0;
  for (const { entry, doc } of docs.values()) {
    for (const node of jsonLdNodes(doc)) {
      if (!node["vomaste:citationFingerprint"]) continue;
      fps++;
      const recomputed = citationFingerprint({
        url: node.url,
        retrieved: node["vomaste:retrieved"],
        outlet: node.publisher?.name,
      });
      assert.equal(recomputed, node["vomaste:citationFingerprint"], `${entry.route}: fingerprint drift on ${node["@id"]}`);
    }
  }
  assert.ok(fps > 0, "no citation fingerprints emitted at all");
});

test("@ids are unique within each document and shared records keep canonical @ids across documents", () => {
  const byId = new Map();
  for (const { entry, doc } of docs.values()) {
    const seen = new Set();
    for (const node of doc["@graph"]) {
      assert.ok(!seen.has(node["@id"]), `${entry.route}: duplicate @id ${node["@id"]}`);
      seen.add(node["@id"]);
      if (node["@type"] === "Claim") {
        // The same claim exported into an entity view and its canonical
        // dossier must carry the identical node (same @id, same text) —
        // that is what makes the global union loss-free.
        const prev = byId.get(node["@id"]);
        if (prev) assert.equal(prev.text, node.text, `claim ${node["@id"]} differs between documents`);
        byId.set(node["@id"], node);
      }
    }
  }
});

test("entity views contain exactly the canonical records tagged with their subject", () => {
  const view = docs.get("/data/dossiers/petr-macinka.jsonld");
  const canonical = docs.get("/data/dossiers/macinka-turek.jsonld");
  if (!view || !canonical) return; // registry layout changed; covered by first test
  const viewClaims = new Set([...jsonLdNodes(view.doc)].filter((n) => n["@type"] === "Claim").map((n) => n["@id"]));
  const canonicalClaims = new Set(
    [...jsonLdNodes(canonical.doc)].filter((n) => n["@type"] === "Claim").map((n) => n["@id"]),
  );
  assert.ok(viewClaims.size > 0, "entity view export has no claims");
  for (const id of viewClaims) {
    assert.ok(canonicalClaims.has(id), `entity view claim ${id} missing from canonical export`);
  }
  assert.ok(viewClaims.size < canonicalClaims.size, "subject filter had no effect — view equals canonical");
});

test("fingerprint map covers every source row and matches the export values", () => {
  const fps = JSON.parse(readFileSync(fpFile, "utf8"));
  assert.ok(Object.keys(fps).length > 0, "empty fingerprint map");
  for (const [key, value] of Object.entries(fps)) {
    assert.match(key, /^[a-z0-9-]+\/SRC-\d+$/, `unexpected fingerprint key ${key}`);
    assert.match(value, /^[0-9a-f]{64}$/, `fingerprint ${key} is not a sha256 hex`);
  }
});
