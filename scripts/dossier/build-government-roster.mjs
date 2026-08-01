#!/usr/bin/env node
/*
 * Generates a global CONTEXT entity record for every member of the
 * government roster in data/government.toml — the factual "who holds
 * which office" public record, deliberately the weakest publication
 * state this repo has.
 *
 * T-028 fáze H: cílem je KANONICKÝ dataset
 * (data/dossiers/_shared/entities/<id>.json) — content/entities/** je
 * generovaný adaptér a tento skript do něj NIKDY nezapisuje (dřívější
 * insert-only zápis government_* polí do front matter zanikl; kanonickým
 * vlastníkem government_office/party je data/government.toml, view
 * modely je z něj projektují šablonám).
 *
 * What this is NOT: a way to create dossier coverage of anyone.
 * Generated records are always publicationRole = "context",
 * dossierEnabled = false, dossierStatus = "not_authorized",
 * coverageState = "referenced" — the exact combination
 * validate-authorization.mjs allows for a non-subject. That gate fails
 * the build if a context entity is ever marked authorized/enabled, so
 * this generator cannot be used (or modified) to smuggle someone into
 * dossier coverage without a real, dated, per-subject entry in
 * AGENTS.md's append-only log.
 *
 * Never overwrites an existing canonical record. Idempotent: safe to
 * re-run after editing data/government.toml; it only creates records
 * that don't exist yet.
 *
 * Usage: node scripts/dossier/build-government-roster.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROSTER = join(ROOT, "data", "government.toml");
const ENTITIES_DIR = join(ROOT, "data", "dossiers", "_shared", "entities");
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

// Registr entit je sort_by weight (kanonické `order`) — nový roster
// záznam dostane pozici za dnešním maximem, nikdy nepřečísluje existující.
const existingOrders = readdirSync(ENTITIES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(ENTITIES_DIR, f), "utf8")).order ?? 0);
let nextOrder = (existingOrders.length ? Math.max(...existingOrders) : 0) + 1;

const created = [];
const skipped = [];

for (const m of members) {
  const file = join(ENTITIES_DIR, `${m.entity_id}.json`);
  if (existsSync(file)) {
    skipped.push(m.entity_id);
    continue;
  }
  const tenure = [
    m.since ? `ve funkci od ${m.since}` : null,
    m.until ? `ve funkci do ${m.until}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const record = {
    $schema: "https://vomaste.cz/schemas/canonical/entity.schema.json",
    schemaVersion: 1,
    "@context": "https://vomaste.cz/context/v1.jsonld",
    "@id": `https://vomaste.cz/id/entities/${m.entity_id}`,
    "@type": "vomaste:Entity",
    recordType: "entity",
    identifier: m.entity_id,
    entityId: m.entity_id,
    title: `${m.name} (${m.office})`,
    entityType: "person",
    publicationRole: "context",
    dossierEnabled: false,
    dossierStatus: "not_authorized",
    coverageState: "referenced",
    dossiers: [],
    snapshotDate: snapshot,
    description: `${m.name} — ${m.office} (${governmentName}, stav k ${snapshot}). Kontextový záznam veřejné funkce z oficiálního zdroje, ne dossier.`,
    order: nextOrder++,
    provenance: {
      discoveredAt: verifiedAt,
      discoveredVia: [`government-roster-${snapshot}`],
      claimRefs: [],
      sourceRefs: [],
    },
    content: [
      {
        type: "markdown",
        value:
          `Kontextová entita ze složení vlády — uvedena proto, že podle oficiálního\n` +
          `seznamu členů vlády (${governmentName}, ověřeno ${verifiedAt} na\n` +
          `<${sourceUrl}>) zastává veřejnou funkci **${m.office}**${tenure ? ` (${tenure})` : ""}.\n\n` +
          `Tato stránka **není dossier**. Zaznamenává výhradně veřejnou funkci z\n` +
          `oficiálního zdroje — žádné tvrzení, obvinění, kauzu ani hodnocení. Rozsah\n` +
          `pokrytí kterékoli reálné osoby na tomto webu určuje výhradně append-only\n` +
          `autorizační log v \`AGENTS.md\`; přítomnost v tomto seznamu na něm nic\n` +
          `nemění a sama o sobě nikdy nevede k dossieru.`,
      },
    ],
  };

  if (!dryRun) writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
  created.push(m.entity_id);
}

console.log(
  `build-government-roster: ${members.length} roster member(s); ` +
    `${created.length} canonical record(s) ${dryRun ? "would be created" : "created"}${created.length ? ` (${created.join(", ")})` : ""}; ` +
    `${skipped.length} already present${skipped.length ? "" : ""}. ` +
    `Content adaptéry se regenerují v data:build (žádný zápis do content/).`,
);
if (created.length && !dryRun) {
  console.log("POZOR: nové kanonické záznamy — spusť znovu npm run data:build (validace + regenerace adaptérů).");
}
