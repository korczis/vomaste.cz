#!/usr/bin/env node
/*
 * The ONLY path by which a context entity's dossier_status may become
 * "authorized". Deliberately interactive-only: refuses to run unless
 * attached to a real TTY, and requires a human to type the entity id,
 * the authorized scope in their own words, and an exact confirmation
 * phrase. It cannot be invoked non-interactively — not from CI, not from
 * a script, not from another agent's tool call with a --yes flag — because
 * there is no flag that skips the prompts. The scope text you type is
 * appended verbatim to AGENTS.md; there is no default and no
 * auto-generated wording.
 *
 * What it does, only after that confirmation:
 *   1. Appends a new dated, append-only entry to AGENTS.md's authorization
 *      log (never edits or removes any existing entry there).
 *   2. Appends a matching structured record to data/authorizations.toml.
 *   3. Flips the entity's own front matter: publication_role -> "subject",
 *      dossier_status -> "authorized", dossier_enabled -> true.
 *
 * It deliberately does NOT scaffold dossier content (claims, sources,
 * narrative) — authoring what the dossier actually says is a separate,
 * still-human, still-sourced editorial act. This script only makes an
 * entity *eligible*; scripts/dossier/validate-authorization.mjs still
 * fails the build if a dossier exists whose subject isn't authorized this
 * way, and content still needs real sources and claims written for it.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// T-028 fáze H: kanonickým záznamem entity je data/dossiers/_shared/
// entities/<id>.json — content/entities/** je generovaný adaptér.
const ENTITIES_ROOT = join(ROOT, "data/dossiers/_shared/entities");
const AGENTS_MD = join(ROOT, "AGENTS.md");
const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error(
    "authorize-entity: refuses to run without an interactive terminal.\n" +
      "This is deliberate — authorizing a new dossier subject must be a human\n" +
      "action taken at a keyboard, not something a script, CI job, or agent\n" +
      "can trigger non-interactively. Run this yourself, locally, in a real shell.",
  );
  process.exit(1);
}

const entityId = process.argv[2];
if (!entityId) {
  console.error("Usage: node scripts/dossier/authorize-entity.mjs <entity-id>");
  console.error("Example: node scripts/dossier/authorize-entity.mjs babis");
  process.exit(1);
}

const entityFile = join(ENTITIES_ROOT, `${entityId}.json`);
let entityRecord;
try {
  entityRecord = JSON.parse(readFileSync(entityFile, "utf8"));
} catch (e) {
  console.error(`No canonical entity record found at data/dossiers/_shared/entities/${entityId}.json`);
  process.exit(1);
}

const currentRole = entityRecord.publicationRole;
const currentStatus = entityRecord.dossierStatus;
const entityName = entityRecord.title ?? entityId;

if (currentRole === "subject" && currentStatus === "authorized") {
  console.log(`${entityName} (${entityId}) is already an authorized subject. Nothing to do.`);
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

console.log(`\nEntity: ${entityName} (${entityId})`);
console.log(`Current publication_role: ${currentRole}, dossier_status: ${currentStatus}\n`);
console.log("This will:");
console.log(`  - append a new dated authorization entry to AGENTS.md, in your own words`);
console.log(`  - add a matching record to data/authorizations.toml`);
console.log(`  - flip this entity's canonical publicationRole to "subject" and dossierStatus to "authorized"\n`);

const typedId = await ask(`Type the exact entity id to confirm you mean "${entityId}": `);
if (typedId.trim() !== entityId) {
  console.error("Entity id did not match. Aborted, nothing changed.");
  rl.close();
  process.exit(1);
}

const scope = await ask(
  "\nDescribe, in your own words, exactly what this authorization covers\n" +
    "(who, which topics/controversies, and any sourcing limits — this text\n" +
    "is appended verbatim to AGENTS.md's authorization log):\n> ",
);
if (!scope.trim() || scope.trim().length < 20) {
  console.error("Scope description is empty or too short. Aborted, nothing changed.");
  rl.close();
  process.exit(1);
}

const confirm = await ask(`\nType AUTHORIZE (all caps) to confirm this is your explicit, on-the-record decision: `);
rl.close();
if (confirm.trim() !== "AUTHORIZE") {
  console.error("Confirmation phrase did not match. Aborted, nothing changed.");
  process.exit(1);
}

// --- from here on, every step is a mechanical consequence of the human's
//     own typed confirmation above, not an independent decision ---
const today = new Date().toISOString().slice(0, 10);
const recordId = `AUTH-${today}-${entityId.toUpperCase()}`;

const agentsEntry = `\n### Scope extension, ${today}: ${entityName}\n\nAuthorized by the site owner, explicitly and on the record, ${today}:\n\n${scope.trim()}\n`;
writeFileSync(AGENTS_MD, readFileSync(AGENTS_MD, "utf8").replace(/\s*$/, "") + "\n" + agentsEntry, "utf8");

const authEntry = `\n[[authorizations]]\nid = "${recordId}"\nauthorized_at = "${today}"\nsubjects = ["${entityId}"]\nagents_md_section = "Scope extension, ${today}: ${entityName.replace(/"/g, '\\"')}"\nscope_summary = "${scope.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ")}"\n`;
writeFileSync(AUTHORIZATIONS_TOML, readFileSync(AUTHORIZATIONS_TOML, "utf8").replace(/\s*$/, "") + "\n" + authEntry, "utf8");

entityRecord.publicationRole = "subject";
entityRecord.dossierStatus = "authorized";
entityRecord.dossierEnabled = true;
writeFileSync(entityFile, `${JSON.stringify(entityRecord, null, 2)}\n`, "utf8");
console.log("Kanonický záznam entity aktualizován — spusť `npm run data:build` pro regeneraci adaptérů.");

console.log(`\nDone. ${entityName} is now an authorized subject (record ${recordId}).`);
console.log("Next: author the actual dossier content (claims, sources) yourself — this");
console.log("tool only recorded the authorization and made the entity eligible; it does");
console.log("not fabricate claims or generate a dossier's narrative content.");
