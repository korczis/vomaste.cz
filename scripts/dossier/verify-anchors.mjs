#!/usr/bin/env node
/*
 * Post-build check: confirms that every #anchor referenced from
 * content/dossier/_index.md's front matter (extra.cases, extra.timeline)
 * and every clm-##/gap-## id actually exists in the built HTML — not just
 * in the markdown source. Must run after `zola build`.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIER_MD = join(ROOT, "content/dossier/_index.md");
const BUILT_HTML = join(ROOT, "public/dossier/index.html");

const errors = [];
const err = (msg) => errors.push(msg);

if (!existsSync(BUILT_HTML)) {
  console.log(`SKIP — ${BUILT_HTML} does not exist yet. Run \`zola build\` first.`);
  process.exit(0);
}

const html = readFileSync(BUILT_HTML, "utf8");
const source = readFileSync(DOSSIER_MD, "utf8");

// Collect every real id in the built page. Zola's own auto-generated heading
// anchors are emitted unquoted (`id=some-slug`), while hand-written ids in
// this project's raw HTML are quoted (`id="clm-01"`) — accept both forms.
const builtIds = new Set([
  ...[...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/\sid=([a-zA-Z0-9_-]+)(?=[\s>])/g)].map((m) => m[1]),
]);

// Every clm-##/gap-## anchor claimed in the source must exist in the build.
for (const m of source.matchAll(/<a id="((?:clm|gap)-\d+)">/g)) {
  if (!builtIds.has(m[1])) err(`Anchor #${m[1]} is written in the source but missing from the built HTML.`);
}

// Every #anchor referenced by extra.cases / extra.timeline front matter must
// resolve to a real id in the build (Zola auto-slugs headings).
for (const m of source.matchAll(/anchor = "([^"]+)"/g)) {
  if (!builtIds.has(m[1])) err(`extra front matter references anchor="${m[1]}", which does not exist as an id in the built page.`);
}

// Every internal #clm-##/#gap-## link used anywhere in the source must resolve.
// These are plain <a href="#..."> (not markdown [text](#...)) because Zola's
// own internal-link checker only validates markdown-syntax links, and it
// doesn't recognize arbitrary id="..." attributes as valid heading anchors
// — this script is what actually enforces them instead.
for (const m of source.matchAll(/<a href="#((?:clm|gap)-\d+)">/g)) {
  if (!builtIds.has(m[1])) err(`Link to #${m[1]} does not resolve to any id in the built page.`);
}

console.log(`Checked anchors against ${BUILT_HTML} (${builtIds.size} ids found in output).`);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log(`\nFAILED`);
  process.exit(1);
}
console.log(`OK — every anchor referenced in the source resolves in the built HTML.`);
