#!/usr/bin/env node
/*
 * CLI brány `npm run data:validate` (T-028 fáze I).
 *
 * Bez argumentů spouští PŘESNĚ to, co dřívější řetěz
 * `validate-shape.mjs && check.mjs --validate-only`: tvar všech
 * kanonických souborů, pak reference + sémantiku + JSON-LD nad celým
 * datasetem. Jediný důvod existence tohoto wrapperu je contributor UX:
 *
 *   npm run data:validate -- --file data/dossiers/<slug>/claims/clm-01.json
 *
 * zvaliduje TVAR jednoho souboru (JSON parse + schéma dle recordType,
 * slovníky dle cesty) — rychlá smyčka při editaci záznamu. Každá chybová
 * hláška nese cestu k souboru. Referenční integrita a sémantika z
 * principu potřebují celý dataset, proto je jednosouborový režim
 * explicitně jen tvarový a říká to.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { validateShapeTree, validateRecordObject, createValidators } from "./validate-shape.mjs";
import { runCheck } from "./check.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Zvaliduje tvar jednoho souboru; vrací pole chybových hlášek (každá
// nese cestu). Export pro testy.
export function validateSingleFile(path) {
  const abs = isAbsolute(path) ? path : resolve(process.cwd(), path);
  const rel = relative(ROOT, abs).startsWith("..") ? abs : relative(ROOT, abs);
  if (!existsSync(abs)) return [`${rel}: soubor neexistuje`];

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    return [`${rel}: (root) neplatný JSON — ${e.message}`];
  }

  if (String(abs).includes(`${join("_shared", "vocabularies")}`)) {
    const { vocabulary } = createValidators();
    if (vocabulary(parsed)) return [];
    return (vocabulary.errors ?? []).map(
      (e) => `${rel}: ${e.instancePath || "(root)"} ${e.message}`,
    );
  }
  return validateRecordObject(parsed, rel);
}

function parseFileArgs(argv) {
  const files = [];
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") {
      if (argv[i + 1]) files.push(argv[++i]);
      else rest.push(a);
    } else if (a.startsWith("--file=")) {
      files.push(a.slice("--file=".length));
    } else {
      rest.push(a);
    }
  }
  return { files, rest };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { files, rest } = parseFileArgs(process.argv.slice(2));
  if (rest.length) {
    console.error(`data:validate: neznámé argumenty ${rest.join(" ")} — podporuji jen --file <cesta>.`);
    process.exit(2);
  }

  if (files.length > 0) {
    let failed = false;
    for (const file of files) {
      const errors = validateSingleFile(file);
      if (errors.length === 0) {
        console.log(`OK — ${file} odpovídá svému schématu (tvar).`);
      } else {
        failed = true;
        for (const e of errors) console.log(`  ERROR ${e}`);
      }
    }
    console.log(
      "\nPozn.: --file kontroluje jen TVAR záznamu; referenční integrita a sémantika běží nad celým datasetem — spusť `npm run data:validate` bez --file.",
    );
    process.exit(failed ? 1 : 0);
  }

  // --- plná brána (dřívější validate-shape.mjs && check.mjs --validate-only)
  const { errors, records, vocabularies } = validateShapeTree();
  console.log(
    `Zkontrolováno ${records} kanonických záznamů a ${vocabularies} slovníků proti schemas/canonical/ (Ajv 2020-12, strict).`,
  );
  if (records === 0) console.log("0 canonical records (pre-migration) — OK");
  if (errors.length) {
    console.log(`\n${errors.length} chyb(a) tvaru:`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    console.log("\nFAILED");
    process.exit(1);
  }
  console.log("OK — každý kanonický soubor odpovídá svému schématu.");

  process.exitCode = await runCheck({ validateOnly: true });
}
