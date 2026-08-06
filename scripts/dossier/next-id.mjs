#!/usr/bin/env node
/*
 * Bezpečné "další volné ID" pro claim/source/case/gap registr jednoho
 * dossieru — kontroluje jak lokální working tree, TAK origin/master,
 * a hlásí, když se liší.
 *
 * PROČ TOHLE EXISTUJE: session 2026-08-05, dvě souběžné instance na
 * james-quick dossieru obě spočítaly "další volné" CLM-09/SRC-09/SRC-10
 * ze své lokální kopie — v době, kdy origin/master už měl JINÝ, novější
 * záznam pod stejným ID. Výsledek: add/add konflikt při rebase, ruční
 * přečíslování sedmi kanonických záznamů (viz docs/coop/PROTOCOL.md,
 * „ID kolize u souběžně rozšiřovaného dossieru"). Ten postup — `git
 * fetch origin master`, pak zkontroluj nejvyšší ID TAM, ne jen lokálně —
 * byl dosud jen prózou v dokumentaci. Tenhle skript ho dělá jedním
 * příkazem, takže „zapomněl jsem fetchnout" přestává být způsob, jak ke
 * kolizi dojde.
 *
 * Usage:
 *   node scripts/dossier/next-id.mjs --dossier=<slug> --registry=<claims|sources|cases|gaps>
 *   node scripts/dossier/next-id.mjs --dossier=james-quick --registry=claims --no-fetch
 *
 * --no-fetch: přeskočí `git fetch` (offline, nebo když už víš, že jsi
 *   čerstvě fetchnutý) — kontroluje jen `origin/master` jak ho FT zná
 *   teď, ne živě.
 *
 * Exit kód je vždy 0 (jde o poradní nástroj, ne bránu) — pokud lokál a
 * origin nesouhlasí, vypíše to zřetelně, ale nechává rozhodnutí na
 * volajícím.
 */
import { existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

const REGISTRIES = {
  claims: { prefix: "CLM", dir: "claims", filePrefix: "clm" },
  sources: { prefix: "SRC", dir: "sources", filePrefix: "src" },
  cases: { prefix: "CASE", dir: "cases", filePrefix: "case" },
  gaps: { prefix: "GAP", dir: "gaps", filePrefix: "gap" },
};

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)(?:=(.*))?$/s);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

export function maxIdFromFilenames(filenames, filePrefix) {
  const re = new RegExp(`^${filePrefix}-(\\d+)\\.json$`);
  let max = 0;
  for (const name of filenames) {
    const m = name.match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

function localMax(dossier, registry) {
  const dir = path.join(ROOT, "data", "dossiers", dossier, registry.dir);
  if (!existsSync(dir)) return 0;
  return maxIdFromFilenames(readdirSync(dir), registry.filePrefix);
}

function originMax(dossier, registry) {
  let out;
  try {
    out = execFileSync(
      "git",
      ["ls-tree", "-r", "--name-only", "origin/master", "--", `data/dossiers/${dossier}/${registry.dir}/`],
      { cwd: ROOT, encoding: "utf8" },
    );
  } catch {
    return null; // origin/master ref neexistuje lokálně (žádný remote nastavený, nebo jiná chyba) — nedá se ověřit
  }
  const filenames = out
    .split("\n")
    .filter(Boolean)
    .map((p) => path.basename(p));
  return maxIdFromFilenames(filenames, registry.filePrefix);
}

export function nextId({ dossier, registry: registryKey, fetch = true }) {
  const registry = REGISTRIES[registryKey];
  if (!registry) {
    throw new Error(`next-id: neznámý --registry "${registryKey}" — použij ${Object.keys(REGISTRIES).join("|")}.`);
  }
  if (!existsSync(path.join(ROOT, "data", "dossiers", dossier, "dossier.json"))) {
    throw new Error(`next-id: dossier "${dossier}" neexistuje (chybí data/dossiers/${dossier}/dossier.json).`);
  }

  if (fetch) {
    try {
      execFileSync("git", ["fetch", "origin", "master", "--quiet"], { cwd: ROOT, stdio: "ignore" });
    } catch (err) {
      // Offline nebo bez remote — pokračuj s tím, co origin/master lokálně zná, ale řekni to.
      console.error(`next-id: 'git fetch origin master' selhal (${err.message.split("\n")[0]}), používám poslední známý stav origin/master.`);
    }
  }

  const local = localMax(dossier, registry);
  const origin = originMax(dossier, registry);
  const known = origin === null ? local : Math.max(local, origin);

  return {
    prefix: registry.prefix,
    local,
    origin,
    next: known + 1,
    diverged: origin !== null && origin !== local,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dossier || !args.registry) {
    console.error("usage: node scripts/dossier/next-id.mjs --dossier=<slug> --registry=<claims|sources|cases|gaps> [--no-fetch]");
    process.exit(2);
  }
  try {
    const result = nextId({ dossier: args.dossier, registry: args.registry, fetch: !args["no-fetch"] });
    const idStr = String(result.next).padStart(2, "0");
    console.log(`next-id: ${result.prefix}-${idStr}`);
    console.log(`  lokálně nejvyšší:  ${result.local || "(žádný)"}`);
    console.log(`  origin/master nejvyšší: ${result.origin === null ? "(nezjištěno)" : result.origin || "(žádný)"}`);
    if (result.diverged) {
      console.error(
        `\n⚠  Lokální stav a origin/master se LIŠÍ (${result.local} vs. ${result.origin}) — někdo jiný` +
          ` mezitím do tohoto dossieru přidal záznamy, které ještě nemáš. Doporučeno: 'git fetch && git rebase origin/master'` +
          ` (nebo aspoň 'git pull') PŘED založením nového ${result.prefix}-${idStr}, jinak riskuješ přesně tu kolizi,` +
          ` kvůli které tenhle skript vznikl — viz docs/coop/PROTOCOL.md, "ID kolize u souběžně rozšiřovaného dossieru".`,
      );
    }
  } catch (err) {
    console.error(`next-id: ${err.message}`);
    process.exit(1);
  }
}
