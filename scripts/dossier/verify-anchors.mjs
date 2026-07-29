#!/usr/bin/env node
/*
 * Post-build check: confirms that every #anchor referenced from each
 * dossier's content/dossiers/<slug>/_index.md front matter (extra.cases,
 * extra.timeline) and every clm-##/gap-## id actually exists in the built
 * HTML — not just in the markdown source. Must run after `zola build`.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const PUBLIC_ROOT = join(ROOT, "public");

const errors = [];
const err = (msg) => errors.push(msg);

function verifyAnchorsFor(slug) {
  const DOSSIER_MD = join(DOSSIERS_ROOT, slug, "_index.md");
  const BUILT_HTML = join(PUBLIC_ROOT, "dossiers", slug, "index.html");
  const tag = (msg) => `[${slug}] ${msg}`;

  if (!existsSync(BUILT_HTML)) {
    console.log(tag(`SKIP — ${BUILT_HTML} does not exist yet. Run \`zola build\` first.`));
    return 0;
  }

  const html = readFileSync(BUILT_HTML, "utf8");
  const source = readFileSync(DOSSIER_MD, "utf8");

  const builtIds = new Set([
    ...[...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\sid=([a-zA-Z0-9_-]+)(?=[\s>])/g)].map((m) => m[1]),
  ]);

  for (const m of source.matchAll(/<a id="((?:clm|gap)-\d+)">/g)) {
    if (!builtIds.has(m[1])) err(tag(`Anchor #${m[1]} is written in the source but missing from the built HTML.`));
  }

  for (const m of source.matchAll(/anchor = "([^"]+)"/g)) {
    if (!builtIds.has(m[1])) err(tag(`extra front matter references anchor="${m[1]}", which does not exist as an id in the built page.`));
  }

  for (const m of source.matchAll(/<a href="#((?:clm|gap)-\d+)">/g)) {
    if (!builtIds.has(m[1])) err(tag(`Link to #${m[1]} does not resolve to any id in the built page.`));
  }

  console.log(tag(`Checked anchors against ${BUILT_HTML} (${builtIds.size} ids found in output).`));
  return builtIds.size;
}

const dossierSlugs = readdirSync(DOSSIERS_ROOT).filter((f) =>
  statSync(join(DOSSIERS_ROOT, f)).isDirectory(),
);
for (const slug of dossierSlugs) verifyAnchorsFor(slug);

if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — every anchor referenced in the source resolves in the built HTML.`);
