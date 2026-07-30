#!/usr/bin/env node
/*
 * Generates a global CONTEXT entity page for every member of the government
 * roster in data/government.toml — the factual "who holds which office"
 * public record, deliberately the weakest publication state this repo has.
 *
 * What this is NOT: a way to create dossier coverage of anyone. Generated
 * pages are always publication_role = "context", dossier_enabled = false,
 * dossier_status = "not_authorized", coverage_state = "referenced" — the
 * exact combination `validate-authorization.mjs` allows for a non-subject.
 * That script fails the build if a context entity is ever marked
 * authorized/dossier_enabled, so this generator cannot be used (or
 * modified) to smuggle someone into dossier coverage without a real,
 * dated, per-subject entry in AGENTS.md's append-only log.
 *
 * Never overwrites an existing entity page. Several roster members already
 * have entity pages that were discovered through cited reporting on an
 * authorized topic (e.g. babis, macinka, cerveny) and carry richer, hand-
 * curated graph/claim/source metadata — clobbering those with a bare
 * roster stub would be data loss, so they are reported as skipped.
 *
 * Idempotent: safe to re-run after editing data/government.toml; it only
 * creates pages that don't exist yet.
 *
 * Usage: node scripts/dossier/build-government-roster.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROSTER = join(ROOT, "data", "government.toml");
const ENTITIES_DIR = join(ROOT, "content", "entities");
const dryRun = process.argv.includes("--dry-run");

const text = readFileSync(ROSTER, "utf8");
const topLevel = text.split(/\n\[\[members\]\]/)[0];
const str = (block, key) =>
  (block.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;

const snapshot = str(topLevel, "snapshot");
const verifiedAt = str(topLevel, "verified_at");
const sourceUrl = str(topLevel, "source_url");
const governmentName = str(topLevel, "government");

if (!snapshot || !verifiedAt || !sourceUrl || !governmentName) {
  console.error(
    "build-government-roster: data/government.toml must define snapshot, verified_at, source_url and government.",
  );
  process.exit(1);
}

const blocks = [...text.matchAll(/\[\[members\]\]\n([\s\S]*?)(?=\n\[\[members\]\]|\n*$)/g)].map(
  (m) => m[1],
);

const members = blocks.map((b) => ({
  entity_id: str(b, "entity_id"),
  name: str(b, "name"),
  office: str(b, "office"),
  party: str(b, "party"),
  since: str(b, "since"),
  until: str(b, "until"),
}));

const missing = members.filter((m) => !m.entity_id || !m.name || !m.office);
if (missing.length > 0) {
  console.error(
    `build-government-roster: ${missing.length} roster entr(ies) missing entity_id, name or office.`,
  );
  process.exit(1);
}

const seen = new Set();
for (const m of members) {
  if (seen.has(m.entity_id)) {
    console.error(`build-government-roster: duplicate entity_id "${m.entity_id}" in roster.`);
    process.exit(1);
  }
  seen.add(m.entity_id);
}

const created = [];
const updated = [];
const skipped = [];

// content/entities/_index.md is sort_by = "weight" — Zola silently IGNORES
// (does not build) a page in a sorted section that has no weight, so every
// generated page needs one. Existing, hand-curated entities occupy 1..N;
// roster pages start after the current maximum so they sort last and never
// renumber an existing page.
const existingWeights = readdirSync(ENTITIES_DIR)
  .filter((f) => f !== "_index.md" && f.endsWith(".md"))
  .map((f) => {
    const m = readFileSync(join(ENTITIES_DIR, f), "utf8").match(/^weight\s*=\s*(\d+)/m);
    return m ? Number(m[1]) : 0;
  });
let nextWeight = (existingWeights.length ? Math.max(...existingWeights) : 0) + 1;

for (const m of members) {
  const file = join(ENTITIES_DIR, `${m.entity_id}.md`);
  if (existsSync(file)) {
    // Never rewrite a hand-curated page — but DO add the roster fields if
    // they're missing, so the machine-readable export covers every member
    // and not only the generated ones. Insert-only: three fields appended
    // to the end of the [extra] block, nothing existing touched.
    const text = readFileSync(file, "utf8");
    if (/^government_office\s*=/m.test(text)) {
      skipped.push(m.entity_id);
      continue;
    }
    const fmEnd = text.indexOf("\n+++", 3);
    if (fmEnd === -1) {
      console.error(`build-government-roster: entities/${m.entity_id}.md has malformed front matter — skipped.`);
      skipped.push(m.entity_id);
      continue;
    }
    const fields =
      `government_office = "${m.office}"\n` +
      `government_party = "${m.party ?? ""}"\n` +
      `government_snapshot = "${snapshot}"\n`;
    const updatedText = text.slice(0, fmEnd + 1) + fields + text.slice(fmEnd + 1);
    if (!dryRun) writeFileSync(file, updatedText);
    updated.push(m.entity_id);
    continue;
  }
  const weight = nextWeight++;
  const tenure = [
    m.since ? `ve funkci od ${m.since}` : null,
    m.until ? `ve funkci do ${m.until}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const body = `+++
title = "${m.name} (${m.office})"
description = "${m.name} — ${m.office} (${governmentName}, stav k ${snapshot}). Kontextový záznam veřejné funkce z oficiálního zdroje, ne dossier."
template = "entity.html"
weight = ${weight}

[extra]
record_type = "entity"
entity_id = "${m.entity_id}"
entity_type = "person"
subject = false
publication_role = "context"
dossier_enabled = false
dossier_status = "not_authorized"
coverage_state = "referenced"
discovered_at = "${verifiedAt}"
discovered_via = ["government-roster-${snapshot}"]
dossiers = []
claims = []
sources = []
government_office = "${m.office}"
government_party = "${m.party ?? ""}"
government_snapshot = "${snapshot}"
+++

Kontextová entita ze složení vlády — uvedena proto, že podle oficiálního
seznamu členů vlády (${governmentName}, ověřeno ${verifiedAt} na
<${sourceUrl}>) zastává veřejnou funkci **${m.office}**${tenure ? ` (${tenure})` : ""}.

Tato stránka **není dossier**. Zaznamenává výhradně veřejnou funkci z
oficiálního zdroje — žádné tvrzení, obvinění, kauzu ani hodnocení. Rozsah
pokrytí kterékoli reálné osoby na tomto webu určuje výhradně append-only
autorizační log v \`AGENTS.md\`; přítomnost v tomto seznamu na něm nic
nemění a sama o sobě nikdy nevede k dossieru.
`;

  if (!dryRun) writeFileSync(file, body);
  created.push(m.entity_id);
}

console.log(
  `build-government-roster: ${members.length} roster member(s); ` +
    `${created.length} page(s) ${dryRun ? "would be created" : "created"}${created.length ? ` (${created.join(", ")})` : ""}; ` +
    `${updated.length} existing page(s) ${dryRun ? "would get" : "got"} roster fields added${updated.length ? ` (${updated.join(", ")})` : ""}; ` +
    `${skipped.length} already complete${skipped.length ? ` (${skipped.join(", ")})` : ""}.`,
);
