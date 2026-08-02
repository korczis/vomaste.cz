#!/usr/bin/env node
/*
 * Jediná cesta, jak se záznam autorizačního logu z AGENTS.md dostane do
 * hash-kotvy data/authorizations-log-anchor.json. Záměrně POUZE
 * interaktivně — stejný TTY guard jako authorize-entity.mjs: odmítá běh
 * bez skutečného terminálu, takže ho nemůže spustit CI, skript ani
 * agentí tool-call s --yes flagem (žádný takový flag neexistuje).
 *
 * Ukotvení je vědomá lidská akce navazující na autorizaci: authorize-entity
 * zapíše nový záznam do logu, verify-authorization-log-append-only pak
 * build FAIL-CLOSED zastaví, dokud člověk nový záznam neukotví tady.
 * Nový záznam vyžaduje potvrzení „ANCHOR". Změna nebo zmizení už
 * ukotveného záznamu je porušení append-only pravidla — nástroj to
 * hlasitě označí a vyžaduje silnější potvrzení „OVERRIDE-APPEND-ONLY",
 * které má smysl napsat jen pro vlastníkem výslovně schválenou korekci,
 * jež už je na záznamu.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import {
  AGENTS_FILE,
  ANCHOR_FILE,
  extractLogEntries,
  hashEntryBlock,
  loadAnchor,
} from "./lib/authorization-log.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error(
    "authorization:anchor: refuses to run without an interactive terminal.\n" +
      "This is deliberate — anchoring an authorization-log entry must be a human\n" +
      "action taken at a keyboard, not something a script, CI job, or agent\n" +
      "can trigger non-interactively. Run this yourself, locally, in a real shell.",
  );
  process.exit(1);
}

const text = readFileSync(join(ROOT, AGENTS_FILE), "utf8");
const { entries, problems } = extractLogEntries(text);
if (problems.length > 0) {
  console.error(`authorization:anchor: ${AGENTS_FILE} nejde bezpečně parsovat — nejdřív oprav log:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

let anchor = null;
try {
  anchor = loadAnchor(ROOT);
} catch (e) {
  console.error(`authorization:anchor: existující kotva je nečitelná (${e.message}) — ruční kontrola nutná.`);
  process.exit(1);
}
const anchored = new Map((anchor?.entries ?? []).map((e) => [e.heading, e.sha256]));

const added = [];
const modified = [];
for (const [heading, block] of entries) {
  const hash = hashEntryBlock(block);
  if (!anchored.has(heading)) added.push(heading);
  else if (anchored.get(heading) !== hash) modified.push(heading);
}
const removed = [...anchored.keys()].filter((h) => !entries.has(h));

if (added.length === 0 && modified.length === 0 && removed.length === 0 && anchor !== null) {
  console.log(`authorization:anchor: kotva je aktuální (${entries.size} záznamů) — nic k ukotvení.`);
  process.exit(0);
}

console.log(`\nAutorizační log v ${AGENTS_FILE}: ${entries.size} záznamů; kotva: ${anchored.size} záznamů.\n`);
if (added.length) {
  console.log(`NOVÉ záznamy k ukotvení (${added.length}):`);
  for (const h of added) console.log(`  + ${h.replace(/^### /, "")}`);
}
if (modified.length) {
  console.log(`\n⚠️  ZMĚNĚNÉ už ukotvené záznamy (${modified.length}) — PORUŠENÍ append-only pravidla:`);
  for (const h of modified) console.log(`  ! ${h.replace(/^### /, "")}`);
}
if (removed.length) {
  console.log(`\n⚠️  ODSTRANĚNÉ už ukotvené záznamy (${removed.length}) — PORUŠENÍ append-only pravidla:`);
  for (const h of removed) console.log(`  - ${h.replace(/^### /, "")}`);
}

const violation = modified.length > 0 || removed.length > 0;
const phrase = violation ? "OVERRIDE-APPEND-ONLY" : "ANCHOR";
if (violation) {
  console.log(
    "\nZměna/odstranění ukotveného záznamu je legitimní JEN jako vlastníkem výslovně\n" +
      "schválená korekce, která už je na záznamu (viz AGENTS.md). Pokud to tak není,\n" +
      "ukonči (Ctrl-C) a vrať log do původní podoby.",
  );
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const answer = await new Promise((resolve) =>
  rl.question(`\nType ${phrase} (all caps) to confirm this is your explicit, on-the-record decision: `, resolve),
);
rl.close();
if (answer.trim() !== phrase) {
  console.error("Confirmation phrase did not match. Aborted, nothing changed.");
  process.exit(1);
}

const out = {
  $comment:
    "Hash-kotva append-only autorizačního logu v AGENTS.md (## Content about real parties). " +
    "Generuje VÝHRADNĚ interaktivní `npm run authorization:anchor` (TTY-only, lidské potvrzení). " +
    "verify-authorization-log-append-only.mjs proti ní ověřuje byte-verní integritu každého záznamu; " +
    "validate-authorization.mjs přes ni váže data/authorizations.toml na log. Needitovat ručně.",
  generatedAt: new Date().toISOString().slice(0, 10),
  algorithm: "sha256(normalized entry block: LF line endings, trailing whitespace trimmed)",
  entries: [...entries].map(([heading, block]) => ({ heading, sha256: hashEntryBlock(block) })),
};
writeFileSync(join(ROOT, ANCHOR_FILE), `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`\nDone. ${ANCHOR_FILE}: ukotveno ${entries.size} záznamů. Commitni kotvu spolu se změnou logu.`);
