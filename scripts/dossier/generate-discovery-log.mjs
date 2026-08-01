#!/usr/bin/env node
/*
 * Append-only audit trail of every entity/relation as it first enters the
 * system. Unlike data/generated/* (gitignored, fully rebuilt every run),
 * data/discovery-log.jsonl is a COMMITTED file this script only ever
 * appends to — it never rewrites or removes an existing line, the same
 * append-only discipline as AGENTS.md's authorization log.
 *
 * This is a record of *what the system observed and when*, not a
 * publication decision — logging an entity here has no bearing on whether
 * it's ever authorized (see scripts/dossier/authorize-entity.mjs, the only
 * thing that changes that).
 *
 * Each line is one JSON object:
 *   { "logged_at": "YYYY-MM-DD", "record_id": "...", "record_type":
 *     "entity"|"relation", "discovered_from": {...}, "action": "created" }
 *
 * T-028 fáze H: čte VÝHRADNĚ compiled kanonický model. `discovered_from`
 * u entit jde z entity.provenance.claimRefs/sourceRefs (kurátorovaná
 * stopa objevení, od fáze H kanonická — viz
 * schemas/canonical/entity.schema.json) + entity.dossiers; u vztahů
 * z kanonického relation záznamu. Pro už zalogované záznamy se nic
 * nečte a výstup se nemění (append-only).
 */
import { readFileSync, appendFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel, localIds, localPart } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG_FILE = join(ROOT, "data/discovery-log.jsonl");
const REPORT_FILE = join(ROOT, "reports/discovery-report.md");

const existingIds = new Set();
const existingLines = [];
if (existsSync(LOG_FILE)) {
  for (const line of readFileSync(LOG_FILE, "utf8").split("\n").filter(Boolean)) {
    existingLines.push(line);
    try {
      existingIds.add(JSON.parse(line).record_id);
    } catch (e) {
      // malformed line — leave it in place (append-only means we never
      // rewrite the file), just don't let it break parsing of the rest.
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
const newLines = [];
const compiled = getCompiledModel(ROOT);

for (const w of compiled.entities) {
  const r = w.record;
  const id = r.entityId;
  if (!id || existingIds.has(id)) continue;
  newLines.push(
    JSON.stringify({
      logged_at: today,
      record_id: id,
      record_type: "entity",
      discovered_from: {
        claims: r.provenance?.claimRefs ?? [],
        sources: r.provenance?.sourceRefs ?? [],
        dossiers: r.dossiers ?? [],
      },
      action: "created",
    }),
  );
  existingIds.add(id);
}

for (const w of compiled.records) {
  if (w.registry !== "relations") continue;
  const r = w.record;
  const id = r.identifier;
  if (!id || existingIds.has(id)) continue;
  newLines.push(
    JSON.stringify({
      logged_at: today,
      record_id: id,
      record_type: "relation",
      discovered_from: {
        source_entity: localPart(r.sourceEntity?.["@id"]),
        target_entity: localPart(r.targetEntity?.["@id"]),
        claims: localIds(r.claims),
        sources: localIds(r.sources),
        dossier: w.dossier,
      },
      action: "created",
    }),
  );
  existingIds.add(id);
}

if (newLines.length > 0) {
  appendFileSync(LOG_FILE, newLines.join("\n") + "\n", "utf8");
}

const allLines = [...existingLines, ...newLines].map((l) => JSON.parse(l));
const byDate = new Map();
for (const entry of allLines) {
  if (!byDate.has(entry.logged_at)) byDate.set(entry.logged_at, []);
  byDate.get(entry.logged_at).push(entry);
}
const dates = [...byDate.keys()].sort();

const md = [
  "# Discovery log report",
  "",
  "Append-only record of when each entity/relation first entered the",
  "system. This is provenance, not a publication decision — see",
  "`data/authorizations.toml` and `scripts/dossier/authorize-entity.mjs`",
  "for the only thing that actually authorizes a dossier.",
  "",
  `${allLines.length} record(s) logged across ${dates.length} day(s). ${newLines.length} new since last run.`,
  "",
  ...dates.flatMap((d) => [
    `## ${d}`,
    "",
    ...byDate.get(d).map((e) => `- \`${e.record_id}\` (${e.record_type}, ${e.action})`),
    "",
  ]),
].join("\n");

mkdirSync(dirname(REPORT_FILE), { recursive: true });
writeFileSync(REPORT_FILE, md, "utf8");

console.log(`Discovery log: ${newLines.length} new record(s) appended, ${allLines.length} total.`);
