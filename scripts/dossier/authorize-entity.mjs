#!/usr/bin/env node
/*
 * The ONLY path by which a context entity's dossier_status may become
 * "authorized". The normal path is interactive and requires a human to
 * type the entity id, scope, and confirmation phrase. An agent may instead
 * record the site owner's clear request from the current conversation with
 * --owner-authorized-in-conversation plus --scope-file. The agent may draft
 * that concrete scope from the request and opened public sources. The file
 * is appended verbatim; there is no generic CI/background --yes mode.
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
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
// T-028 fáze H: kanonickým záznamem entity je data/dossiers/_shared/
// entities/<id>.json — content/entities/** je generovaný adaptér.
const ENTITIES_ROOT = join(ROOT, "data/dossiers/_shared/entities");
const AGENTS_MD = join(ROOT, "AGENTS.md");
const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");

const argv = process.argv.slice(2);
const entityId = argv.find((arg) => !arg.startsWith("--"));
const scopeFileArg = argv.find((arg) => arg.startsWith("--scope-file="));
const scopeFile = scopeFileArg?.slice("--scope-file=".length) ?? null;
const conversationAuthorization = argv.includes("--owner-authorized-in-conversation");
const nonInteractive = !process.stdin.isTTY || !process.stdout.isTTY;

if (nonInteractive && (!conversationAuthorization || !scopeFile)) {
  console.error(
    "authorize-entity: refuses to run without an interactive terminal.\n" +
      "After an explicit owner decision in the current conversation, use\n" +
      "--owner-authorized-in-conversation and --scope-file=<path>.\n" +
      "There is no generic --yes mode.",
  );
  process.exit(1);
}

if (!entityId) {
  console.error("Usage: node scripts/dossier/authorize-entity.mjs <entity-id> [--owner-authorized-in-conversation --scope-file=<path>]");
  process.exit(1);
}

if (conversationAuthorization !== Boolean(scopeFile)) {
  console.error("Conversation mode requires both --owner-authorized-in-conversation and --scope-file=<path>.");
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

let scope;
if (conversationAuthorization) {
  try {
    scope = readFileSync(scopeFile, "utf8").trim();
  } catch (e) {
    console.error(`Cannot read scope file ${scopeFile}: ${e.message}`);
    process.exit(1);
  }
  if (scope.length < 20) {
    console.error("Scope description is empty or too short. Aborted, nothing changed.");
    process.exit(1);
  }
} else {
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

  scope = await ask(
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
}

// --- from here on, every step is a mechanical consequence of the owner's
//     interactive confirmation or explicit current-conversation decision ---
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
