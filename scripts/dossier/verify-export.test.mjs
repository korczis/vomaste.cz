#!/usr/bin/env node
// Regression tests for verify-export.mjs (coop task T-010). The
// load-bearing behavior is the offline guarantee: a downloaded copy of
// the /data/*.jsonld exports either matches its manifest byte for byte
// or the verifier fails loudly — and forbidden truth-rating markup
// fails even when the hash is technically consistent (a regenerated
// malicious manifest must not smuggle ClaimReview past the gate).
//
// Usage: node --test scripts/dossier/verify-export.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha256Hex } from "./lib/jsonld-shared.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD_SCRIPT = path.join(__dirname, "build-jsonld-exports.mjs");
const VERIFY_SCRIPT = path.join(__dirname, "verify-export.mjs");

function run(dir) {
  try {
    const out = execFileSync("node", [VERIFY_SCRIPT, "--dir", dir], { stdio: "pipe" });
    return { status: 0, out: out.toString() };
  } catch (err) {
    return { status: err.status, out: (err.stdout || "").toString() + (err.stderr || "").toString() };
  }
}

// A fake "downloaded site root": <root>/data/… exactly as GitHub Pages
// would serve it.
function makeSiteCopy() {
  const site = mkdtempSync(path.join(tmpdir(), "vomaste-verify-test-"));
  const dataDir = path.join(site, "data");
  mkdirSync(dataDir, { recursive: true });
  execFileSync(
    "node",
    [BUILD_SCRIPT, "--out", dataDir, "--fingerprints-out", path.join(site, "fingerprints.json")],
    { stdio: "pipe" },
  );
  return site;
}

test("a faithful copy of the exports verifies clean", () => {
  const site = makeSiteCopy();
  try {
    const { status, out } = run(site);
    assert.equal(status, 0, out);
    assert.match(out, /OK — every export matches its manifest hash/);
  } finally {
    rmSync(site, { recursive: true, force: true });
  }
});

test("a single altered byte fails the manifest hash check", () => {
  const site = makeSiteCopy();
  try {
    const target = path.join(site, "data", "graph.jsonld");
    writeFileSync(target, readFileSync(target, "utf8").replace("Dataset", "DataSet"));
    const { status, out } = run(site);
    assert.notEqual(status, 0);
    assert.match(out, /sha256 mismatch/);
  } finally {
    rmSync(site, { recursive: true, force: true });
  }
});

test("forbidden truth-rating markup fails even with a consistent manifest", () => {
  const site = makeSiteCopy();
  try {
    const target = path.join(site, "data", "graph.jsonld");
    const doc = JSON.parse(readFileSync(target, "utf8"));
    doc["@graph"].push({ "@type": "ClaimReview", "@id": "https://example.invalid/#review", name: "smuggled" });
    const body = JSON.stringify(doc, null, 1) + "\n";
    writeFileSync(target, body);
    // Re-hash the manifest the way an attacker regenerating it would.
    const manifestPath = path.join(site, "data", "jsonld-manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const e of manifest.exports) {
      if (e.route === "/data/graph.jsonld") {
        e.sha256 = sha256Hex(Buffer.from(body, "utf8"));
        e.bytes = Buffer.byteLength(body, "utf8");
      }
    }
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
    const { status, out } = run(site);
    assert.notEqual(status, 0);
    assert.match(out, /forbidden @type "ClaimReview"/);
  } finally {
    rmSync(site, { recursive: true, force: true });
  }
});

test("a missing export file listed in the manifest fails", () => {
  const site = makeSiteCopy();
  try {
    rmSync(path.join(site, "data", "dossiers", "oto-klempir.jsonld"), { force: true });
    const { status, out } = run(site);
    assert.notEqual(status, 0);
    assert.match(out, /does not exist/);
  } finally {
    rmSync(site, { recursive: true, force: true });
  }
});
