#!/usr/bin/env node
// Preflight: jsou tu vygenerované vstupy, které šablony čtou?
// ============================================================
//
// data/generated/* je v .gitignore — vzniká buildem, ne v repozitáři. Po
// klonu nebo po git pull tedy neexistuje (nebo je zastaralé) a přímé
// spuštění "zola serve" skončí na prvním load_data hláškou z hloubi
// base.html, ze které NENÍ poznat, že chybí krok pipeline, natož který
// příkaz to spraví.
//
// Tenhle skript to řekne rovnou. Není to náhrada generátorů — je to mapa
// mezi symptomem ("load_data ... does not exist") a příčinou ("neběžely
// generátory").
//
// Použití:
//   node scripts/build/require-generated.mjs          → zkontroluje a vypíše
//   node scripts/build/require-generated.mjs --quiet  → mlčí, když je vše OK

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const quiet = process.argv.includes("--quiet");

// Seznam se ODVOZUJE ze šablon, ne z ručního výčtu: jinak by nový
// load_data tiše vypadl z kontroly a preflight by tvrdil „vše v pořádku"
// u stromu, se kterým zola stejně spadne.
function pozadovaneZeSablon() {
  const out = new Set();
  const stack = [join(ROOT, "templates")];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name.endsWith(".html")) {
        for (const m of readFileSync(p, "utf8").matchAll(/load_data\(path="(data\/generated\/[^"]+)"/g)) {
          out.add(m[1]);
        }
      }
    }
  }
  return [...out].sort();
}

const chybi = pozadovaneZeSablon().filter((rel) => !existsSync(join(ROOT, rel)));

if (chybi.length === 0) {
  if (!quiet) console.log("preflight OK — vygenerované vstupy jsou na místě.");
  process.exit(0);
}

const radky = chybi.map((c) => "  · " + c).join("\n");
console.error(
  [
    "",
    "Chybí vygenerované vstupy (" + chybi.length + "):",
    "",
    radky,
    "",
    "Tyhle soubory NEJSOU v gitu (viz .gitignore) — vznikají buildem. Po klonu",
    "nebo po 'git pull' je proto potřeba spustit pipeline; samotné 'zola serve'",
    "je neumí vytvořit a skončí na load_data.",
    "",
    "Co spustit:",
    "",
    "  npm run dev      · generátory + zola serve na http://127.0.0.1:1111",
    "  npm run build    · plná validace + generátory + zola build (před pushem)",
    "",
  ].join("\n"),
);
process.exit(1);
