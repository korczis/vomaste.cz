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
// Usage: node scripts/lint/lint-component-reuse.mjs
// Exit 0 = every non-exempt template uses macros/ui.html; exit 1 = a
// template is missing the import or never calls a ui:: macro.

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

const entries = readdirSync(TEMPLATES_DIR).filter((f) => {
  const full = path.join(TEMPLATES_DIR, f);
  return statSync(full).isFile() && f.endsWith(".html");
});

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

if (problems.length > 0) {
  console.error(
    `lint:component-reuse -- ${problems.length} template(s) don't reuse this site's shared UI components:\n`,
  );
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    "\nUse macros/ui.html (page_header, breadcrumb, stat_tile, registry-card, empty_state, back_link_footer) instead of hand-rolled markup. If a new template genuinely has no use for any of them, add it to EXEMPT in this script with a one-line reason -- not a silent skip.",
  );
  process.exit(1);
}

console.log(
  `lint:component-reuse -- OK (${entries.length - Object.keys(EXEMPT).length} template(s) checked, ${Object.keys(EXEMPT).length} documented exemption(s): ${Object.keys(EXEMPT).join(", ")}).`,
);
