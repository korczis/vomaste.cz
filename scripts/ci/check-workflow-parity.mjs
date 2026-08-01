#!/usr/bin/env node
/*
 * Guard against CI/local build drift (coop task T-026).
 *
 * The deploy workflow used to re-list every build step by hand. Steps added
 * to `npm run build` afterwards were never added there, so for weeks the
 * production site silently lacked the artifacts a green local build
 * produced: /data/graph.jsonld, /data/dossiers/*.jsonld and
 * /data/jsonld-manifest.json all returned 404 on vomaste.cz while
 * `npm run build` passed locally. The JSON-LD export routes documented in
 * README as live simply did not exist in production — exactly the
 * "claimed but not enforced" failure the constitution (§8) forbids.
 *
 * The fix is structural: the workflow calls `npm run build`, so the pipeline
 * is defined once. This check makes that structural fix permanent — it fails
 * if the workflow stops calling `npm run build`, or if it starts re-listing
 * pipeline steps individually again.
 *
 * It deliberately does NOT try to diff step lists. Enumerating steps is the
 * bug; the rule is "don't enumerate", and that is what gets checked.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW = join(ROOT, ".github/workflows/deploy.yml");
const PIPELINE = join(ROOT, "scripts/build/pipeline.mjs");

const workflow = readFileSync(WORKFLOW, "utf8");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

const errors = [];

// 1. the workflow must run the whole pipeline through one entry point
if (!/run:\s*npm run build\s*$/m.test(workflow)) {
  errors.push(
    "deploy.yml does not run `npm run build`. The full pipeline must be invoked through the single entry point in package.json, not re-listed step by step.",
  );
}

// 2. no step may re-list a pipeline sub-script; that is how the drift happened.
// `npm run test` is exempt: it is part of `npm run build` but also worth
// failing fast on, and running it twice costs seconds.
const EXEMPT = new Set(["build", "test"]);
// Scripts the build pipeline chains: from the legacy `&&` chain in
// package.json (historical form) AND from the pipeline orchestrator
// (T-028 fáze G — `npm run build` deleguje na scripts/build/pipeline.mjs,
// takže seznam kroků žije tam).
const chained = new Set(
  Object.keys(pkg.scripts).filter((s) => !EXEMPT.has(s) && pkg.scripts.build.includes(`npm run ${s}`)),
);
if (existsSync(PIPELINE)) {
  const { MODES } = await import(pathToFileURL(PIPELINE).href);
  for (const step of MODES?.build ?? []) {
    if (typeof step === "string" && !EXEMPT.has(step)) chained.add(step);
  }
}
const relisted = [...chained].filter((s) =>
  new RegExp(`run:\\s*npm run ${s.replace(/[:.]/g, "\\$&")}\\s*$`, "m").test(workflow),
);
if (relisted.length) {
  errors.push(
    `deploy.yml re-lists ${relisted.length} script(s) that \`npm run build\` already chains: ${relisted.join(", ")}. ` +
      "Remove them — hand-maintained copies of the pipeline drift, and the drift is invisible until production breaks.",
  );
}

// 3. the artifact path must be what zola builds
if (!/path:\s*\.\/public\s*$/m.test(workflow)) {
  errors.push("deploy.yml does not upload ./public as the Pages artifact.");
}

console.log(
  `check-workflow-parity — deploy.yml checked against ${Object.keys(pkg.scripts).length} npm script(s); ` +
    `${chained.size} of them are chained by \`npm run build\` (via scripts/build/pipeline.mjs).`,
);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("OK — CI runs the same pipeline as a local build, through one entry point.");
