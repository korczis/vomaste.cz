#!/usr/bin/env node
/*
 * Sync a claim page's `description`/`summary` front matter to the verbatim
 * table cell in its dossier's _index.md.
 *
 * WHY THIS EXISTS: the dossier model deliberately keeps two representations
 * of every claim — the hand-authored row in the _index.md registry table and
 * the generated per-record page — and validate-dossier.mjs enforces that
 * they are byte-identical ("page summary does not match table text verbatim
 * (drifted copy)"). That check is the whole point: two copies that can
 * silently disagree are worse than one.
 *
 * The copies drift for a boring, repeatable reason. Claim text routinely
 * contains Czech typographic quotes (U+201E / U+201C) around a quoted
 * statement. When the page is authored through a shell heredoc, `\"` becomes
 * an ASCII quote, or the quotes get dropped entirely — and the two
 * representations no longer match byte for byte even though they read the
 * same. It happened twice while building the jaroslav-faltynek and
 * richard-chlad dossiers.
 *
 * The table row is treated as the source of truth, not the page: the table
 * is what a human wrote and what a reader sees in context.
 *
 * This does NOT relax the byte-identity rule and does not invent text — it
 * only copies an existing table cell onto the page that is supposed to
 * mirror it. If no table row exists for the given id, it refuses rather than
 * guessing.
 *
 * Deliberately NOT part of `npm run build`: the build must report drift, not
 * quietly paper over it. Run this when validate-dossier tells you a page has
 * drifted, then re-run the build.
 *
 * Usage:
 *   node scripts/dossier/align-claim-pages.mjs <dossier-slug> <clm-id>...
 *   node scripts/dossier/align-claim-pages.mjs richard-chlad 02 04 05 06
 */
import { readFileSync, writeFileSync } from "node:fs";

const [slug, ...ids] = process.argv.slice(2);
if (!slug || ids.length === 0) {
  console.error(
    "align-claim-pages: usage: node scripts/dossier/align-claim-pages.mjs <dossier-slug> <clm-id>...",
  );
  console.error("Example: align-claim-pages.mjs richard-chlad 02 04 05 06");
  process.exit(1);
}

const indexPath = `content/dossiers/${slug}/_index.md`;
let index;
try {
  index = readFileSync(indexPath, "utf8");
} catch {
  console.error(`align-claim-pages: cannot read ${indexPath} — is "${slug}" a real dossier slug?`);
  process.exit(1);
}

let aligned = 0;
let unchanged = 0;
for (const rawId of ids) {
  const id = rawId.padStart(2, "0");
  const row = index.match(new RegExp(`clm-${id}\\.md\\) \\| (.*?) \\| <span`));
  if (!row) {
    console.error(
      `align-claim-pages: no registry table row found for CLM-${id} in ${indexPath}.`,
    );
    console.error("Refusing to guess the text — add the table row first.");
    process.exit(1);
  }
  const text = row[1].trim();
  const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pagePath = `content/dossiers/${slug}/claims/clm-${id}.md`;
  let page;
  try {
    page = readFileSync(pagePath, "utf8");
  } catch {
    console.error(`align-claim-pages: ${pagePath} does not exist.`);
    process.exit(1);
  }
  const updated = page
    .replace(/^description = ".*"$/m, `description = "${escaped}"`)
    .replace(/^summary = ".*"$/m, `summary = "${escaped}"`);
  if (updated === page) {
    unchanged++;
    continue;
  }
  writeFileSync(pagePath, updated);
  console.log(`  aligned ${pagePath}`);
  aligned++;
}

console.log(
  `align-claim-pages: ${aligned} page(s) aligned in ${slug}, ${unchanged} already matching.`,
);
