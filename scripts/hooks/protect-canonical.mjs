#!/usr/bin/env node
/*
 * PreToolUse guardrail — chrání dvě místa, kde je tichá chyba nejdražší.
 *
 * PROČ EXISTUJE
 * -------------
 * Obě chráněné věci jsou pravidla, která už jsou napsaná v CLAUDE.md
 * i v .claude/rules/. Instrukce ale není vynucení: agent, který se
 * soustředí na něco jiného, sáhne na generovanou stránku, protože je
 * po ruce, a text v ní vypadá jako ten, který má opravit. Tenhle hook
 * je mechanická pojistka — přesně to, co konstituce §8 myslí tím, že
 * politika bez vynucení se nepočítá za implementovanou.
 *
 * CO BLOKUJE
 * ----------
 *   P1  zápis do append-only autorizačního logu v AGENTS.md.
 *       Nejde o celý soubor: sekce nad logem se legitimně mění.
 *       Blokuje se jen editace, jejíž `old_string` leží v logu —
 *       tedy přepis nebo smazání existujícího záznamu. To je přesně
 *       to, co verify-authorization-log hlídá až v commitu; tady se
 *       to zastaví dřív, než vznikne.
 *
 *   P2  zápis do generovaného obsahu (content/dossiers/**,
 *       content/entities/*.md, content/dokumentace/prikazy/**,
 *       content/zdroje/**, data/generated/**, docs/TOOLING.md,
 *       docs/osint/SOURCE_CATALOG.md).
 *       Tohle je nejhůř viditelná chyba v celém repozitáři: uvnitř
 *       npm run build běží sync DŘÍV než paritní brána, takže se
 *       ruční editace tiše přepíše, build zůstane zelený a změna
 *       prostě zmizí. Nikdo se nic nedozví.
 *
 * CO NEBLOKUJE, ZÁMĚRNĚ
 * ---------------------
 * Cokoli jiného. Hook, který blokuje širší množinu, než na kterou má
 * důvod, se obchází — a pak nehlídá nic. Zvlášť: NEblokuje zápis do
 * data/dossiers/** (to je kanonické a měnit se má), NEblokuje ostatní
 * sekce AGENTS.md, a NEblokuje čtení čehokoli.
 *
 * SELHÁNÍ HOOKU NESMÍ ZABLOKOVAT REPOZITÁŘ
 * ----------------------------------------
 * Nečitelný vstup, chybějící pole, neexistující AGENTS.md — všechno
 * končí `allow`. Blokovat kvůli tomu, že si hook nerozuměl se svým
 * vlastním vstupem, by bylo horší než nemít ho.
 *
 * Usage: čte JSON na stdin, píše rozhodnutí na stdout (PreToolUse).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

// Nadpis, od kterého níž je append-only log. Kdyby se změnil, hook
// přestane blokovat — proto je to konstanta na jednom místě a test
// ověřuje, že v AGENTS.md skutečně je.
export const LOG_HEADING = "## Content about real parties";

// Generovaný obsah. Vzory jsou vyjmenované, ne odvozené z .gitignore:
// odvození by znamenalo, že cokoli ignorovaného přestane být chráněné.
export const GENERATED_PATTERNS = [
  /^content\/dossiers\/[^/]+\/_index\.md$/,
  /^content\/dossiers\/[^/]+\/(claims|sources|cases|gaps|relations)\/[^/]+\.md$/,
  /^content\/entities\/[^/]+\.md$/,
  /^content\/entities\/typ\//,
  /^content\/dokumentace\/prikazy\//,
  /^content\/zdroje\//,
  /^data\/generated\//,
  /^docs\/TOOLING\.md$/,
  /^docs\/osint\/SOURCE_CATALOG\.md$/,
];

const CANONICAL_HINT = {
  "content/dossiers": "uprav `data/dossiers/<slug>/…` a spusť `npm run data:build`",
  "content/entities": "uprav `data/dossiers/_shared/entities/…` a spusť `npm run data:build`",
  "content/dokumentace/prikazy": "uprav `data/tooling/…` a spusť `npm run build:tooling-catalog`",
  "content/zdroje": "uprav `data/source-catalog/…` a spusť `npm run build:source-catalog`",
  "data/generated": "tenhle soubor generuje build; uprav jeho vstup",
  "docs/TOOLING.md": "uprav `data/tooling/…` a spusť `npm run build:tooling-catalog`",
  "docs/osint/SOURCE_CATALOG.md": "uprav `data/source-catalog/…` a spusť `npm run build:source-catalog`",
};

export function relativePath(filePath, root = ROOT) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, "/");
  const base = String(root).replace(/\\/g, "/").replace(/\/$/, "");
  if (normalized.startsWith(`${base}/`)) return normalized.slice(base.length + 1);
  if (normalized.startsWith("/")) return null; // mimo repozitář — není co chránit
  return normalized.replace(/^\.\//, "");
}

export function generatedHint(rel) {
  for (const [prefix, hint] of Object.entries(CANONICAL_HINT)) {
    if (rel === prefix || rel.startsWith(`${prefix}/`)) return hint;
  }
  return "tenhle soubor je generovaný; uprav jeho kanonický vstup";
}

export function isGenerated(rel) {
  return rel != null && GENERATED_PATTERNS.some((re) => re.test(rel));
}

// Editace autorizačního logu se pozná podle toho, že nahrazovaný text
// leží ZA nadpisem logu. Zápis nového obsahu na konec souboru (append)
// se tím neblokuje — a to je správně, nové záznamy vznikat mají.
export function touchesAuthorizationLog(rel, input, root = ROOT) {
  if (rel !== "AGENTS.md") return false;
  const path = join(root, "AGENTS.md");
  if (!existsSync(path)) return false;

  const text = readFileSync(path, "utf8");
  const logStart = text.indexOf(LOG_HEADING);
  if (logStart === -1) return false;

  // Write nad celým AGENTS.md přepisuje i log.
  if (typeof input?.content === "string") return true;

  const old = input?.old_string;
  if (typeof old !== "string" || !old) return false;
  const at = text.indexOf(old);
  return at !== -1 && at >= logStart;
}

export function decide(payload, root = ROOT) {
  const tool = payload?.tool_name;
  if (tool !== "Edit" && tool !== "Write" && tool !== "NotebookEdit") return null;

  const input = payload?.tool_input ?? {};
  const rel = relativePath(input.file_path, root);
  if (!rel) return null;

  if (touchesAuthorizationLog(rel, input, root)) {
    return (
      "P1: tahle editace zasahuje do append-only autorizačního logu v AGENTS.md. " +
      "Existující záznam se nikdy neupravuje ani neodstraňuje, ani kvůli překlepu — " +
      "je to auditní stopa toho, co bylo skutečně schváleno a kdy. " +
      "Nová autorizace je vždy NOVÁ datovaná podsekce a zapisuje ji " +
      "`scripts/dossier/authorize-entity.mjs` na základě rozhodnutí vlastníka. " +
      "Pravidlo: .claude/rules/authorization.md."
    );
  }

  if (isGenerated(rel)) {
    return (
      `P2: \`${rel}\` je generovaný soubor, ne zdroj. Ruční editace se tiše ztratí — ` +
      "uvnitř `npm run build` běží generování DŘÍV než paritní brána, takže se změna " +
      `přepíše a build zůstane zelený. Kanonická oprava: ${generatedHint(rel)}. ` +
      "Pravidlo: .claude/rules/generated-content.md."
    );
  }

  return null;
}

/* ---- běh -------------------------------------------------------------- */

function emitAllow() {
  process.stdout.write("{}\n");
}

function emitDeny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }) + "\n",
  );
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let reason = null;
  try {
    reason = decide(JSON.parse(raw));
  } catch {
    // Nečitelný vstup NENÍ důvod k blokaci. Hook, který kvůli vlastní
    // chybě zastaví práci na celém repozitáři, je horší než žádný.
    reason = null;
  }

  if (reason) emitDeny(reason);
  else emitAllow();
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) await main();
