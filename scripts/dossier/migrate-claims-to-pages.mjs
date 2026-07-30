#!/usr/bin/env node
// One-time migration: generate content/dossiers/<slug>/claims/clm-NN.md
// detail pages from the existing hand-authored claims table in
// content/dossiers/<slug>/_index.md. Re-runnable: always regenerates all
// clm-*.md files from the current table, so the table remains the source
// of truth and pages stay in sync if re-run.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SLUG = process.argv[2] || "macinka-turek";
// Legacy /dossier/* aliases belong ONLY to the historical dossier whose
// records actually lived at those URLs before the /dossiers/<slug>/ move.
// Emitting them for every dossier makes each new one claim URLs the old
// one already owns, and `zola build` dies on path collisions — this bit
// five consecutive new dossiers and was hand-fixed each time. The alias
// is now conditional, so a new dossier is correct the first time.
const LEGACY_ALIAS_DOSSIER = "macinka-turek";
const BASE = path.join(ROOT, "content", "dossiers", SLUG);
const INDEX_PATH = path.join(BASE, "_index.md");
const OUT_DIR = path.join(BASE, "claims");

const STATUS_LABELS = {
  "status-corroborated": "CORROBORATED",
  "status-single": "1 ZDROJ",
  "status-quote": "CITACE",
  "status-disputed": "SPORNÉ",
  "status-opinion": "NÁZOR",
};

function tomlEscape(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}


// The generator OWNS only the fields it derives from the overview table.
// Anything else on an existing page (e.g. `subjects`, added by
// tag-subjects.mjs) and any hand-written body are NOT its to discard:
// regenerating used to silently strip `subjects` from all 45
// macinka-turek claim pages and replace their bodies with a one-line
// pointer, which is a single-source-of-truth violation in the opposite
// direction — the generated file losing data the pipeline put there.
// Now: derived fields are rewritten, everything else is preserved.
const OWNED_KEYS = new Set([
  "title", "description", "template", "weight", "aliases",
  "dossier", "record_type", "lang", "clm_id", "status", "status_label",
  "summary", "sources",
]);

function readExisting(file) {
  if (!existsSync(file)) return { extraKeep: [], body: null };
  const text = readFileSync(file, "utf8");
  const end = text.indexOf("\n+++", 3);
  if (end === -1) return { extraKeep: [], body: null };
  const fm = text.slice(4, end);
  const body = text.slice(end + 5).replace(/^\n+/, "");
  const extraKeep = [];
  let inExtra = false;
  for (const line of fm.split("\n")) {
    if (line.trim() === "[extra]") { inExtra = true; continue; }
    if (/^\[/.test(line.trim())) { inExtra = false; continue; }
    const m = line.match(/^([a-z_]+)\s*=/);
    if (inExtra && m && !OWNED_KEYS.has(m[1])) extraKeep.push(line);
  }
  return { extraKeep, body: body.trim() ? body : null };
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
    const outFile = path.join(OUT_DIR, `clm-${c.num}.md`);
    const kept = readExisting(outFile);
    const body = kept.body ?? `Viz plné znění, kontext a sousední tvrzení v [hlavním přehledu](@/dossiers/${SLUG}/_index.md#registr-tvrzeni).\n`;
    const keptToml = kept.extraKeep.length ? kept.extraKeep.join("\n") + "\n" : "";
    const front = `+++
title = "${id}"
description = "${tomlEscape(c.text)}"
template = "dossier-claim.html"
weight = ${parseInt(c.num, 10)}
${SLUG === LEGACY_ALIAS_DOSSIER ? `aliases = ["/dossier/tvrzeni/clm-${c.num}/"]\n` : ""}
[extra]
dossier = "${SLUG}"
record_type = "claim"
lang = "cs"
clm_id = "${id}"
status = "${c.statusClass}"
status_label = "${c.statusLabel}"
summary = "${tomlEscape(c.text)}"
sources = [${sourcesToml}]
${keptToml}+++

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
