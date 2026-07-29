#!/usr/bin/env node
// Anti-coupling linter: fails when historical seed-subject identifiers
// (Macinka/Turek and derived slugs) appear in STRUCTURAL source areas —
// templates, navigation data, scripts, styles, JS modules, config, CI.
//
// Rationale: vomaste.cz is a general-purpose multi-dossier system. The
// two historical subjects must remain ordinary domain DATA (canonical
// content under content/, per-dossier data under data/dossiers/<slug>/),
// never architecture. This check is the regression gate that keeps the
// de-specialization from silently reverting ("dočasný workaround").
//
// Allowed locations (never scanned): canonical content (content/**),
// per-dossier data (data/dossiers/**, data/entities/** if present),
// generated artifacts (data/generated/**, reports/**, public/**),
// historical/migration documentation (docs/**, *.md at repo root —
// including AGENTS.md's append-only authorization log), and this script.
//
// Everything else structural is scanned. Residual occurrences that are
// genuinely legitimate (e.g. a redirect manifest entry kept for external
// compatibility) must be allowlisted in
// scripts/lint/historical-coupling-allowlist.json with a rationale —
// one entry per file+pattern, no blanket ignores.
//
// Usage: node scripts/lint/lint-historical-coupling.mjs
// Exit 0 = no structural coupling; exit 1 = violations listed.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

const FORBIDDEN = [
  /macinka/i,
  /turek/i,
  /spole[cč]n[yý][ \-_]*p[rř]ehled/i, // the pair-specific "shared overview" concept
];

// Structural areas scanned. Data areas (content/, data/dossiers/) are
// deliberately absent — that's where the two belong as ordinary records.
const SCAN_ROOTS = [
  "templates",
  "assets",
  "sass",
  "styles",
  "scripts",
  ".github",
];
// data/dossiers.toml se zamerne NEskenuje: je to kanonicky registr
// dossieru, tedy datova vrstva, kam slugy skutecnych dossieru patri.
// data/navigation.toml se skenuje, dokud navigace neni generovana z
// registru; legitimni "featured" odkazy pak patri do allowlistu s
// oduvodnenim.
const SCAN_FILES = [
  "config.toml",
  "package.json",
  "tailwind.config.js",
  "postcss.config.js",
  "data/navigation.toml",
  "static/css/input.css",
];
const SKIP_DIRS = new Set(["node_modules", ".git", "public", ".claude"]);
const SKIP_FILES = new Set([
  path.join("scripts", "lint", "lint-historical-coupling.mjs"),
  path.join("scripts", "lint", "historical-coupling-allowlist.json"),
]);
// Generated bundles under static/ are rebuilt from assets/ — scanning the
// source (assets/, input.css) is what matters; main.css/app.js would only
// duplicate hits.
const SKIP_SUFFIXES = [
  path.join("static", "css", "main.css"),
  path.join("static", "js", "app.js"),
];

const allowlistPath = path.join(__dirname, "historical-coupling-allowlist.json");
/** @type {{file:string, pattern:string, rationale:string, expires?:string}[]} */
const allowlist = existsSync(allowlistPath)
  ? JSON.parse(readFileSync(allowlistPath, "utf8"))
  : [];

function isAllowed(relFile, line) {
  return allowlist.some(
    (a) => a.file === relFile && a.pattern && line.includes(a.pattern) && a.rationale,
  );
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const targets = [];
for (const root of SCAN_ROOTS) {
  const full = path.join(ROOT, root);
  if (existsSync(full)) targets.push(...walk(full));
}
for (const f of SCAN_FILES) {
  const full = path.join(ROOT, f);
  if (existsSync(full)) targets.push(full);
}

const violations = [];
const allowedHits = [];
for (const file of targets) {
  const rel = path.relative(ROOT, file);
  if (SKIP_FILES.has(rel)) continue;
  if (SKIP_SUFFIXES.some((s) => rel === s)) continue;
  if (/\.(png|jpg|jpeg|webp|ico|woff2?|ttf|eot|gif|svg)$/i.test(rel)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const re of FORBIDDEN) {
      const m = line.match(re);
      if (!m) continue;
      const hit = {
        file: rel,
        line: i + 1,
        match: m[0],
        excerpt: line.trim().slice(0, 160),
      };
      if (isAllowed(rel, line)) allowedHits.push(hit);
      else violations.push(hit);
      break;
    }
  });
}

if (allowedHits.length) {
  console.log(`ℹ ${allowedHits.length} allowlisted occurrence(s) (see ${path.relative(ROOT, allowlistPath)}).`);
}

if (violations.length) {
  console.error(
    `\n✗ Historical structural coupling detected — ${violations.length} occurrence(s) of seed-subject identifiers in structural source areas.\n` +
      `  These belong in canonical content/data, not in templates, navigation, scripts, styles, or CI.\n` +
      `  Either generalize the code (preferred) or, for genuinely legitimate boundary cases\n` +
      `  (e.g. legacy-redirect manifests), add an entry with rationale to\n` +
      `  scripts/lint/historical-coupling-allowlist.json.\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.match}]  ${v.excerpt}`);
  }
  process.exit(1);
}
console.log("OK — no historical seed-subject coupling in structural source areas.");
