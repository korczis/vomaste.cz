#!/usr/bin/env node
// prismatic:plan — real implementation (Fáze 2.5, partial). Builds a
// deterministic, explainable job plan against vomaste's own compiled
// canonical model — no Prismatic invocation happens here, this only
// decides what COULD be planned and why.
//
// Deliberately scoped to the ONE capability the Fáze 0 audit marked
// "reuse directly" with real, tested code and a clear vomaste fit: ARES
// company-registry lookup for company/organization entities missing a
// stable IČO. Other capabilities (property, sanctions, EU institutions,
// etc.) are NOT planned here — the audit found them fabricated, broken,
// or unverified, and planning a job against them would imply they're
// safe to run, which they are not yet. Extend this list only after a
// capability moves to "reuse directly" AND is actually wired
// (prismatic:run doesn't exist yet either).
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel } from "../dossier/lib/compiled-model.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const out = { entity: null, dossier: null, all: false, maxRecords: null, json: false };
  for (const arg of argv) {
    if (arg === "--all") out.all = true;
    else if (arg === "--json") out.json = true;
    else if (arg.startsWith("--entity=")) out.entity = arg.slice("--entity=".length);
    else if (arg.startsWith("--dossier=")) out.dossier = arg.slice("--dossier=".length);
    else if (arg.startsWith("--max-records=")) out.maxRecords = Number(arg.slice("--max-records=".length));
    else if (arg === "--help" || arg === "-h") out.help = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log("prismatic:plan: usage: npm run prismatic:plan -- [--all | --entity=<id> | --dossier=<slug>] [--max-records=N] [--json]");
  console.log("Builds a job plan against vomaste's compiled model. Read-only, plans only —");
  console.log("does not invoke Prismatic (prismatic:run doesn't exist yet). Always effectively");
  console.log("a dry-run in this phase.");
  process.exit(0);
}
if (!args.all && !args.entity && !args.dossier) {
  console.error("prismatic:plan: pass --all, --entity=<id>, or --dossier=<slug> (see --help).");
  process.exit(2);
}

const compiled = getCompiledModel(ROOT);

const entities = compiled.entities;

// Entities are dossier: null in the compiled model (they're a global
// registry, potentially shared across several dossiers via .dossiers),
// so --dossier scoping checks that array; dossier-scoped registries
// (gaps, claims, ...) instead check the wrapper's own .dossier field.
function entityScopeFilter(w) {
  if (args.entity) return w.record.identifier === args.entity;
  if (args.dossier) return (w.record.dossiers ?? []).includes(args.dossier);
  return true; // --all
}
function dossierScopedFilter(w) {
  if (args.entity) return false; // --entity scopes the entity job type only
  if (args.dossier) return w.dossier === args.dossier;
  return true; // --all
}

const ARES_RELEVANT_TYPES = new Set(["company", "organization"]);

const jobs = [];
for (const w of entities.filter(entityScopeFilter)) {
  const record = w.record;
  const hasIco = !!record.externalIds?.ico;
  if (ARES_RELEVANT_TYPES.has(record.entityType) && !hasIco) {
    jobs.push({
      jobType: "entity-ares-lookup",
      capability: "ares-lookup",
      subjectRef: record.identifier,
      reason: `entityType="${record.entityType}" has no externalIds.ico`,
      auditDecision: "reuse directly (docs/audits/2026-08-05-prismatic-capability-map.md, row 1)",
    });
  }
}

// Informational only: gaps at high priority not checked in the last 30
// days. No audited capability maps onto "find a missing source" today
// (the audit's EU-institutions/business-financial/legal-investigation
// rows were all fabricated or broken) — surfaced so a human sees the
// backlog, explicitly NOT paired with a capability to run against it.
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const now = Date.now();
const gaps = compiled.records.filter((w) => w.registry === "gaps");
for (const w of gaps.filter(dossierScopedFilter)) {
  const record = w.record;
  if (record.priority !== "vysoká") continue;
  const checkedMs = record.checked ? new Date(record.checked).getTime() : 0;
  if (now - checkedMs > THIRTY_DAYS_MS) {
    jobs.push({
      jobType: "gap-stale-high-priority",
      capability: null,
      subjectRef: `${w.dossier}/${record.identifier}`,
      reason: `priority="vysoká", last checked ${record.checked ?? "(never)"}, >30 days ago`,
      auditDecision: "no mapped Prismatic capability today — informational only",
    });
  }
}

let limited = jobs;
if (args.maxRecords) limited = jobs.slice(0, args.maxRecords);

const plan = {
  planGeneratedAt: new Date(now).toISOString(),
  scope: args.entity ? `entity:${args.entity}` : args.dossier ? `dossier:${args.dossier}` : "all",
  totalJobs: jobs.length,
  includedJobs: limited.length,
  truncated: limited.length < jobs.length,
  jobs: limited,
};

if (args.json) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}

console.log(`prismatic:plan — scope: ${plan.scope}`);
console.log(`  ${plan.totalJobs} job(s) found${plan.truncated ? `, showing first ${plan.includedJobs} (--max-records)` : ""}.`);
const byType = new Map();
for (const j of limited) byType.set(j.jobType, (byType.get(j.jobType) ?? 0) + 1);
for (const [type, count] of byType) console.log(`  ${type}: ${count}`);
console.log("");
for (const j of limited) {
  console.log(`  [${j.jobType}] ${j.subjectRef} — ${j.reason}`);
  console.log(`      capability: ${j.capability ?? "(none mapped)"} — ${j.auditDecision}`);
}
if (jobs.length === 0) {
  console.log("  (no jobs in scope — either nothing qualifies, or --entity/--dossier matched nothing)");
}
if (byType.has("entity-ares-lookup")) {
  console.log("");
  console.log(
    "NOTE: entity-ares-lookup jobs assume Czech jurisdiction — ARES only indexes CZ-registered",
  );
  console.log(
    "entities. A foreign entity (many offshore-trust/shell-company records are) will correctly",
  );
  console.log(
    "come back with no match once prismatic:run exists; this plan does not filter by jurisdiction today.",
  );
}
console.log("");
console.log("This plan does not execute anything — prismatic:run does not exist yet.");
process.exit(0);
