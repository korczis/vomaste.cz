#!/usr/bin/env node
/*
 * SessionStart — rychlá orientace.
 *
 * PROČ EXISTUJE
 * -------------
 * Co-op status (druhý SessionStart hook) říká, kdo pracuje na čem.
 * Neříká ale to, co rozhoduje o první minutě session: jestli má
 * prostředí šanci fungovat a jestli commit, který za chvíli vznikne,
 * náhodou rovnou nenasadí web.
 *
 * PROČ JE TAK KRÁTKÝ
 * ------------------
 * Běží při každém startu. Nesmí spouštět build, generátory ani nic,
 * co sáhne na síť — pár set milisekund je strop. Všechno, co trvá,
 * patří do /diagnose, který se spouští, když je něco rozbité.
 *
 * Zásadně nic nemění a při jakémkoli problému mlčí: rozbitý orientační
 * výpis nesmí bránit práci.
 *
 * Usage: node scripts/hooks/session-orientation.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const git = (...args) => {
  try {
    return execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
};

export function orientation(root = ROOT, probe = {}) {
  // `??` by tu nestačilo: test potřebuje předat `null` jako „tohle
  // není git repozitář", a `null ?? git(...)` by se zeptalo gitu.
  const has = (k) => Object.hasOwn(probe, k);
  const branch = has("branch") ? probe.branch : git("branch", "--show-current");
  if (branch == null || branch === "") return null; // není to git repozitář — mlč

  const dirty = has("dirty") ? probe.dirty : git("status", "--porcelain");
  const changed = dirty ? dirty.split("\n").filter(Boolean).length : 0;

  const deps = has("deps") ? probe.deps : existsSync(join(root, "node_modules"));
  const generated = has("generated") ? probe.generated : existsSync(join(root, "data/generated/navigation.json"));

  const lines = [];
  lines.push(`vomaste.cz · větev ${branch}${changed ? ` · ${changed} změněných souborů` : " · čistý strom"}`);

  // Nejdůležitější věta celého výpisu. Na master nemá commit pauzu
  // na rozmyšlenou — hook po něm staví a pushuje, a push je deploy.
  if (branch === "master") {
    lines.push("POZOR: na master commit spustí plný build a push. Push = živý deploy.");
  }

  const missing = [];
  if (!deps) missing.push("node_modules (`npm ci`)");
  if (!generated) missing.push("vygenerované vstupy (`npm run generate:all`)");
  if (missing.length) lines.push(`Chybí: ${missing.join(", ")}`);

  lines.push(missing.length ? "Začni: /diagnose" : "Začni: /bootstrap · nevíš co dál: /guide");

  return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    const text = orientation();
    if (text) process.stdout.write(`${text}\n`);
  } catch {
    // Orientační výpis, který spadne, nesmí zdržet start session.
  }
}
