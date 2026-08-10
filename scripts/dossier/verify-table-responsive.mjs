#!/usr/bin/env node
// Post-build gate: every rendered <table> must sit in a horizontal-scroll
// context, so no table can silently regress to the mobile layout bug this
// guards against (columns crushed to viewport width, Czech claim text
// wrapped one word per line, identifiers broken mid-token like "SRC-08").
//
// Two legitimate scroll contexts, matching the two ways a table reaches a
// built page:
//   - MARKDOWN tables (registr tvrzení a spol.) render as a bare <table>
//     inside a `.dossier-prose` container, which carries the responsive
//     rules in static/css/input.css (`.dossier-prose table { … }`).
//   - COMPONENT tables (templates/macros/table.html) render inside a
//     `overflow-x-auto` wrapper div of their own.
// A <table> under neither ancestor would render without either treatment —
// exactly the regression. That is what this check refuses to ship.
//
// This complements, at the built-HTML layer, what `lint:component-reuse`
// enforces at the template layer (a <table> in a template must go through
// the macro): markdown tables never touch a template, so only a post-build
// pass over public/ can see them. Runs after `zola build`, same family as
// verify-anchors / verify-jsonld / verify-full-pages.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUB = join(ROOT, "public");

// Ancestor classes that establish a horizontal-scroll context. Substring
// match on a whitespace-split class list, so utility strings like
// "relative overflow-x-auto rounded-lg" and "dossier-prose mb-10" match.
const SCROLL_CONTEXT_CLASSES = ["dossier-prose", "overflow-x-auto"];

// Per-file escape hatch, mirroring TABLE_EXEMPT in lint-component-reuse.mjs:
// a built page (relative to public/) whose table is intentionally handled
// some other way. Empty on purpose — add an entry only with a written
// reason, never to silence a real regression.
const EXEMPT = new Set([]);

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

let errors = 0;
const err = (m) => { errors++; console.error("  ERROR " + m); };

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (name === "index.html") yield full;
  }
}

function classListOf(attrs) {
  const m = attrs.match(/\bclass\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  if (!m) return [];
  return (m[2] ?? m[3] ?? m[4] ?? "").split(/\s+/).filter(Boolean);
}

function inScrollContext(stack) {
  return stack.some((classes) =>
    classes.some((c) => SCROLL_CONTEXT_CLASSES.includes(c)));
}

// Minimal tag-stack scanner. The attribute sub-pattern tolerates quoted
// '>' inside attribute values, which is the only HTML edge case Zola's
// output realistically hits here. Comments and <script>/<style> bodies are
// skipped so a literal "<table" in a code block or script can't false-fire.
const TAG_RE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;

function checkFile(file) {
  const rel = file.slice(PUB.length + 1);
  if (EXEMPT.has(rel)) return 0;
  const html = readFileSync(file, "utf8");
  const stack = []; // array of class-lists, one per open element (ancestors)
  let tables = 0;
  let skipUntil = null; // tag name whose raw body we skip (script/style)

  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(html)) !== null) {
    if (m[0].startsWith("<!--")) continue;
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3] || "";
    const selfClosed = m[4] === "/";

    if (skipUntil) {
      if (closing && tag === skipUntil) skipUntil = null;
      continue;
    }

    if (closing) {
      // Pop to the matching open tag (tolerates unclosed void/optional tags).
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) { stack.length = i; break; }
      }
      continue;
    }

    if (tag === "table") {
      tables++;
      if (!inScrollContext(stack.map((e) => e.classes))) {
        err(`${rel}: <table> není v žádném scroll kontextu ` +
            `(${SCROLL_CONTEXT_CLASSES.join(" / ")}) — na mobilu by se ` +
            `hroutila místo scrollování.`);
      }
    }

    if (selfClosed || VOID_ELEMENTS.has(tag)) continue;
    if (tag === "script" || tag === "style") { skipUntil = tag; continue; }
    stack.push({ tag, classes: classListOf(attrs) });
  }
  return tables;
}

let totalTables = 0;
let pages = 0;
for (const file of walk(PUB)) {
  pages++;
  totalTables += checkFile(file);
}

if (errors > 0) {
  console.error(`\nverify:table-responsive — ${errors} chyba/chyby: ` +
    `tabulka mimo scroll kontext. Markdown tabulky patří do .dossier-prose, ` +
    `komponentové do macros/table.html (obal overflow-x-auto).`);
  process.exit(1);
}
console.log(
  `Zkontrolováno ${totalTables} tabulek napříč ${pages} vydanými stránkami.`);
console.log(
  "OK — každá <table> je ve scroll kontextu (.dossier-prose nebo overflow-x-auto), " +
  "takže se na mobilu chová responzivně.");
