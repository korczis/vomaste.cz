#!/usr/bin/env node
/*
 * Jediný orchestrační entrypoint build pipeline (T-028 fáze G).
 *
 *   node scripts/build/pipeline.mjs build   → plný build (npm run build)
 *   node scripts/build/pipeline.mjs dev     → rychlá podmnožina + zola serve
 *   node scripts/build/pipeline.mjs check   → validace bez generování
 *
 * PROČ: pořadí kroků buildu bylo dosud jeden dlouhý `&&` řetěz v
 * package.json — nečitelný, bez možnosti sdílet podmnožiny (dev/check)
 * a bez místa, kde pořadí a jeho DŮVODY zdokumentovat. Tenhle modul je
 * definuje jako data; `npm run build` na něj jen deleguje, takže CI
 * (deploy.yml přes check-workflow-parity.mjs) dál volá jediný vstup.
 *
 * Kanonická brána: KAŽDÝ režim začíná `data:validate` — build generátory
 * čtou výhradně compiled kanonický dataset (data/dossiers/**), takže
 * nevalidní kanonická data musí zastavit pipeline dřív, než cokoli
 * vygenerují. Od fáze H (T-028) je kanonický dataset JEDINÝ zdroj
 * pravdy: dřívější validátory obsahové vrstvy (validate:dossier,
 * validate:schemas, validate:graph) zanikly — jejich pravidla vlastní
 * kanonické validátory (validate-references R1–R8, validate-semantics
 * S1–S10, validate-registry-table T1–T8, schemas/canonical/) a schema
 * brána exportů žije přímo v build:data-exports.
 *
 * Kroky se spouštějí přes `npm run <script>`, aby definice příkazů
 * zůstala na jednom místě (package.json) a pipeline jen skládala pořadí.
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { acquireLock, releaseLock, LockTimeoutError } from "./with-build-lock.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Plný build — stejné pořadí jako dřívější `npm run build` řetěz,
// s `data:validate` navíc jako první krok (kanonická brána).
//
// Fáze F (JSON-first content adaptéry): hned po kanonické bráně se
// z compiled modelu vygenerují view modely (datový vstup šablon,
// data/generated/views/**, gitignored) a content adaptéry (staging),
// staging se synchronizuje do content/** (data:sync-content) a parity
// brána data:check-generated:content ověří, že content == staging.
// Pořadí je závazné: content validátory i zola build musí číst už
// synchronizovaný stav; view modely musí existovat před zola build,
// protože šablony je čtou přes load_data().
const BUILD_STEPS = [
  "data:validate",
  "data:views",
  "data:generate-content",
  "data:sync-content",
  // Evidenční plán práce (reports/evidence-plan.md + data/generated/
  // evidence-plan.json) — čistá projekce kanonického modelu, žádný vstup
  // pro Zolu. Běží hned po kanonické bráně, aby report nemohl být starší
  // než data; kdyby žil mimo pipeline, zastaral by první změnou dossieru.
  "report:evidence-plan",
  // Offline archive doctrine gate: no network and no Zone B dependency.
  // It makes every entity with a verified IČO carry ARES + sanitized Justice
  // coverage, verifies hashes and docket inventory, and proves that the
  // scheduled network refresh can only create a reviewable branch/PR.
  "archive:check",
  "test",
  "build:government-roster",
  "validate:authorization",
  "verify:authorization-log",
  "validate:dossier-types",
  "build:entity-type-sections",
  "build:routes",
  // Content parity brána běží až po build:routes — C4 (route parity) čte
  // data/generated/routes.json a před prvním build:routes by neexistoval
  // (fresh clone) nebo byl stale (změna kanonických dat v témže běhu).
  "data:check-generated:content",
  "build:navigation",
  "validate:navigation",
  "validate:concepts",
  "validate:learning",
  "validate:entity-types",
  "validate:media",
  "lint:component-reuse",
  "lint:template-contracts",
  "lint:hardcoded-records",
  "lint:generated-content",
  "validate:claude-tooling",
  "build:source-catalog",
  // Katalog toolingu: brána běží PŘED generátorem schválně. `--check`
  // porovnává commitnuté stránky a docs/TOOLING.md s tím, co by z dat
  // vzniklo — kdyby běžela až za generátorem, porovnávala by výstup se
  // sebou samým a nikdy by neselhala. Zároveň je to místo, kde build
  // spadne na příkazu přidaném do package.json / justfile /
  // .claude/skills bez záznamu v data/tooling/ (kontroly G1–G6 běží
  // v obou režimech). Generátor za ní pak doplní gitignorovaný view
  // model, který šablony čtou při `zola build`.
  "verify:tooling-catalog",
  "build:tooling-catalog",
  "build:data-exports",
  "build:graph-projections",
  "validate:graph-projections",
  "validate:directory-index",
  "build:jsonld-exports",
  "data:metrics",
  "validate:navigation-metrics",
  "build:search-index",
  "generate:candidates",
  "generate:discovery-log",
  "css:build",
  "js:build",
  // Lock coverage for this step (and everything that writes to
  // data/generated/ before it) comes from acquireLock() in main() below,
  // not from wrapping this one step — see with-build-lock.mjs's 2026-08-06
  // note for why a zola-build-only lock wasn't enough.
  { raw: ["zola", "build"] },
  "verify:navigation-counts",
  "verify:anchors",
  "verify:jsonld",
  // Sociální a SEO metadata (T-076): úplnost og:*/twitter:*, shoda
  // og:url s kanonickou URL, existence náhledového obrázku, meze délky
  // z data/seo.toml a shoda titulku/popisu se stránkovým uzlem JSON-LD.
  // Musí běžet po zola build — kontroluje vydané HTML, ne šablony.
  "verify:og",
  "verify:full-pages",
  // Každá vydaná <table> musí být ve scroll kontextu (.dossier-prose nebo
  // overflow-x-auto obal z macros/table.html) — jinak by se na mobilu
  // hroutila místo scrollování. Doplněk lint:component-reuse na úrovni
  // hotového HTML: markdown tabulky šablonou neprojdou, vidí je až
  // post-build průchod nad public/.
  "verify:table-responsive",
  "verify:export",
];

