// Jediný vlastník parsování append-only autorizačního logu v AGENTS.md
// („## Content about real parties") a hash-kotvy
// data/authorizations-log-anchor.json.
//
// PROČ existuje: audit T-042 (reports/intake/phase-01-repository-audit.md,
// nálezy B-1/B-2/B-3) ukázal, že log parsovaly nezávislé regexy na více
// místech a každý z nich míjel část reálných tvarů nadpisů. Tenhle modul
// je jediné místo, kde je definováno (a) co je záznam logu, (b) jak se
// normalizuje a hashuje, (c) jak vypadá kotva. Konzumenti:
//   - scripts/dossier/verify-authorization-log-append-only.mjs (append-only
//     + kotva, vlastník pravidla „log se nikdy needituje")
//   - scripts/dossier/validate-authorization.mjs (cross-check TOML↔log,
//     vlastník pravidla „TOML záznam bez ukotveného log záznamu neexistuje")
//   - scripts/dossier/anchor-authorization-log.mjs (TTY-only generátor kotvy)
//
// FAIL-CLOSED na tvar nadpisu (nález B-2): každý `### ` nadpis od začátku
// sekce „## Content about real parties" dál MUSÍ odpovídat jednomu ze
// známých tvarů záznamu. Neznámý tvar není „ne-záznam, ignoruj" — je to
// chyba, protože přesně tak vypadal únik: záznamy „Rozšíření rozsahu",
// „Authorized subjects," a „Not authorized:" dřívější regex tiše míjel
// a šly editovat bez povšimnutí.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const AGENTS_FILE = "AGENTS.md";
export const ANCHOR_FILE = "data/authorizations-log-anchor.json";
export const LOG_SECTION_HEADING = "## Content about real parties";

// Všechny reálné tvary nadpisů záznamů v logu (ověřeno proti skutečnému
// obsahu AGENTS.md, ne odhadem — viz nález B-2). Nový tvar se přidává
// SEM (jedno místo) + do testů.
export const ENTRY_HEADING_PATTERNS = [
  /^### Authorized subject: /, // „### Authorized subject: Jméno (on the record)"
  /^### Authorized subjects, /, // plurál: „### Authorized subjects, 2026-07-30: …"
  /^### Scope extension, /, // „### Scope extension, 2026-07-21: …"
  /^### Rozšíření rozsahu, /, // česká varianta scope extension
  /^### Structural change, /, // „### Structural change, 2026-07-29: …"
  /^### Not authorized: /, // explicitní zamítnutí — také záznam, také append-only
];

export function isEntryHeading(line) {
  return ENTRY_HEADING_PATTERNS.some((re) => re.test(line));
}

// Normalizace bloku záznamu před hashováním/porovnáním: jednotné konce
// řádků a bez koncového whitespace. Nic víc — obsah se porovnává
// byte-verně, normalizace jen odstraňuje artefakty editorů (CRLF,
// trailing newline), které nejsou obsahem záznamu.
export function normalizeEntryBlock(block) {
  return block.replace(/\r\n/g, "\n").trimEnd();
}

export function hashEntryBlock(block) {
  return createHash("sha256").update(normalizeEntryBlock(block), "utf8").digest("hex");
}

/**
 * Vytáhne záznamy autorizačního logu z textu AGENTS.md.
 *
 * Záznamy se hledají od řádku `## Content about real parties` dál — novější
 * záznamy jsou historicky appendované až za pozdějšími `##` sekcemi (log
 * není souvislý region), takže vše za začátkem sekce je „území logu".
 * Nadpisy `###` PŘED sekcí jsou dokumentace a záznamy nejsou.
 *
 * @param {string} text celý obsah AGENTS.md
 * @param {{strict?: boolean}} [opts] strict (default true) = neznámý tvar
 *   `###` nadpisu v území logu a duplicitní nadpis jsou chyby. Lenient
 *   režim (strict:false) je jen pro parsování HISTORICKÝCH verzí souboru
 *   při git porovnání — aktuální stav se parsuje vždy strict.
 * @returns {{entries: Map<string,string>, problems: string[]}}
 *   entries: nadpis (celý `### …` řádek) -> normalizovaný blok záznamu
 */
