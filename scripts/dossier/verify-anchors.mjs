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
 *
 * 2026-08-06: navíc (WARNING, ne ERROR — viz `warnings` níž) hlídá, aby se
 * case.anchor/timeline anchor v postavené stránce neobjevil jako `id`
 * VÍCEKRÁT. Nalezeno živě u jaromir-zuna: dva samostatné ručně psané
 * `## nadpis {#stejná-kotva}` bloky v contentBlocks markdownu sdílely
 * stejnou kotvu — HTML respektuje jen první `id`, takže odkaz z case
 * detailu i z timeline skončil na špatné sekci, aniž to cokoliv nahlásilo.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC_ROOT = join(ROOT, "public");

const errors = [];
const err = (msg) => errors.push(msg);
// Warnings never fail the build — 2026-08-06: added a check for duplicate
// heading anchors (below) that found 11 pre-existing occurrences across
// the dataset at the time it was written. Making it a hard ERROR on day
// one would redden every session's build over a backlog that predates
// this check, which is exactly the "stop-the-line for everyone" outcome
// docs/coop/PROTOCOL.md warns against. WARNING gives it visibility (every
// `npm run build`, everywhere) without blocking anyone; promote it to
// `err()` once the backlog is actually cleared.
const warnings = [];
const warn = (msg) => warnings.push(msg);
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

  const idOccurrences = [
    ...[...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\sid=([a-zA-Z0-9_-]+)(?=[\s>])/g)].map((m) => m[1]),
  ];
  const builtIds = new Set(idOccurrences);
  // 2026-08-06: řádí, kolikrát se každé id v postavené stránce objevilo.
  // Jen COUNT >1 na id z declaredAnchors (case.anchor / timeline anchor)
  // se bere jako chyba níž — je to přesně ten anchor, přes který na
  // stránku vede reálný odkaz (case detail, timeline). Nekontrolujeme to
  // pro VŠECHNA id na stránce (opakující se komponenty typu Alpine
  // x-data/SVG defs tam běžně mají svoje vlastní, neproblémové důvody) —
  // scope je záměrně úzký na to, co se dřív reálně rozbilo: dva různé
  // `## nadpis {#stejná-kotva}` bloky v ručně psaném contentBlocks
  // markdownu (viz jaromir-zuna, session 2026-08-06) way, kdy odkaz na
  // tu kotvu skončil na první, ne na zamýšlené sekci.
  const idCounts = new Map();
  for (const id of idOccurrences) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);

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
  // declaredAnchors běžně obsahuje totéž id vícekrát (case.anchor + víc
  // timeline entries na tutéž kauzu) — bez tohohle dedup by se stejné
  // WARNING/ERROR vypsalo tolikrát, kolikrát se na anchor odkazuje, ne
  // jednou za skutečný nález.
  const warnedDuplicates = new Set();
  for (const anchor of declaredAnchors) {
    if (!builtIds.has(anchor)) err(tag(`canonical data reference anchor="${anchor}", which does not exist as an id in the built page.`));
    else if (idCounts.get(anchor) > 1 && !warnedDuplicates.has(anchor)) {
      warnedDuplicates.add(anchor);
      warn(
        tag(
          `anchor="${anchor}" appears ${idCounts.get(anchor)} times as an id in the built page — a link to #${anchor} ` +
            `resolves to whichever one comes first in the HTML, not necessarily the section this record actually means. ` +
            `Almost always two "## heading {#${anchor}}" blocks in dossier.json's contentBlocks markdown sharing the ` +
            `same anchor by mistake — merge them into one (see docs/coop/PROTOCOL.md for the jaromir-zuna precedent).`,
        ),
      );
    }
  }

  for (const m of body.matchAll(/<a href="#((?:clm|gap)-\d+)">/g)) {
    if (!builtIds.has(m[1])) err(tag(`Link to #${m[1]} does not resolve to any id in the built page.`));
  }

  console.log(tag(`Checked anchors against ${BUILT_HTML} (${builtIds.size} ids found in output).`));
  return builtIds.size;
}

const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");
for (const w of dossierWrappers) verifyAnchorsFor(w.dossier, w.record);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s) (do not fail the build):`);
  for (const w of warnings) console.log(`  WARNING ${w}`);
}

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — every anchor referenced in the canonical data resolves in the built HTML.`);
