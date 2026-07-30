#!/usr/bin/env node
// Enforces this site's own UI-component-reuse convention: every
// content-rendering top-level template imports and uses the shared
// macros/ui.html library (page_header, breadcrumb, stat_tile,
// registry-card, empty_state, back_link_footer, ...) instead of
// hand-rolling markup that already has a shared component.
//
// NOT a check against any external spec. The owner asked for pages to
// "comply with" flowbite.com/docs/getting-started/llm/ -- that page and
// its linked llms.txt/llms-full.txt were fetched and read directly (not
// assumed) and contain no concrete, machine-checkable rules: they're a
// navigational index into Flowbite's docs, not a conformance checklist.
// There is nothing there to mechanically enforce. What IS real and
// checkable -- and already true of every current content template but
// two documented exceptions -- is this site's own established
// component-reuse convention. This script enforces that, honestly
// named for what it actually checks.
//
// Second rule (2026-07-30, owner-directed): tabular data goes through the
// shared advanced-table component. Any template under templates/ that
// renders a raw <table> outside macros/table.html must import
// macros/table.html and use table::advanced_table — the single table
// component (Flowbite "Advanced Tables"-style, own implementation over
// free Tailwind/Flowbite) whose wrapper carries data-record-type linking
// rows to the page's JSON-LD nodes. Exemptions are per-file with a
// written rationale, same as the ui.html rule — no silent skips.
//
// Usage: node scripts/lint/lint-component-reuse.mjs
// Exit 0 = every non-exempt template uses macros/ui.html and every
// table-rendering template uses macros/table.html; exit 1 otherwise.

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const TEMPLATES_DIR = path.join(ROOT, "templates");

// Legitimately exempt templates, one entry per file with a rationale on
// record -- no blanket/pattern-based exemptions.
const EXEMPT = {
  "base.html": "the layout itself -- defines the shell every ui:: macro's output is rendered inside, not a content page",
  "404.html": "minimal error page, intentionally outside the standard page-header/breadcrumb treatment",
};

const IMPORT_RE = /\{%-?\s*import\s+"macros\/ui\.html"\s+as\s+ui\s*-?%\}/;
const USE_RE = /\bui::/;

// Advanced-table rule. A template containing a raw <table> must import
// macros/table.html and call table::advanced_table (the raw <table> is
// then expected to be gone — the macro renders it). Per-file exemptions
// with a rationale only, exactly like EXEMPT above.
const TABLE_EXEMPT = {};
const TABLE_TAG_RE = /<table\b/;
const TABLE_IMPORT_RE = /\{%-?\s*import\s+"macros\/table\.html"\s+as\s+table\s*-?%\}/;
const TABLE_USE_RE = /\btable::advanced_table\b/;

const entries = readdirSync(TEMPLATES_DIR).filter((f) => {
  const full = path.join(TEMPLATES_DIR, f);
  return statSync(full).isFile() && f.endsWith(".html");
});

// The table rule scans templates/ recursively (partials and macros
// included) — a raw <table> hidden in a partial is the same defect as
// one in a top-level template. macros/table.html itself is the single
// allowed home of the literal <table> markup.
function walkHtmlFiles(dir, prefix = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) out.push(...walkHtmlFiles(full, rel));
    else if (name.endsWith(".html")) out.push(rel);
  }
  return out;
}

const problems = [];
for (const file of entries) {
  if (file in EXEMPT) continue;
  const text = readFileSync(path.join(TEMPLATES_DIR, file), "utf8");
  if (!IMPORT_RE.test(text)) {
    problems.push(`${file}: does not import macros/ui.html`);
    continue;
  }
  if (!USE_RE.test(text)) {
    problems.push(`${file}: imports macros/ui.html but never calls a ui:: macro`);
  }
}

for (const rel of walkHtmlFiles(TEMPLATES_DIR)) {
  if (rel === "macros/table.html" || rel in TABLE_EXEMPT) continue;
  const text = readFileSync(path.join(TEMPLATES_DIR, rel), "utf8");
  if (!TABLE_TAG_RE.test(text)) continue;
  if (!TABLE_IMPORT_RE.test(text)) {
    problems.push(
      `${rel}: renders a raw <table> but does not import macros/table.html — wrap the table in {% import "macros/table.html" as table %} + table::advanced_table(...) / table::advanced_table_end(...)`,
    );
    continue;
  }
  if (!TABLE_USE_RE.test(text)) {
    problems.push(
      `${rel}: renders a raw <table> and imports macros/table.html but never calls table::advanced_table — the shared component must render every table`,
    );
  }
}

if (problems.length > 0) {
  console.error(
    `lint:component-reuse -- ${problems.length} template(s) don't reuse this site's shared UI components:\n`,
  );
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    "\nUse macros/ui.html (page_header, breadcrumb, stat_tile, registry-card, empty_state, back_link_footer) instead of hand-rolled markup, and macros/table.html (table::advanced_table / table::advanced_table_end) for any tabular data. If a new template genuinely has no use for them, add it to EXEMPT / TABLE_EXEMPT in this script with a one-line reason -- not a silent skip.",
  );
  process.exit(1);
}

console.log(
  `lint:component-reuse -- OK (${entries.length - Object.keys(EXEMPT).length} template(s) checked, ${Object.keys(EXEMPT).length} documented exemption(s): ${Object.keys(EXEMPT).join(", ")}).`,
);
