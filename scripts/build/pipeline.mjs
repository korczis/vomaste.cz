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
 * kanonické validátory (validate-references R1–R7, validate-semantics
 * S1–S8, validate-registry-table T1–T8, schemas/canonical/) a schema
 * brána exportů žije přímo v build:data-exports.
 *
 * Kroky se spouštějí přes `npm run <script>`, aby definice příkazů
 * zůstala na jednom místě (package.json) a pipeline jen skládala pořadí.
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
  "build:secondary-providers",
  "validate:navigation",
  "validate:concepts",
  "validate:entity-types",
  "lint:component-reuse",
  "lint:hardcoded-records",
  "lint:generated-content",
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
  { raw: ["node", "scripts/build/with-build-lock.mjs", "zola", "build"] },
  "verify:navigation-counts",
  "verify:anchors",
  "verify:jsonld",
  "verify:full-pages",
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
  "validate:authorization",
  "validate:dossier-types",
  "build:entity-type-sections",
  "build:routes",
  "build:navigation",
  "build:secondary-providers",
  "validate:navigation",
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
  "validate:authorization",
  "verify:authorization-log",
  "validate:dossier-types",
  "validate:concepts",
  "validate:entity-types",
  "lint:component-reuse",
  "lint:hardcoded-records",
  "lint:generated-content",
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

console.log(`\npipeline: režim ${mode} OK (${((Date.now() - startedAt) / 1000).toFixed(1)} s).`);
}
