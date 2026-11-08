#!/usr/bin/env node
/*
 * Post-build brána velikosti vydaného webu (`public/`).
 *
 * PROČ existuje: 2026-08-14 GitHub Pages odmítly nasadit artefakt
 * („Artifact could not be deployed… total size is less than 10GB",
 * běh 31796352276). `public/` mělo 10 GB, protože se navigace vypisovala
 * celá do každé z ~6 000 stránek — 1,65 MB z 1,88 MB stránky. Nikdo to
 * nezachytil, protože žádná brána velikost neměřila: náklad rostl
 * součinem počtu dossierů a počtu stránek a projevil se až odmítnutým
 * nasazením.
 *
 * Tahle brána měří tři věci a porovná je s limity v
 * `data/output-budget.toml` (limity jsou data, ne konstanty v kódu):
 *
 *  1. `total_bytes_max` — součet velikostí všech souborů v `public/`;
 *  2. `html_page_bytes_p95_max` — 95. percentil velikosti HTML stránky
 *     (aliasové přesměrovací stuby Zoly se nepočítají — táž výjimka jako
 *     ve verify-jsonld.mjs a verify-og.mjs);
 *  3. `shell_bytes_max` — největší „obal" jedné stránky: to, co se
 *     opakuje na KAŽDÉ stránce bez ohledu na její obsah. Měří se:
 *       - `<aside id="sidebar">` (postranní navigace),
 *       - všechny `<noscript>` bloky (navigace bez JS),
 *       - uzly `SiteNavigationElement` v JSON-LD (velikost jejich
 *         re-serializace přes JSON.stringify — přibližná, ale stabilní
 *         a srovnatelná mezi buildy).
 *     Přesně tahle veličina způsobila incident z 2026-08; limit na
 *     celkovou velikost by ji zachytil až pozdě, limit na obal okamžitě.
 *
 * Co brána NEDOKAZUJE: že je web rychlý (neměří síť, kompresi, JS ani
 * vykreslování) ani že se vejde do jakéhokoli limitu GitHub Pages kromě
 * těch, které jsou v `data/output-budget.toml` zapsané.
 *
 * Výstup vždy vypíše naměřené hodnoty a pět nejtěžších stránek a obalů,
 * aby šlo limit nastavit podle měření, ne odhadem.
 *
 * Použití:
 *   node scripts/build/verify-output-budget.mjs [--dir <vydaný strom>] [--budget <toml>]
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseToml } from "./seo-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const BUDGET_KEYS = ["total_bytes_max", "html_page_bytes_p95_max", "shell_bytes_max"];

const ASIDE_RE = /<aside\b[^>]*\bid=["']?sidebar["'\s>][\s\S]*?<\/aside>/i;
const NOSCRIPT_RE = /<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi;
const JSONLD_RE = /<script\b[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
// Zola alias stub: <meta http-equiv="refresh" …> bez dalšího obsahu.
const ALIAS_RE = /http-equiv=["']?refresh/i;

const bytes = (s) => Buffer.byteLength(s, "utf8");

function navNodeBytes(node) {
  if (Array.isArray(node)) return node.reduce((n, x) => n + navNodeBytes(x), 0);
  if (!node || typeof node !== "object") return 0;
  const type = node["@type"];
  const isNav = type === "SiteNavigationElement"
    || (Array.isArray(type) && type.includes("SiteNavigationElement"));
  if (isNav) return bytes(JSON.stringify(node));
  let n = 0;
  for (const v of Object.values(node)) n += navNodeBytes(v);
  return n;
}

/** Rozpad jedné stránky: celková velikost a velikost opakovaného obalu. */
export function measurePage(html) {
  const aside = html.match(ASIDE_RE);
  const sidebar = aside ? bytes(aside[0]) : 0;
  let noscript = 0;
  for (const m of html.matchAll(NOSCRIPT_RE)) noscript += bytes(m[0]);
  let jsonldNav = 0;
  for (const m of html.matchAll(JSONLD_RE)) {
    try {
      jsonldNav += navNodeBytes(JSON.parse(m[1]));
    } catch {
      // Neparsovatelné JSON-LD je věc verify-jsonld.mjs, ne této brány.
    }
  }
  return {
    total: bytes(html),
    sidebar,
    noscript,
    jsonldNav,
    shell: sidebar + noscript + jsonldNav,
    alias: ALIAS_RE.test(html) && html.length < 2048,
  };
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield { path: p, size: st.size };
  }
}

export function percentile(sorted, q) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

