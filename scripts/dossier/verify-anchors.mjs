#!/usr/bin/env node
/*
 * Post-build check: confirms that every #anchor referenced from each
 * dossier's KANONICKÝCH dat (case.anchor, timeline entry anchor, clm-##/
 * gap-## kotvy a odkazy v markdown těle dossieru) actually exists in the
 * built HTML — not just in the source. Must run after `zola build`.
 *
 * T-028 fáze H: zdrojem kotev je kanonický dataset (dossier.contentBlocks
 * markdown + case záznamy + timeline blok), ne content/** front matter —
 * content je generovaný adaptér.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC_ROOT = join(ROOT, "public");

const errors = [];
const err = (msg) => errors.push(msg);
const compiled = getCompiledModel(ROOT);

const mdBody = (blocks) =>
  (Array.isArray(blocks) ? blocks : [])
    .filter((b) => b?.type === "markdown")
    .map((b) => b.value)
    .join("\n\n");

function verifyAnchorsFor(slug, record) {
  const BUILT_HTML = join(PUBLIC_ROOT, "dossiers", slug, "index.html");
  const tag = (msg) => `[${slug}] ${msg}`;

  if (!existsSync(BUILT_HTML)) {
    console.log(tag(`SKIP — ${BUILT_HTML} does not exist yet. Run \`zola build\` first.`));
    return 0;
  }

  const html = readFileSync(BUILT_HTML, "utf8");
  const body = mdBody(record.contentBlocks);

  const builtIds = new Set([
    ...[...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\sid=([a-zA-Z0-9_-]+)(?=[\s>])/g)].map((m) => m[1]),
  ]);

  for (const m of body.matchAll(/<a id="((?:clm|gap)-\d+)">/g)) {
    if (!builtIds.has(m[1])) err(tag(`Anchor #${m[1]} is written in the canonical body but missing from the built HTML.`));
  }

  // Kotvy deklarované kanonickými záznamy: case.anchor + timeline anchor.
  const declaredAnchors = [];
  for (const w of compiled.records) {
    if (w.dossier === slug && w.registry === "cases" && w.record.anchor) declaredAnchors.push(w.record.anchor);
  }
  const timelineBlock = (record.contentBlocks ?? []).find((b) => b.type === "timeline");
  for (const entry of timelineBlock?.entries ?? []) {
    if (entry.anchor) declaredAnchors.push(entry.anchor);
  }
  for (const anchor of declaredAnchors) {
    if (!builtIds.has(anchor)) err(tag(`canonical data reference anchor="${anchor}", which does not exist as an id in the built page.`));
  }

  for (const m of body.matchAll(/<a href="#((?:clm|gap)-\d+)">/g)) {
    if (!builtIds.has(m[1])) err(tag(`Link to #${m[1]} does not resolve to any id in the built page.`));
  }

  console.log(tag(`Checked anchors against ${BUILT_HTML} (${builtIds.size} ids found in output).`));
  return builtIds.size;
}

const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");
for (const w of dossierWrappers) verifyAnchorsFor(w.dossier, w.record);

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — every anchor referenced in the canonical data resolves in the built HTML.`);