export function extractLogEntries(text, opts = {}) {
  const strict = opts.strict !== false;
  const problems = [];
  const entries = new Map();
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const start = lines.indexOf(LOG_SECTION_HEADING);
  if (start === -1) {
    problems.push(
      `sekce "${LOG_SECTION_HEADING}" v souboru chybí — bez ní nelze autorizační log vůbec najít.`,
    );
    return { entries, problems };
  }

  let current = null;
  let buf = [];
  const close = () => {
    if (current === null) return;
    if (entries.has(current)) {
      problems.push(`duplicitní nadpis záznamu: "${current}" — identita záznamu musí být jednoznačná.`);
    }
    entries.set(current, normalizeEntryBlock(buf.join("\n")));
    current = null;
    buf = [];
  };

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^### /.test(line)) {
      close();
      if (isEntryHeading(line)) {
        current = line;
        buf = [line];
      } else if (strict) {
        problems.push(
          `neznámý tvar nadpisu v území autorizačního logu: "${line}" — ` +
            `fail-closed: buď je to nový tvar záznamu (přidej ho do ENTRY_HEADING_PATTERNS ` +
            `v scripts/dossier/lib/authorization-log.mjs + testů), nebo sem nepatří.`,
        );
      }
      continue;
    }
    if (/^#{1,2} /.test(line)) {
      // jiný nadpis (##, #) uzavírá běžící záznam
      close();
      continue;
    }
    if (current !== null) buf.push(line);
  }
  close();

  return { entries, problems };
}

/** Načte kotvu; vrací null, pokud soubor neexistuje. Nevalidní JSON vyhodí. */
export function loadAnchor(root) {
  let raw;
  try {
    raw = readFileSync(join(root, ANCHOR_FILE), "utf8");
  } catch {
    return null;
  }
  const anchor = JSON.parse(raw);
  if (!Array.isArray(anchor.entries)) {
    throw new Error(`${ANCHOR_FILE}: pole "entries" chybí nebo není pole.`);
  }
  for (const e of anchor.entries) {
    if (typeof e.heading !== "string" || !/^[0-9a-f]{64}$/.test(e.sha256 ?? "")) {
      throw new Error(`${ANCHOR_FILE}: záznam kotvy musí mít "heading" (string) a "sha256" (64 hex znaků).`);
    }
  }
  return anchor;
}

/**
 * Cross-check B-3: každý strukturovaný záznam z data/authorizations.toml
 * musí mít odpovídající UKOTVENÝ záznam v logu AGENTS.md. Vazba je
 * existující pole `agents_md_section` (text nadpisu bez `### ` prefixu)
 * — žádné nové pole se nezavádí, transkripce ho nese od začátku.
 *
 * @param {{id: string, agentsMdSection: string|null}[]} records
 * @param {Map<string,string>} logEntries výstup extractLogEntries().entries
 * @param {{entries: {heading: string, sha256: string}[]}|null} anchor
 * @returns {string[]} chybové zprávy (prázdné = OK)
 */
export function crossCheckTomlRecords(records, logEntries, anchor) {
  const errors = [];
  const anchoredHeadings = new Set((anchor?.entries ?? []).map((e) => e.heading));
  for (const { id, agentsMdSection } of records) {
    const tag = `data/authorizations.toml [${id}]`;
    if (!agentsMdSection) {
      errors.push(`${tag}: chybí pole agents_md_section — bez vazby na log v AGENTS.md je záznam neplatný.`);
      continue;
    }
    const heading = `### ${agentsMdSection}`;
    if (!logEntries.has(heading)) {
      errors.push(
        `${tag}: agents_md_section "${agentsMdSection}" neodpovídá žádnému záznamu logu v AGENTS.md — ` +
          `strukturovaný záznam bez prozaického záznamu v append-only logu není platná autorizace.`,
      );
      continue;
    }
    if (!anchoredHeadings.has(heading)) {
      errors.push(
        `${tag}: záznam logu "${agentsMdSection}" existuje v AGENTS.md, ale není ukotven v ${ANCHOR_FILE} — ` +
          `spusť interaktivně \`npm run authorization:anchor\` (vědomé lidské ukotvení, fail-closed).`,
      );
    }
  }
  return errors;
}
