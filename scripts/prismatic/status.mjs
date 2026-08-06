#!/usr/bin/env node
// prismatic:status — real implementation (Fáze 2.1/2.4). Reports whether
// a local prismatic-platform checkout is resolvable and usable as an
// upstream capability provider. Never fails just because Prismatic is
// absent — that is a normal, supported state (docs/adr/
// prismatic-platform-integration.md: the public build never depends on
// it). Exit 0 in that case too; a report is not the same as a check.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT,
  resolvePlatformPath,
  validatePlatformPath,
  contractVersionSupported,
} from "./lib/config.mjs";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log("prismatic:status: usage: npm run prismatic:status [-- --json]");
  console.log("Reports the resolved prismatic-platform path, its Git commit, and this");
  console.log("consumer's supported export-contract version. Exit 0 whether or not");
  console.log("Prismatic is actually present — absence is a normal, reported state.");
  process.exit(0);
}
const asJson = args.includes("--json");

const resolved = resolvePlatformPath();
const validation = validatePlatformPath(resolved.path);

const importsDir = join(ROOT, "data", "imports", "prismatic");
const priorRuns = existsSync(importsDir)
  ? readdirSync(importsDir).filter((f) => f.endsWith(".json")).length
  : 0;

const status = {
  resolvedPath: resolved.path,
  pathSource: resolved.source,
  available: validation.ok,
  reason: validation.ok ? null : validation.reason,
  commit: validation.ok ? validation.commit : null,
  contractVersionSupported: contractVersionSupported(),
  priorRunCount: priorRuns,
};

if (asJson) {
  console.log(JSON.stringify(status, null, 2));
  process.exit(0);
}

console.log(`prismatic:status`);
console.log(`  resolved path:      ${status.resolvedPath} (source: ${status.pathSource})`);
if (status.available) {
  console.log(`  available:          yes`);
  console.log(`  commit:             ${status.commit}`);
} else {
  console.log(`  available:          no (${status.reason})`);
  console.log(`  this is expected/OK if you haven't cloned prismatic-platform locally —`);
  console.log(`  the public vomaste.cz build never depends on it being present.`);
}
console.log(`  contract supported: ${status.contractVersionSupported}`);
console.log(`  prior import runs:  ${status.priorRunCount}`);
process.exit(0);
