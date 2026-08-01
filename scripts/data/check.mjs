#!/usr/bin/env node
/*
 * CLI entrypoint kompilátoru kanonického datasetu (T-028 fáze C).
 *
 *   npm run data:compile            → load → validate → compile + souhrn počtů
 *   npm run data:validate           → (po validate-shape.mjs) totéž bez
 *                                     kompilace: node scripts/data/check.mjs --validate-only
 *
 * Pre-migračn stav (0 dossier balíčků v data/dossiers/) je legitimní a
 * projde s explicitní hláškou — brána existuje dřív než data (stejný
 * princip jako validate-shape.mjs).
 */
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, validateCanonicalDataset, compileDataset } from "./lib/dataset.mjs";

export async function runCheck({ root, validateOnly = false, log = console.log } = {}) {
  let model;
  try {
    model = await loadCanonicalDataset(root);
  } catch (e) {
    log(`ERROR ${e.message}`);
    return 1;
  }

  log(
    `Načteno ${model.dossiers.length} dossier balíčků, ${model.records.length} balíčkových záznamů, ` +
      `${model.entities.length} sdílených entit, ${model.vocabularies.length} slovníků.`,
  );
  if (model.dossiers.length === 0) {
    log("0 dossier packages (pre-migration) — kanonická data zatím žádná, brána běží naprázdno a projde.");
  }

  const { errors, warnings } = await validateCanonicalDataset(model);
  for (const w of warnings) log(`  WARNING ${w}`);
  if (errors.length) {
    log(`\n${errors.length} chyb(a):`);
    for (const e of errors) log(`  ERROR ${e}`);
    log("\nFAILED");
    return 1;
  }
  log("Validace OK — tvar, reference, sémantika i JSON-LD expanze.");

  if (!validateOnly) {
    const compiled = compileDataset(model);
    const perType = Object.entries(compiled.counts.perType)
      .map(([t, n]) => `${t}: ${n}`)
      .join(", ");
    log(
      `Kompilace OK — ${compiled.records.length} záznamů (${perType || "žádné"}), ` +
        `${Object.keys(compiled.routes).length} rout, graf ${compiled.graph.nodes.length} uzlů / ${compiled.graph.edges.length} hran, ` +
        `manifest schemaVersion ${compiled.manifest.schemaVersion}.`,
    );
  }
  log("OK");
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const validateOnly = process.argv.includes("--validate-only");
  process.exitCode = await runCheck({ validateOnly });
}
