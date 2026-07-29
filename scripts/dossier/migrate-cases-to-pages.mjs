#!/usr/bin/env node
// One-time migration: generate content/dossiers/<slug>/cases/case-NN.md
// detail pages from the [[extra.cases]] front-matter array in
// content/dossiers/<slug>/_index.md. Re-runnable: regenerates all
// case-*.md from the current front matter, so the cards on the main page
// remain the source of truth for case metadata.
//
// `claims` on each [[extra.cases]] entry is a manually-curated editorial
// judgment of which CLM-## belong to that case (the case narratives cite
// outlets by name, not by CLM-##/SRC-## id, so this can't be derived
// mechanically) — see the comment above [[extra.cases]] in _index.md. This
// script derives each case's `sources` field automatically as the union
// of its claims' own sources, so that list is never hand-duplicated.
//
// Detail pages deliberately do NOT duplicate the full prose narrative for
// each case (especially the domestic-violence case, the most sensitive
// item in this dossier per AGENTS.md) — they link back to the canonical
// section on the main dossier page instead, so there is exactly one place
// where that narrative can drift out of the required procedural-vs-
// substantive framing.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SLUG = process.argv[2] || "macinka-turek";
const BASE = path.join(ROOT, "content", "dossiers", SLUG);
const INDEX_PATH = path.join(BASE, "_index.md");
const OUT_DIR = path.join(BASE, "cases");

function tomlEscape(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseArrayValue(raw) {
  return [...raw.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
}

function main() {
  const src = readFileSync(INDEX_PATH, "utf8");
  const frontMatterEnd = src.indexOf("\n+++", 4);
  const frontMatter = src.slice(0, frontMatterEnd);

  // Sources cited by each claim in the overview table — used to derive
  // each case's `sources` as the union of its own claims' sources.
  const claimSourcesById = new Map();
  const clmRowRe = /^\|\s*<a id="clm-\d+"><\/a>\[(CLM-\d+)\]\([^)]*\)\s*\|.*?\|.*?\|\s*(.+?)\s*\|\s*$/gm;
  let rowMatch;
  while ((rowMatch = clmRowRe.exec(src)) !== null) {
    const [, clmId, sourcesCell] = rowMatch;
    claimSourcesById.set(clmId, [...sourcesCell.matchAll(/SRC-\d+/g)].map((m) => m[0]));
  }

  const blockRe = /\[\[extra\.cases\]\]\n([\s\S]*?)(?=\n\[\[|\n\n|$)/g;
  const cases = [];
  let match;
  while ((match = blockRe.exec(frontMatter)) !== null) {
    const block = match[1];
    const get = (key) => {
      const m = block.match(new RegExp(`^${key} = "(.*)"$`, "m"));
      return m ? m[1] : null;
    };
    const getArray = (key) => {
      const m = block.match(new RegExp(`^${key} = (\\[.*\\])$`, "m"));
      return m ? parseArrayValue(m[1]) : [];
    };
    cases.push({
      anchor: get("anchor"),
      period: get("period"),
      title: get("title"),
      status: get("status"),
      label: get("label"),
      summary: get("summary"),
      claims: getArray("claims"),
    });
  }

  if (cases.length === 0) {
    console.error("No [[extra.cases]] entries found — front matter format may have changed.");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  cases.forEach((c, i) => {
    const num = String(i + 1).padStart(2, "0");
    const id = `CASE-${num}`;

    const sourceSet = new Set();
    for (const clmId of c.claims) {
      if (!claimSourcesById.has(clmId)) {
        console.error(`${id}: claims references ${clmId}, which is not a row in the Registr tvrzení table`);
        process.exit(1);
      }
      for (const s of claimSourcesById.get(clmId)) sourceSet.add(s);
    }
    const sources = [...sourceSet].sort();

    const claimsToml = c.claims.map((s) => `"${s}"`).join(", ");
    const sourcesToml = sources.map((s) => `"${s}"`).join(", ");

    const front = `+++
title = "${tomlEscape(c.title)}"
description = "${tomlEscape(c.summary)}"
template = "dossier-case.html"
weight = ${i + 1}
aliases = ["/dossier/kauzy/case-${num}/"]

[extra]
dossier = "${SLUG}"
record_type = "case"
lang = "cs"
case_id = "${id}"
anchor = "${c.anchor}"
period = "${c.period}"
status = "${c.status}"
label = "${tomlEscape(c.label)}"
summary = "${tomlEscape(c.summary)}"
claims = [${claimsToml}]
sources = [${sourcesToml}]
+++

Plné znění, zdroje a kontext tohoto případu jsou v [hlavním přehledu
dossieru](@/dossiers/${SLUG}/_index.md#${c.anchor}).
`;
    writeFileSync(path.join(OUT_DIR, `case-${num}.md`), front, "utf8");
  });

  console.log(`Generated ${cases.length} case pages in ${OUT_DIR}`);
}

main();
