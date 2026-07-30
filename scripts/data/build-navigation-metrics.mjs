#!/usr/bin/env node
/*
 * Build-time executor for the named aggregate metrics defined in
 * scripts/data/navigation-metrics.registry.mjs. Writes a deterministic
 * generated manifest to data/generated/navigation-metrics.json.
 *
 * WHY BUILD-TIME AND NOT CLIENT-SIDE: vomaste.cz is a static Zola site. A
 * count fetched after DOMContentLoaded would flash, shift layout, vanish
 * without JavaScript and stay invisible to crawlers. Counting DOM nodes would
 * be worse still — it would measure the rendering, not the data. The numbers
 * belong in the server-rendered HTML, so they are computed before Zola runs.
 *
 * WHY THIS IS A SEPARATE STEP RATHER THAN PART OF build-navigation.mjs:
 * `build:navigation` runs BEFORE `build:jsonld-exports` in the build chain,
 * and these metrics read the canonical exports that the latter produces.
 * Folding metrics into build-navigation.mjs would force a reordering of a
 * pipeline that several other validators depend on. Emitting a second, small
 * generated file that templates join by metric ID keeps the existing order
 * untouched — so this must run AFTER `build:jsonld-exports`.
 *
 * DETERMINISM CONTRACT — the manifest must not churn:
 *   * metric keys are emitted in sorted order, never in registry order;
 *   * no wall-clock timestamp: `sourceDigest` is a content hash of the exact
 *     bytes the metrics were computed from, so an unchanged dataset produces
 *     a byte-identical manifest and therefore an empty git diff;
 *   * counts are Sets of canonical identities, so input ordering cannot
 *     change a result;
 *   * written atomically via a temp file + rename, so a killed build can
 *     never leave a half-written manifest that the next validator would read
 *     as authoritative. (Concurrent builds in this shared checkout are real:
 *     three zola processes were observed racing on 2026-07-30.)
 *
 * Usage:
 *   node scripts/data/build-navigation-metrics.mjs [--check]
 *
 *   --check  compute and compare against the committed manifest, write
 *            nothing, exit non-zero if they differ. For CI and for the
 *            pre-build validator.
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REGISTRY_VERSION,
  METRIC_DEFINITIONS,
  INTENTIONALLY_UNMEASURED,
  countDistinct,
} from "./navigation-metrics.registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "data", "generated", "navigation-metrics.json");
const CHECK_ONLY = process.argv.includes("--check");

function fail(message) {
  console.error(`build-navigation-metrics: ${message}`);
  process.exit(1);
}

// --- compute -------------------------------------------------------------

const digest = createHash("sha256");
const metrics = {};
// Sort by id so both the digest and the emitted object are order-stable
// regardless of how the registry array happens to be written.
const definitions = [...METRIC_DEFINITIONS].sort((a, b) => a.id.localeCompare(b.id));

for (const def of definitions) {
  const abs = path.join(ROOT, def.source);
  if (!existsSync(abs)) {
    fail(
      `metric "${def.id}" reads ${def.source}, which does not exist.\n` +
        "This step must run AFTER `npm run build:jsonld-exports`. Check the order in package.json.",
    );
  }

  const raw = readFileSync(abs, "utf8");
  // Hash the exact bytes counted, not a re-serialization — the digest is a
  // provenance claim about the input, so it must describe the real input.
  // NUL is the field delimiter: it cannot occur in JSON text, so content
  // cannot forge a field boundary. It is written as an escape so the file
  // stays plain text to git — a literal NUL makes git call it binary.
  digest.update(`${def.source}\0${raw}\0`);

  let parsed;
  try {
    // A real JSON parser, deliberately: a regex over JSON-LD is how silent
    // miscounts get shipped.
    parsed = JSON.parse(raw);
  } catch (err) {
    fail(`metric "${def.id}": ${def.source} is not valid JSON — ${err.message}`);
  }

  const records = Array.isArray(parsed) ? parsed : parsed?.items;
  let value;
  try {
    value = countDistinct(records);
  } catch (err) {
    fail(`metric "${def.id}": ${err.message}`);
  }

  // Guard the invariant the consumers rely on. A metric that cannot be
  // computed must break the build rather than render a plausible wrong badge.
  if (!Number.isInteger(value) || value < 0) {
    fail(`metric "${def.id}" produced ${JSON.stringify(value)}; expected a non-negative integer.`);
  }

  metrics[def.id] = {
    value,
    description: def.description,
    semantics: def.semantics,
    dedupe: def.dedupe,
    publication: def.publication,
    route: def.route,
    source: def.source,
  };
}

const manifest = {
  // Not hand-editable: regenerate with `npm run data:metrics`.
  generator: "scripts/data/build-navigation-metrics.mjs",
  schemaVersion: REGISTRY_VERSION,
  sourceDigest: `sha256:${digest.digest("hex")}`,
  metrics,
  intentionallyUnmeasured: INTENTIONALLY_UNMEASURED,
};

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

// --- check mode ----------------------------------------------------------

if (CHECK_ONLY) {
  if (!existsSync(OUT)) {
    fail("data/generated/navigation-metrics.json is missing — run `npm run data:metrics`.");
  }
  const committed = readFileSync(OUT, "utf8");
  if (committed !== serialized) {
    const before = JSON.parse(committed);
    console.error("build-navigation-metrics: generated manifest is STALE relative to the data.");
    for (const id of Object.keys(metrics)) {
      const was = before.metrics?.[id]?.value;
      const now = metrics[id].value;
      if (was !== now) console.error(`  ${id}: ${was} → ${now}`);
    }
    fail(
      "the manifest on disk disagrees with a fresh computation. data/generated/ is " +
        "gitignored, so this is not a stale-commit problem: either the generator is " +
        "non-deterministic, or the exports changed after data:metrics ran (a concurrent " +
        "build in this shared checkout). Re-run `npm run data:metrics`.",
    );
  }
  console.log(
    `build-navigation-metrics: OK — manifest matches the data (${definitions.length} metric(s)).`,
  );
  process.exit(0);
}

// --- write ---------------------------------------------------------------

mkdirSync(path.dirname(OUT), { recursive: true });
const tmp = `${OUT}.tmp-${process.pid}`;
writeFileSync(tmp, serialized);
renameSync(tmp, OUT);

console.log(
  `build-navigation-metrics: wrote ${path.relative(ROOT, OUT)} — ${definitions.length} metric(s):`,
);
for (const def of definitions) {
  console.log(`  ${def.id.padEnd(20)} ${String(metrics[def.id].value).padStart(5)}  → ${def.route}`);
}
