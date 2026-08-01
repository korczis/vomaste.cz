#!/usr/bin/env node
/*
 * Append-only audit trail of every entity/relation as it first enters the
 * system. Unlike data/generated/* (gitignored, fully rebuilt every run),
 * data/discovery-log.jsonl is a COMMITTED file this script only ever
 * appends to — it never rewrites or removes an existing line, the same
 * append-only discipline as AGENTS.md's authorization log and
 * data/dossiers/<slug>/updates.toml.
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
 * T-028 fáze G — ZÁMĚRNÁ VÝJIMKA (blokováno inventářem migrace):
 * `discovered_from` u entit se skládá z provenienčních polí front matter
 * (`claims`/`sources`/`dossiers` — ručně kurátorovaná stopa objevení),
 * která kanonický model v1 vědomě nepřenáší (viz inventář v
 * docs/migrations/json-first-migration-report.md) a která NEJSOU
 * odvoditelná z compiled modelu. Log je navíc append-only KOMMITOVANÝ
 * soubor: pro už zalogované záznamy (dnes všechny) se nečte nic a
 * výstup se nemění; nové řádky vznikají jen pro nové záznamy. Přepnutí
 * na compiled model proběhne ve fázi H spolu s rozhodnutím o těchto
 * polích.
 */
import { readFileSync, readdirSync, appendFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENTITIES_ROOT = join(ROOT, "content/entities");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const LOG_FILE = join(ROOT, "data/discovery-log.jsonl");
const REPORT_FILE = join(ROOT, "reports/discovery-report.md");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
}
function frontMatterOf(text) {
  const fmEnd = text.indexOf("\n+++", 3);
  return text.slice(0, fmEnd);
}

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

for (const file of readdirSync(ENTITIES_ROOT).filter((f) => f !== "_index.md" && f.endsWith(".md"))) {
  const text = readFileSync(join(ENTITIES_ROOT, file), "utf8");
  const fm = frontMatterOf(text);
  const id = extractField(fm, "entity_id");
  if (!id || existingIds.has(id)) continue;
  newLines.push(
    JSON.stringify({
      logged_at: today,
      record_id: id,
      record_type: "entity",
      discovered_from: {
        claims: extractArrayField(fm, "claims"),
        sources: extractArrayField(fm, "sources"),
        dossiers: extractArrayField(fm, "dossiers"),
      },
      action: "created",
    }),
  );
  existingIds.add(id);
}

const dossierSlugs = readdirSync(DOSSIERS_ROOT).filter((f) => statSync(join(DOSSIERS_ROOT, f)).isDirectory());
for (const slug of dossierSlugs) {
  const relDir = join(DOSSIERS_ROOT, slug, "relations");
  if (!existsSync(relDir)) continue;
  for (const file of readdirSync(relDir).filter((f) => f !== "_index.md" && f.endsWith(".md"))) {
    const text = readFileSync(join(relDir, file), "utf8");
    const fm = frontMatterOf(text);
    const id = extractField(fm, "rel_id");
    if (!id || existingIds.has(id)) continue;
    newLines.push(
      JSON.stringify({
        logged_at: today,
        record_id: id,
        record_type: "relation",
        discovered_from: {
          source_entity: extractField(fm, "source"),
          target_entity: extractField(fm, "target"),
          claims: extractArrayField(fm, "claims"),
          sources: extractArrayField(fm, "sources"),
          dossier: slug,
        },
        action: "created",
      }),
    );
    existingIds.add(id);
  }
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