// Dev — rychlá podmnožina pro `zola serve` (stejné kroky jako dřívější
// `npm run dev`, s kanonickou bránou na začátku), končí interaktivním
// serverem.
const DEV_STEPS = [
  "data:validate",
  "data:views",
  "data:generate-content",
  "data:sync-content",
  "archive:check",
  "validate:authorization",
  "validate:dossier-types",
  "build:entity-type-sections",
  "build:routes",
  "build:navigation",
  "validate:navigation",
  "build:source-catalog",
  "build:tooling-catalog",
  "build:data-exports",
  "build:graph-projections",
  "validate:graph-projections",
  "build:jsonld-exports",
  "data:metrics",
  "validate:navigation-metrics",
  "build:search-index",
  "generate:candidates",
  "generate:discovery-log",
  "css:build",
  "js:build",
  { raw: ["zola", "serve"] },
];

// Check — validace bez generování: jen kroky, které nic nezapisují a
// nepotřebují vygenerované artefakty (post-build verify:* sem nepatří,
// ty potřebují public/; validate:navigation & spol. potřebují
// data/generated/).
const CHECK_STEPS = [
  "data:validate",
  "archive:check",
  "validate:authorization",
  "verify:authorization-log",
  "validate:dossier-types",
  "validate:concepts",
  "validate:learning",
  "validate:entity-types",
  "validate:media",
  "lint:component-reuse",
  "lint:template-contracts",
  "lint:hardcoded-records",
  "lint:generated-content",
  "validate:claude-tooling",
  "lint:source-outlets",
  "check:workflow-parity",
];

export const MODES = { build: BUILD_STEPS, dev: DEV_STEPS, check: CHECK_STEPS };

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (!isMain) {
  // Import z testů — jen definice, nic nespouštět.
} else {
  main();
}

function main() {
const mode = process.argv[2];
if (!MODES[mode]) {
  console.error(`pipeline: neznámý režim "${mode ?? ""}" — použij build | dev | check.`);
  process.exit(2);
}

const steps = MODES[mode];
console.log(`pipeline: režim ${mode} — ${steps.length} krok(ů).`);
const startedAt = Date.now();

// `build` je jediný režim, který od data:views dál PÍŠE do data/generated/
// a nakonec do public/ (zola build) — přesně to, co with-build-lock.mjs
// chrání. Zamykáme na celý běh, ne jen na zola krok (viz komentář 2026-08-06
// ve with-build-lock.mjs): dva souběžné `npm run build` ve stejném
// checkoutu se dřív přetahovaly už o data/generated/views/**, dřív než
// jeden z nich vůbec došel na zola build, kde by je zamykání zachytilo.
// `dev` končí interaktivním `zola serve`, který může běžet hodiny — zamykat
// by na tu dobu blokovalo každý jiný build ve stejném checkoutu, proto se
// nezamyká. `check` nic negeneruje, zamykání nepotřebuje.
if (mode === "build") {
  try {
    acquireLock([`node scripts/build/pipeline.mjs ${mode}`]);
  } catch (err) {
    if (err instanceof LockTimeoutError) process.exit(1);
    throw err;
  }
}

for (const [i, step] of steps.entries()) {
  const [cmd, ...args] = typeof step === "string" ? ["npm", "run", step] : step.raw;
  const label = typeof step === "string" ? step : step.raw.join(" ");
  console.log(`\npipeline [${i + 1}/${steps.length}] ${label}`);
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (res.error) {
    console.error(`pipeline: krok "${label}" selhal — ${res.error.message}`);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`pipeline: krok "${label}" skončil s kódem ${res.status} — zastavuji.`);
    process.exit(res.status ?? 1);
  }
}

if (mode === "build") {
  releaseLock();
}

console.log(`\npipeline: režim ${mode} OK (${((Date.now() - startedAt) / 1000).toFixed(1)} s).`);
}