/** Projde vydaný strom a vrátí souhrnné míry. */
export function collect(dir) {
  let totalBytes = 0;
  const pages = [];
  for (const f of walk(dir)) {
    totalBytes += f.size;
    if (!f.path.endsWith(".html")) continue;
    const m = measurePage(readFileSync(f.path, "utf8"));
    if (m.alias) continue;
    pages.push({ path: relative(dir, f.path), ...m });
  }
  const sizes = pages.map((p) => p.total).sort((a, b) => a - b);
  const maxShell = pages.reduce((best, p) => (p.shell > (best?.shell ?? -1) ? p : best), null);
  return {
    totalBytes,
    htmlPages: pages.length,
    htmlP95: percentile(sizes, 0.95),
    shellMax: maxShell ? maxShell.shell : 0,
    shellMaxPage: maxShell ? maxShell.path : null,
    heaviestPages: [...pages].sort((a, b) => b.total - a.total).slice(0, 5),
    heaviestShells: [...pages].sort((a, b) => b.shell - a.shell).slice(0, 5),
  };
}

/** Načte a zvaliduje limity; chybějící nebo nekladný limit je tvrdá chyba. */
export function loadBudget(text, label = "data/output-budget.toml") {
  const parsed = parseToml(text, label);
  const budget = parsed.budget ?? {};
  for (const key of BUDGET_KEYS) {
    const v = budget[key];
    if (!Number.isInteger(v) || v <= 0) {
      throw new Error(`${label}: [budget].${key} musí být kladné celé číslo (bajty), je ${JSON.stringify(v)}.`);
    }
  }
  const unknown = Object.keys(budget).filter((k) => !BUDGET_KEYS.includes(k));
  if (unknown.length) throw new Error(`${label}: neznámé klíče v [budget]: ${unknown.join(", ")}.`);
  return budget;
}

/** Porovná míry s limity; vrátí seznam porušení (prázdný = prošlo). */
export function evaluate(stats, budget) {
  const v = [];
  if (stats.htmlPages === 0) v.push("ve vydaném stromu není žádná HTML stránka — brána nemá co měřit");
  if (stats.totalBytes > budget.total_bytes_max) {
    v.push(`celková velikost ${fmt(stats.totalBytes)} > limit ${fmt(budget.total_bytes_max)} (total_bytes_max)`);
  }
  if (stats.htmlP95 > budget.html_page_bytes_p95_max) {
    v.push(`p95 velikosti HTML stránky ${fmt(stats.htmlP95)} > limit ${fmt(budget.html_page_bytes_p95_max)} (html_page_bytes_p95_max)`);
  }
  if (stats.shellMax > budget.shell_bytes_max) {
    v.push(`opakovaný obal stránky ${fmt(stats.shellMax)} na ${stats.shellMaxPage} > limit ${fmt(budget.shell_bytes_max)} (shell_bytes_max) — `
      + "navigace nebo jiný blok se vypisuje do každé stránky");
  }
  return v;
}

export function fmt(n) {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GiB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MiB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${n} B`;
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function main() {
  const dir = arg("--dir", join(ROOT, "public"));
  const budgetPath = arg("--budget", join(ROOT, "data/output-budget.toml"));
  if (!existsSync(dir)) {
    console.error(`verify-output-budget: ${dir} neexistuje — brána běží až po zola build.`);
    process.exit(1);
  }
  const budget = loadBudget(readFileSync(budgetPath, "utf8"), relative(ROOT, budgetPath) || budgetPath);
  const stats = collect(dir);
  console.log(`verify-output-budget: ${stats.htmlPages} HTML stránek, celkem ${fmt(stats.totalBytes)}, `
    + `p95 stránky ${fmt(stats.htmlP95)}, největší obal ${fmt(stats.shellMax)} (${stats.shellMaxPage})`);
  console.log("  nejtěžší stránky:");
  for (const p of stats.heaviestPages) console.log(`    ${fmt(p.total).padStart(10)}  ${p.path}`);
  console.log("  největší obaly (sidebar + noscript + JSON-LD navigace):");
  for (const p of stats.heaviestShells) {
    console.log(`    ${fmt(p.shell).padStart(10)}  ${p.path}  (sidebar ${fmt(p.sidebar)}, noscript ${fmt(p.noscript)}, JSON-LD ${fmt(p.jsonldNav)})`);
  }
  const violations = evaluate(stats, budget);
  if (violations.length) {
    console.error("verify-output-budget: FAIL");
    for (const line of violations) console.error(`  - ${line}`);
    console.error("  Limity jsou v data/output-budget.toml. Zvýšit je je redakční rozhodnutí "
      + "s odůvodněním v komentáři, ne oprava — nejdřív zjisti, co se opakuje.");
    process.exit(1);
  }
  console.log("verify-output-budget: OK");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
