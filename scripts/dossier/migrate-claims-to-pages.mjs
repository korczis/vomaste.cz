#!/usr/bin/env node
// One-time migration: generate content/dossiers/<slug>/claims/clm-NN.md
// detail pages from the existing hand-authored claims table in
// content/dossiers/<slug>/_index.md. Re-runnable: always regenerates all
// clm-*.md files from the current table, so the table remains the source
// of truth and pages stay in sync if re-run.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SLUG = process.argv[2] || "macinka-turek";
const BASE = path.join(ROOT, "content", "dossiers", SLUG);
const INDEX_PATH = path.join(BASE, "_index.md");
const OUT_DIR = path.join(BASE, "claims");

const STATUS_LABELS = {
  "status-corroborated": "CORROBORATED",
  "status-quote": "CITACE",
  "status-disputed": "SPORNÉ",
  "status-opinion": "NÁZOR",
};

function tomlEscape(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function main() {
  const src = readFileSync(INDEX_PATH, "utf8");
  const rowRe =
    /^\|\s*<a id="clm-(\d+)"><\/a>\[CLM-\d+\]\(@\/dossiers\/[a-z0-9-]+\/claims\/clm-\d+\.md\)\s*\|\s*(.+?)\s*\|\s*<span class="status-badge (status-[a-z]+)">([^<]+)<\/span>\s*\|\s*(.+?)\s*\|\s*$/gm;

  const claims = [];
  let match;
  while ((match = rowRe.exec(src)) !== null) {
    const [, num, text, statusClass, statusLabel, sourcesCell] = match;
    const srcIds = [...sourcesCell.matchAll(/SRC-(\d+)/g)].map(
      (m) => `SRC-${m[1]}`,
    );
    claims.push({
      num: num.padStart(2, "0"),
      text,
      statusClass,
      statusLabel: statusLabel.trim(),
      srcIds,
    });
  }

  if (claims.length === 0) {
    console.error("No claim rows found — table format may have changed.");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  for (const c of claims) {
    const id = `CLM-${c.num}`;
    const expectedLabel = STATUS_LABELS[c.statusClass];
    if (expectedLabel !== c.statusLabel) {
      console.error(
        `${id}: status class ${c.statusClass} does not match label ${c.statusLabel}`,
      );
      process.exit(1);
    }
    const sourcesToml = c.srcIds.map((s) => `"${s}"`).join(", ");
    const body = `Viz plné znění, kontext a sousední tvrzení v [hlavním přehledu](@/dossiers/${SLUG}/_index.md#registr-tvrzeni).\n`;
    const front = `+++
title = "${id}"
description = "${tomlEscape(c.text)}"
template = "dossier-claim.html"
weight = ${parseInt(c.num, 10)}
aliases = ["/dossier/tvrzeni/clm-${c.num}/"]

[extra]
dossier = "${SLUG}"
record_type = "claim"
lang = "cs"
clm_id = "${id}"
status = "${c.statusClass}"
status_label = "${c.statusLabel}"
summary = "${tomlEscape(c.text)}"
sources = [${sourcesToml}]
+++

${body}`;
    writeFileSync(
      path.join(OUT_DIR, `clm-${c.num}.md`),
      front,
      "utf8",
    );
  }

  console.log(`Generated ${claims.length} claim pages in ${OUT_DIR}`);
}

main();
