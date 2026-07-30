#!/usr/bin/env node
/*
 * Offline verifier for the /data/*.jsonld exports (coop task T-010,
 * docs/adr/dossier-jsonld-provenance-extension.md "Adopt 2"). Anyone —
 * a fork, a downloader, a journalist double-checking the dataset — can
 * run this against a downloaded copy to confirm nothing was altered
 * post-export:
 *
 *   node scripts/dossier/verify-export.mjs --dir <downloaded-site-root>
 *
 * Default --dir is the local build output (public/), which makes this
 * the build gate for the export files, running after `zola build`.
 *
 * Checks, in order:
 *   1. every export listed in /data/jsonld-manifest.json exists and its
 *      bytes hash to the recorded sha256;
 *   2. every export parses as JSON and carries @context + @graph;
 *   3. no node anywhere contains truth-adjudicating markup (ClaimReview,
 *      Rating, reviewRating, …) — same editorial rules 3 & 7 the HTML
 *      verifier (verify-jsonld.mjs) enforces;
 *   4. every Claim node has a non-empty `appearance` (rule 1 — no
 *      uncited claim) and every @id is unique within its document;
 *   5. every vomaste:citationFingerprint recomputes from the node's own
 *      visible fields (url + vomaste:retrieved + publisher.name) — the
 *      fingerprint is provenance you can check, not a decoration.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FORBIDDEN_KEYS, FORBIDDEN_TYPES, citationFingerprint, jsonLdNodes, sha256Hex } from "./lib/jsonld-shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const dirFlag = args.indexOf("--dir");
const DIR = dirFlag !== -1 && args[dirFlag + 1] ? args[dirFlag + 1] : join(ROOT, "public");

const errors = [];
const err = (msg) => errors.push(msg);

const manifestPath = join(DIR, "data/jsonld-manifest.json");
if (!existsSync(manifestPath)) {
  console.error(`FAILED — manifest not found: ${manifestPath}`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!Array.isArray(manifest.exports) || manifest.exports.length === 0) {
  console.error("FAILED — manifest lists no exports.");
  process.exit(1);
}

let checkedFiles = 0;
let checkedNodes = 0;
let checkedFingerprints = 0;

for (const entry of manifest.exports) {
  const file = join(DIR, entry.route.replace(/^\//, ""));
  const tag = entry.route;
  if (!existsSync(file)) {
    err(`${tag}: file listed in manifest does not exist.`);
    continue;
  }
  checkedFiles++;
  const bytes = readFileSync(file);
  const digest = sha256Hex(bytes);
  if (digest !== entry.sha256) {
    err(`${tag}: sha256 mismatch — manifest ${entry.sha256}, file ${digest}. The export was altered after generation.`);
    continue;
  }

  let doc;
  try {
    doc = JSON.parse(bytes.toString("utf8"));
  } catch (e) {
    err(`${tag}: does not parse as JSON: ${e.message}`);
    continue;
  }
  if (!doc["@context"] || !Array.isArray(doc["@graph"])) {
    err(`${tag}: missing @context or @graph.`);
    continue;
  }

  const seenIds = new Set();
  for (const node of jsonLdNodes(doc)) {
    checkedNodes++;
    const type = node["@type"];
    if (FORBIDDEN_TYPES.has(type)) err(`${tag}: forbidden @type "${type}" — exports must not carry truth ratings.`);
    for (const key of Object.keys(node)) {
      if (FORBIDDEN_KEYS.has(key)) err(`${tag}: forbidden key "${key}" on @type "${type}".`);
    }
    if (node["@id"] && node["@type"] !== undefined && Array.isArray(doc["@graph"]) && doc["@graph"].includes(node)) {
      if (seenIds.has(node["@id"])) err(`${tag}: duplicate @id in one document: ${node["@id"]}`);
      seenIds.add(node["@id"]);
    }
    if (type === "Claim") {
      if (!node.text || String(node.text).trim() === "") err(`${tag}: Claim ${node["@id"]} without text.`);
      if (!Array.isArray(node.appearance) || node.appearance.length === 0)
        err(`${tag}: Claim ${node["@id"]} has no non-empty appearance — a claim without cited reporting (rule 1).`);
    }
    if (node["vomaste:citationFingerprint"]) {
      checkedFingerprints++;
      const recomputed = citationFingerprint({
        url: node.url,
        retrieved: node["vomaste:retrieved"],
        outlet: node.publisher?.name,
      });
      if (recomputed !== node["vomaste:citationFingerprint"])
        err(
          `${tag}: citation fingerprint of ${node["@id"]} does not recompute from its visible fields — citation and fingerprint have drifted apart.`,
        );
    }
  }
}

console.log(
  `Verified ${checkedFiles}/${manifest.exports.length} export(s), ${checkedNodes} node(s), ${checkedFingerprints} citation fingerprint(s) against ${manifestPath}.`,
);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("OK — every export matches its manifest hash, parses, carries no truth-rating markup, and every fingerprint recomputes.");
