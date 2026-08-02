#!/usr/bin/env node
// Mechanicky vynucuje nejkritičtější pravidlo AGENTS.md: autorizační log
// „Content about real parties" je append-only. Každý existující datovaný
// záznam (### nadpis) musí přežít byte-verně; přidávat lze jen nové.
//
// Historie (audit T-042, nálezy B-1/B-2): první verze porovnávala pouze
// s `git show HEAD:AGENTS.md` — v CI (checkout = HEAD) to byl no-op a po
// jediném commitu se editace stala novým baseline; regex nadpisů navíc
// míjel tři reálné tvary záznamů. Tahle verze vynucuje pravidlo dvěma
// nezávislými mechanismy:
//
//   1. GIT BASELINE — porovnání proti merge-base s origin/master (fallback
//      origin/main, poté HEAD pro lokální pre-commit bez remote). Chytá
//      editace v celé větvi, ne jen v necommitnutém working tree.
//
//   2. HASH-KOTVA (data/authorizations-log-anchor.json) — commitnutý
//      manifest {nadpis, sha256 normalizovaného bloku} pro každý záznam.
//      Funguje i tam, kde git historie nepomůže (shallow CI checkout,
//      squash, force-push): každý ukotvený záznam musí v AGENTS.md
//      existovat byte-verně; každý záznam logu, který v kotvě není, je
//      chyba — nový záznam vyžaduje vědomé lidské ukotvení přes TTY-only
//      `npm run authorization:anchor` (fail-closed).
//
// Tvary nadpisů a parsování vlastní scripts/dossier/lib/authorization-log.mjs
// — neznámý tvar `###` nadpisu v území logu je chyba, ne tiché ignorování.
//
// Usage: node scripts/dossier/verify-authorization-log-append-only.mjs
// Exit 0 = log neporušen a plně ukotven; exit 1 = porušení.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENTS_FILE,
  ANCHOR_FILE,
  extractLogEntries,
  hashEntryBlock,
  loadAnchor,
} from "./lib/authorization-log.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

const problems = [];

// --- aktuální stav (strict: neznámý tvar nadpisu = chyba, nález B-2) ---
const newText = readFileSync(path.join(ROOT, AGENTS_FILE), "utf8");
const { entries: newEntries, problems: parseProblems } = extractLogEntries(newText);
problems.push(...parseProblems);

// --- 1. git baseline: merge-base s origin/master (nález B-1) ---
function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function resolveBaseline() {
  for (const upstream of ["origin/master", "origin/main"]) {
    try {
      const mb = git(["merge-base", "HEAD", upstream]).trim();
      if (mb) return { ref: mb, label: `merge-base(HEAD, ${upstream})` };
    } catch {
      // remote/větev neexistuje — zkus další, pak fallback
    }
  }
  return { ref: "HEAD", label: "HEAD (lokální fallback — žádný origin/master|main)" };
}

const baseline = resolveBaseline();
let oldText = null;
try {
  oldText = git(["show", `${baseline.ref}:${AGENTS_FILE}`]);
} catch {
  // AGENTS.md v baseline neexistuje (úplně první commit) — git vrstva
  // nemá s čím porovnat; kotva níže platí vždy.
}

let oldCount = 0;
if (oldText !== null) {
  // Historické verze se parsují lenient — starý soubor mohl mít tvary,
  // které dnešní strict parser nezná; append-only zajímá jen to, že staré
  // ROZPOZNANÉ záznamy přežily beze změny.
  const { entries: oldEntries } = extractLogEntries(oldText, { strict: false });
  oldCount = oldEntries.size;
  for (const [heading, oldBlock] of oldEntries) {
    if (!newEntries.has(heading)) {
      problems.push(`[git ${baseline.label}] záznam zcela odstraněn: "${heading.replace(/^### /, "")}"`);
      continue;
    }
    if (newEntries.get(heading) !== oldBlock) {
      problems.push(`[git ${baseline.label}] záznam změněn: "${heading.replace(/^### /, "")}"`);
    }
  }
}

// --- 2. hash-kotva (nálezy B-1 v CI + B-3 opora) ---
let anchor = null;
let anchorLoadFailed = false;
try {
  anchor = loadAnchor(ROOT);
} catch (e) {
  anchorLoadFailed = true;
  problems.push(`kotva nečitelná: ${e.message}`);
}
if (anchor === null && !anchorLoadFailed) {
  problems.push(
    `${ANCHOR_FILE} neexistuje — hash-kotva autorizačního logu je povinná. ` +
      `Vygeneruj ji interaktivně: \`npm run authorization:anchor\` (TTY-only, vědomá lidská akce).`,
  );
}

if (anchor) {
  const anchoredHeadings = new Set();
  for (const { heading, sha256 } of anchor.entries) {
    anchoredHeadings.add(heading);
    if (!newEntries.has(heading)) {
      problems.push(`[kotva] ukotvený záznam zcela odstraněn: "${heading.replace(/^### /, "")}"`);
      continue;
    }
    if (hashEntryBlock(newEntries.get(heading)) !== sha256) {
      problems.push(`[kotva] ukotvený záznam změněn (hash nesedí): "${heading.replace(/^### /, "")}"`);
    }
  }
  for (const heading of newEntries.keys()) {
    if (!anchoredHeadings.has(heading)) {
      problems.push(
        `[kotva] nový neukotvený záznam: "${heading.replace(/^### /, "")}" — ` +
          `nový záznam logu vyžaduje vědomé lidské ukotvení: spusť interaktivně ` +
          `\`npm run authorization:anchor\` (fail-closed, žádný automat kotvu nedoplní).`,
      );
    }
  }
}

// --- report ---
if (problems.length > 0) {
  console.error(
    `verify:authorization-log — append-only autorizační log v ${AGENTS_FILE} má ${problems.length} porušení:\n`,
  );
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    '\nExistující datované záznamy pod "Content about real parties" se nikdy needitují ani nemažou — přidávají se jen nové datované subsekce. Je-li změna skutečná, vlastníkem výslovně schválená korekce, musí být nejdřív na záznamu od vlastníka a poté vědomě přeukotvena interaktivním `npm run authorization:anchor`.',
  );
  process.exit(1);
}

console.log(
  `verify:authorization-log — OK (${newEntries.size} záznamů, vše ukotveno; git baseline: ${baseline.label}, ${oldCount} záznamů beze změny).`,
);
