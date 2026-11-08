#!/usr/bin/env node
// Testy brány velikosti vydaného webu. Brána, která nikdy nic neodmítne,
// je vynucení bez krytí (.claude/rules/testing.md): proto se tu ověřuje
// hlavně to, že na známě nafouknutém stromu SKUTEČNĚ padá — a že se
// měření nenechá zmást minifikovaným HTML, jaké Zola vydává.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { measurePage, collect, evaluate, loadBudget, percentile } from "./verify-output-budget.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRIPT = join(ROOT, "scripts/build/verify-output-budget.mjs");

const navNode = (n) => ({ "@type": "SiteNavigationElement", name: `Položka ${n}`, url: `https://example.org/${n}/` });
const page = ({ sidebarLinks = 1, noscriptLinks = 1, navNodes = 1, body = "<p>obsah</p>" } = {}) => {
  const links = (n) => Array.from({ length: n }, (_, i) => `<a href=/x/${i}/>Odkaz ${i}</a>`).join("");
  const ld = { "@context": "https://schema.org", "@graph": [{ "@type": "WebPage", name: "x" }, ...Array.from({ length: navNodes }, (_, i) => navNode(i))] };
  // Minifikovaný tvar jako ze Zoly: atributy bez uvozovek.
  return `<!doctype html><html><head><script type=application/ld+json>${JSON.stringify(ld)}</script></head><body>`
    + `<aside class="fixed w-64" id=sidebar tabindex=-1><nav>${links(sidebarLinks)}</nav></aside>`
    + `<noscript><nav>${links(noscriptLinks)}</nav></noscript>${body}</body></html>`;
};

function tree(pages, extra = {}) {
  const dir = mkdtempSync(join(tmpdir(), "output-budget-"));
  for (const [rel, html] of Object.entries(pages)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), html);
  }
  for (const [rel, content] of Object.entries(extra)) writeFileSync(join(dir, rel), content);
  return dir;
}

const BUDGET = { total_bytes_max: 10_000_000, html_page_bytes_p95_max: 100_000, shell_bytes_max: 20_000 };
const budgetToml = (b) => `[budget]\n${Object.entries(b).map(([k, v]) => `${k} = ${v}`).join("\n")}\n`;

test("měření obalu najde sidebar, noscript i JSON-LD navigaci v minifikovaném HTML", () => {
  const m = measurePage(page({ sidebarLinks: 3, noscriptLinks: 2, navNodes: 4 }));
  assert.ok(m.sidebar > 0, "sidebar nenalezen");
  assert.ok(m.noscript > 0, "noscript nenalezen");
  const expected = [0, 1, 2, 3].reduce((n, i) => n + Buffer.byteLength(JSON.stringify(navNode(i))), 0);
  assert.equal(m.jsonldNav, expected, "JSON-LD navigace se měří jako součet re-serializovaných uzlů");
  assert.equal(m.shell, m.sidebar + m.noscript + m.jsonldNav);
  assert.equal(m.alias, false);
});

test("obal roste s počtem odkazů — přesně tvar incidentu z 2026-08", () => {
  const small = measurePage(page({ sidebarLinks: 5 }));
  const big = measurePage(page({ sidebarLinks: 500 }));
  assert.ok(big.shell > small.shell * 20);
});

test("neparsovatelné JSON-LD bránu neshodí (patří verify-jsonld)", () => {
  const html = page().replace(/<script type=application\/ld\+json>.*?<\/script>/, "<script type=application/ld+json>{rozbité</script>");
  assert.equal(measurePage(html).jsonldNav, 0);
});

test("aliasový přesměrovací stub se do stránek nepočítá", () => {
  const dir = tree({
    "index.html": page(),
    "stare/index.html": '<!doctype html><meta http-equiv=refresh content="0; url=/nove/">',
  });
  try {
    assert.equal(collect(dir).htmlPages, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("percentil", () => {
  assert.equal(percentile([], 0.95), 0);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.95), 10);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.5), 5);
});

test("strom pod limity projde", () => {
  const dir = tree({ "index.html": page(), "a/index.html": page() });
  try {
    assert.deepEqual(evaluate(collect(dir), BUDGET), []);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("nafouknutý obal brána ODMÍTNE a pojmenuje stránku", () => {
  const dir = tree({ "index.html": page(), "tezka/index.html": page({ sidebarLinks: 2000 }) });
  try {
    const v = evaluate(collect(dir), BUDGET);
    // Těžká stránka má ~55 KB: překročí limit obalu (20 kB), ne p95 (100 kB) —
    // obal je přesně ta veličina, která incident zachytí dřív než celková velikost.
    assert.equal(v.length, 1, v.join("\n"));
    assert.match(v[0], /shell_bytes_max/);
    assert.match(v.join("\n"), /tezka\/index\.html/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("překročená celková velikost se odmítne i bez HTML problému", () => {
  const dir = tree({ "index.html": page() }, { "velky.bin": "x".repeat(50_000) });
  try {
    const v = evaluate(collect(dir), { ...BUDGET, total_bytes_max: 10_000 });
    assert.equal(v.length, 1);
    assert.match(v[0], /total_bytes_max/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("prázdný strom není zelená — brána nemá co měřit", () => {
  const dir = tree({}, { "jen.txt": "x" });
  try {
    assert.match(evaluate(collect(dir), BUDGET).join("\n"), /žádná HTML stránka/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("limity: chybějící, nekladný i neznámý klíč je tvrdá chyba", () => {
  assert.deepEqual(loadBudget(budgetToml(BUDGET)), BUDGET);
  const { shell_bytes_max: _omit, ...missing } = BUDGET;
  assert.throws(() => loadBudget(budgetToml(missing)), /shell_bytes_max/);
  assert.throws(() => loadBudget(budgetToml({ ...BUDGET, shell_bytes_max: 0 })), /kladné celé číslo/);
  assert.throws(() => loadBudget(budgetToml({ ...BUDGET, preklep_max: 1 })), /neznámé klíče/);
});

test("skutečná data/output-budget.toml je platná", () => {
  loadBudget(readFileSync(join(ROOT, "data/output-budget.toml"), "utf8"));
});

test("CLI: exit 1 na nafouknutém stromu, exit 0 na zdravém", () => {
  const bad = tree({ "index.html": page({ sidebarLinks: 2000 }) });
  const good = tree({ "index.html": page() });
  const budgetDir = mkdtempSync(join(tmpdir(), "output-budget-toml-"));
  const budgetFile = join(budgetDir, "budget.toml");
  writeFileSync(budgetFile, budgetToml(BUDGET));
  try {
    const r1 = spawnSync(process.execPath, [SCRIPT, "--dir", bad, "--budget", budgetFile], { encoding: "utf8" });
    assert.equal(r1.status, 1, r1.stdout + r1.stderr);
    assert.match(r1.stderr, /FAIL/);
    const r2 = spawnSync(process.execPath, [SCRIPT, "--dir", good, "--budget", budgetFile], { encoding: "utf8" });
    assert.equal(r2.status, 0, r2.stdout + r2.stderr);
    assert.match(r2.stdout, /OK/);
  } finally {
    for (const d of [bad, good, budgetDir]) rmSync(d, { recursive: true, force: true });
  }
});
