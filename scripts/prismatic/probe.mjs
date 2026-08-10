#!/usr/bin/env node
// prismatic:probe — real implementation (Fáze 2.1/4.9-ish drift check).
// Checks whether the specific files docs/audits/2026-08-05-prismatic-
// capability-map.md verified by actually opening them are still where
// that audit found them — file existence only, NO network calls, NO
// Mix/Elixir invocation. This is a cheap, fast sanity check for drift
// since the audit, not a re-run of the audit itself (see prismatic-
// drift-audit for that, still unimplemented).
//
// A missing file here does not necessarily mean "Prismatic broke" — it
// may mean the audit's understanding is stale and needs a fresh read.
// Either way, report it; never assume silently that a "reuse directly"
// capability still looks the way the audit described.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { resolvePlatformPath, validatePlatformPath } from "./lib/config.mjs";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log("prismatic:probe: usage: npm run prismatic:probe [-- --json]");
  console.log("File-existence drift check against docs/audits/2026-08-05-");
  console.log("prismatic-capability-map.md's verified paths. No network calls.");
  process.exit(0);
}
const asJson = args.includes("--json");

function findByBasename(dir, basename, maxDepth = 6) {
  if (!existsSync(dir)) return null;
  const stack = [{ path: dir, depth: 0 }];
  while (stack.length) {
    const { path, depth } = stack.pop();
    let entries;
    try {
      entries = readdirSync(path, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(path, entry.name);
      if (entry.isDirectory() && depth < maxDepth) {
        stack.push({ path: full, depth: depth + 1 });
      } else if (entry.isFile() && entry.name === basename) {
        return full;
      }
    }
  }
  return null;
}

function countGlob(dir, suffix) {
  if (!existsSync(dir)) return null;
  try {
    return readdirSync(dir).filter((f) => f.endsWith(suffix)).length;
  } catch {
    return null;
  }
}

const resolved = resolvePlatformPath();
const validation = validatePlatformPath(resolved.path);

if (!validation.ok) {
  const result = {
    available: false,
    reason: validation.reason,
    resolvedPath: resolved.path,
    checks: [],
  };
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`prismatic:probe: prismatic-platform not available at ${resolved.path} (${validation.reason}).`);
    console.log("Nothing to probe — this is a normal state, the public build doesn't need it.");
  }
  process.exit(0);
}

const root = resolved.path;
const apps = (name) => join(root, "apps", name);

// Exact full paths the Fáze 0 audit actually opened and verified — kept
// literally in sync with docs/audits/2026-08-05-prismatic-capability-map.md.
// If a row there is amended, amend the matching entry here in the same
// change.
const exactChecks = [
  { label: "ARES canonical adapter (reuse directly)", decision: "reuse", path: join(apps("prismatic_osint_sources"), "lib/prismatic_osint_sources/adapters/czech/ares.ex") },
  { label: "ARES duplicate #2 (reject as canonical)", decision: "reject", path: join(apps("prismatic"), "lib/prismatic/registries/ares_client.ex") },
  { label: "Justice.cz client (reuse directly)", decision: "reuse", path: join(apps("prismatic"), "lib/prismatic/registries/justice_client.ex") },
  { label: "Person investigation orchestration (wrap)", decision: "wrap", path: join(apps("prismatic"), "lib/prismatic/investigations/person_investigation.ex") },
  { label: "mix prismatic.osint.czech.business (reject — synthetic demo)", decision: "reject", path: join(apps("prismatic_web"), "lib/mix/tasks/prismatic.osint.czech.business.ex") },
  { label: "mix prismatic.osint.czech.property (reject — synthetic demo)", decision: "reject", path: join(apps("prismatic_web"), "lib/mix/tasks/prismatic.osint.czech.property.ex") },
  { label: "mix prismatic.osint.legal.investigation (reject — synthetic demo)", decision: "reject", path: join(apps("prismatic_web"), "lib/mix/tasks/prismatic.osint.legal.investigation.ex") },
  { label: "mix czech_registry.* CLI wrapper (needs further audit)", decision: "needs-audit", path: join(apps("prismatic_crawler"), "lib/mix/tasks/czech_registry.ex") },
  { label: "Bulk orchestrator (reuse as design template)", decision: "reuse-template", path: join(apps("prismatic_dd"), "lib/prismatic_dd/bulk/orchestrator.ex") },
  { label: "Bulk checkpoint store (reuse as design template)", decision: "reuse-template", path: join(apps("prismatic_dd"), "lib/prismatic_dd/bulk/checkpoint_store.ex") },
];

const results = exactChecks.map((c) => ({ ...c, exists: existsSync(c.path) }));

// Basename search (audit's own path citation used "..." for the middle
// segment, so we search by exact filename under the app instead of
// guessing intermediate directories).
const basenameChecks = [
  { label: "ProvenanceArtifacts (reuse as design template)", app: "prismatic_osint_core", basename: "provenance_artifacts.ex" },
  { label: "ProvenanceAssertions (reuse as design template)", app: "prismatic_osint_core", basename: "provenance_assertions.ex" },
];
const basenameResults = basenameChecks.map((c) => {
  const found = findByBasename(apps(c.app), c.basename);
  return { ...c, exists: found !== null, foundAt: found };
});

// Glob counts — confirms scale of two audit findings without opening
// every individual file again.
const schemasCount = countGlob(join(apps("prismatic_dd"), "lib/prismatic_dd/schemas"), ".ex");
const euAdaptersDir = join(apps("prismatic_osint_eu_institutions"), "lib/prismatic_osint_eu_institutions/adapters/eu");
const euAdaptersCount = countGlob(euAdaptersDir, ".ex");

// Negative check: the audit found this exact module missing, which is
// WHY mix dd.seed.pep/dd.seed.sanctions silently no-ops. If it now
// exists, that's actual news (upstream may have fixed the wiring bug).
const openSanctionsPath = findByBasename(apps("prismatic_osint_sources"), "open_sanctions.ex");

const report = {
  available: true,
  resolvedPath: root,
  commit: validation.commit,
  auditedFileChecks: [...results, ...basenameResults],
  schemasDirFileCount: schemasCount,
  euInstitutionsAdapterCount: euAdaptersCount,
  openSanctionsModuleNowExists: openSanctionsPath !== null,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log(`prismatic:probe — ${root} @ ${validation.commit.slice(0, 12)}`);
console.log("");
for (const r of report.auditedFileChecks) {
  const mark = r.exists ? "✓" : "✗ MISSING (drift since audit — re-verify before trusting the old decision)";
  console.log(`  [${r.decision}] ${r.label}: ${mark}`);
}
console.log("");
console.log(`  prismatic_dd/schemas/*.ex count: ${schemasCount ?? "(directory not found)"}`);
console.log(`  eu_institutions adapters count:  ${euAdaptersCount ?? "(directory not found)"}`);
if (report.openSanctionsModuleNowExists) {
  console.log(
    "  NOTE: open_sanctions.ex now exists under prismatic_osint_sources — the audit found this module",
  );
  console.log(
    "  missing (why PEP/sanctions bulk screening silently no-ops). Re-verify before trusting either finding.",
  );
} else {
  console.log("  open_sanctions.ex still not found (consistent with the audit's broken-wiring finding).");
}
process.exit(0);
