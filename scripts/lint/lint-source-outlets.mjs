#!/usr/bin/env node
/*
 * Source-independence hygiene (coop task T-025).
 *
 * The site's corroboration status means ONE thing: at least two
 * INDEPENDENT publishers reported the same thing. Two mechanisms can
 * silently break that promise without any validator noticing, because
 * both look like "two sources" to a counter:
 *
 *   1. OUTLET ALIASING — the same publisher written two ways
 *      ("ČT24" vs "ČT24 (Česká televize)"). A claim citing one of each
 *      would count as two independent families while being one.
 *   2. SAME-OUTLET DOUBLE COUNTING — a claim citing two articles from
 *      the same publisher. Legitimate as evidence, but the record must
 *      not read as independent confirmation.
 *
 * This linter fails the build on (1) and reports (2) so the number of
 * independent source FAMILIES is always visible, not inferred from the
 * number of source records. It does not judge content — only whether
 * the dataset's own independence claim is structurally sound.
 *
 * A third hazard is flagged, not failed: agency (ČTK) wire copy
 * republished by several outlets is not independent reporting either.
 * That one needs a human read of each article, so it is listed as a
 * warning for review rather than mechanically enforced.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRecordTables } from "../dossier/lib/record-tables.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Canonical key for a publisher name: lowercase, drop a parenthetical
// qualifier and common domain suffixes. Two outlet strings sharing a key
// are the same publisher written differently.
export function outletKey(outlet) {
  return (outlet || "")
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\.(cz|com|org|net)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const tables = buildRecordTables(ROOT);
const errors = [];
const warnings = [];

// --- 1. outlet aliasing (blocking) ---------------------------------------
const byKey = new Map();
for (const s of tables.sources) {
  if (!s.outlet) continue;
  const key = outletKey(s.outlet);
  if (!byKey.has(key)) byKey.set(key, new Map());
  const variants = byKey.get(key);
  if (!variants.has(s.outlet)) variants.set(s.outlet, []);
  variants.get(s.outlet).push(`${s.dossier}/${s.src_id}`);
}
for (const [key, variants] of byKey) {
  if (variants.size < 2) continue;
  const detail = [...variants.entries()]
    .map(([name, ids]) => `"${name}" (${ids.join(", ")})`)
    .join(" vs. ");
  errors.push(
    `outlet "${key}" is recorded under ${variants.size} different names — ${detail}. ` +
      `Pick one spelling: a claim citing two variants would count as two independent sources while being one publisher.`,
  );
}

// --- 2. same-outlet double counting inside one claim (reported) ----------
const sourceIndex = new Map(tables.sources.map((s) => [`${s.dossier}/${s.src_id}`, s]));
let claimsWithRepeatOutlet = 0;
for (const c of tables.claims) {
  const outlets = c.sources
    .map((sid) => sourceIndex.get(`${c.dossier}/${sid}`)?.outlet)
    .filter(Boolean);
  const families = new Set(outlets.map(outletKey));
  if (outlets.length > families.size) {
    claimsWithRepeatOutlet++;
    if (c.status === "status-corroborated" && families.size < 2) {
      errors.push(
        `${c.dossier}/${c.clm_id}: status is CORROBORATED but all ${outlets.length} cited sources are one publisher (${[...families].join(", ")}) — that is one source family, not independent confirmation.`,
      );
    }
  }
  if (c.status === "status-corroborated" && families.size < 2) {
    errors.push(
      `${c.dossier}/${c.clm_id}: status is CORROBORATED with only ${families.size} independent publisher(s).`,
    );
  }
}

// --- 3. agency-wire origin (warning only) --------------------------------
for (const c of tables.claims) {
  if (c.status !== "status-corroborated") continue;
  const wire = c.sources
    .map((sid) => sourceIndex.get(`${c.dossier}/${sid}`))
    .filter((s) => s && /ČTK/i.test(s.outlet || ""));
  const families = new Set(
    c.sources.map((sid) => outletKey(sourceIndex.get(`${c.dossier}/${sid}`)?.outlet)).filter(Boolean),
  );
  if (wire.length >= 2 && families.size < 3) {
    warnings.push(
      `${c.dossier}/${c.clm_id}: corroborated, but ${wire.length} of its sources are agency-derived (ČTK). Republished wire copy is not independent reporting — confirm a genuinely separate publisher read the story.`,
    );
  }
}

console.log(
  `lint:source-outlets — ${tables.sources.length} source(s), ${byKey.size} distinct publisher(s), ` +
    `${tables.claims.length} claim(s) checked; ${claimsWithRepeatOutlet} claim(s) cite the same publisher more than once.`,
);
for (const w of warnings) console.log(`  WARN ${w}`);
if (errors.length) {
  console.log(`\n${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  console.log("\nFAILED");
  process.exit(1);
}
console.log("OK — no outlet aliasing, every CORROBORATED claim has ≥2 independent publishers.");
