// Discovery dossierových balíčků kanonického datasetu (T-028 fáze C).
//
// Balíček = adresář PŘÍMO pod rootem (default data/dossiers/), který
// obsahuje dossier.json. Žádný druhý ručně udržovaný seznam balíčků
// neexistuje a nesmí vzniknout — přítomnost dossier.json JE registrace
// (data/dossiers.toml zůstává registrem dnešního Markdown světa a
// přepojí se až ve fázi G). Rekurzivně se NEprochází: balíček je vždy
// jedna úroveň, `_shared/` je rezervovaný jmenný prostor (entities,
// vocabularies, context) a přeskočí se.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { RECORDS_ROOT } from "./validate-shape.mjs";

export const SHARED_DIR_NAME = "_shared";

// Vrací deterministicky (podle slugu, prostý codepoint sort) seřazený
// seznam { slug, rootDir }.
export function discoverDossierPackages(root = RECORDS_ROOT) {
  if (!existsSync(root)) return [];
  const packages = [];
  for (const name of readdirSync(root).sort()) {
    if (name === SHARED_DIR_NAME) continue;
    const dir = join(root, name);
    if (!statSync(dir).isDirectory()) continue;
    if (!existsSync(join(dir, "dossier.json"))) continue;
    packages.push({ slug: name, rootDir: dir });
  }
  return packages;
}
