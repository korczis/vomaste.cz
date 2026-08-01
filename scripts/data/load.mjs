// Loader kanonického datasetu (T-028 fáze C): načte celé dossierové
// balíčky (dossier.json + claims/ sources/ cases/ gaps/ relations/
// updates/), sdílené entity data/dossiers/_shared/entities/*.json a
// slovníky _shared/vocabularies/*.json do jednoho surového modelu.
//
// Loader NIC nevaliduje kromě čitelnosti: každá chyba čtení/parsování
// nese cestu k souboru a načítání selže jako celek (žádné tiché
// přeskočení poloviny datasetu). Tvar vlastní validate-shape.mjs,
// referenční integritu validate-references.mjs, redakční pravidla
// validate-semantics.mjs (jedno pravidlo, jeden vlastník).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { discoverDossierPackages, SHARED_DIR_NAME } from "./discover.mjs";
import { RECORDS_ROOT } from "./validate-shape.mjs";

// Registry adresáře balíčku a recordType, který v nich smí ležet.
export const PACKAGE_REGISTRIES = Object.freeze({
  claims: "claim",
  sources: "source",
  cases: "case",
  gaps: "gap",
  relations: "relation",
  updates: "update",
});

const toPosix = (p) => p.split(sep).join("/");

function readJson(file, relPath, errors) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch (e) {
    errors.push(`${relPath}: soubor nejde přečíst — ${e.message}`);
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    errors.push(`${relPath}: neplatný JSON — ${e.message}`);
    return null;
  }
}

/*
 * Načte celý kanonický strom. Vrací surový model:
 *
 *   {
 *     root,                             // absolutní cesta k rootu
 *     dossiers:     [{ slug, rootDir, wrapper }],
 *     records:      [wrapper, …],       // VŠECHNY balíčkové záznamy vč. dossier.json
 *     entities:     [wrapper, …],       // _shared/entities/*.json
 *     vocabularies: [{ relPath, data }],
 *   }
 *
 * wrapper = { record, relPath, dossier, registry } — relPath je POSIX
 * cesta relativní k rootu (klíč pro kontrolu „soubor je tam, kde jeho
 * @id říká" ve validate-references.mjs); dossier je slug vlastnícího
 * balíčku (null u entit); registry ∈ dossier|claims|…|updates|entities.
 */
export function loadCanonicalTree(root = RECORDS_ROOT) {
  const errors = [];
  const dossiers = [];
  const records = [];
  const entities = [];
  const vocabularies = [];

  for (const { slug, rootDir } of discoverDossierPackages(root)) {
    const push = (record, relPath, registry) => {
      const wrapper = { record, relPath, dossier: slug, registry };
      records.push(wrapper);
      return wrapper;
    };

    const dossierFile = join(rootDir, "dossier.json");
    const dossierRecord = readJson(dossierFile, toPosix(relative(root, dossierFile)), errors);
    const dossierWrapper =
      dossierRecord === null ? null : push(dossierRecord, toPosix(relative(root, dossierFile)), "dossier");
    dossiers.push({ slug, rootDir, wrapper: dossierWrapper });

    for (const name of readdirSync(rootDir).sort()) {
      const full = join(rootDir, name);
      const relPath = toPosix(relative(root, full));
      if (statSync(full).isDirectory()) {
        if (!(name in PACKAGE_REGISTRIES)) {
          const strayJson = readdirSync(full).filter((f) => f.endsWith(".json"));
          if (strayJson.length) {
            errors.push(
              `${relPath}/: neznámý adresář v dossier balíčku obsahuje JSON soubory (${strayJson.join(", ")}) — povolené registry jsou ${Object.keys(PACKAGE_REGISTRIES).join(", ")}`,
            );
          }
          continue;
        }
        for (const file of readdirSync(full).sort()) {
          if (!file.endsWith(".json")) continue;
          const recordFile = join(full, file);
          const recordRel = toPosix(relative(root, recordFile));
          const record = readJson(recordFile, recordRel, errors);
          if (record !== null) push(record, recordRel, name);
        }
        continue;
      }
      // Soubory na kořeni balíčku: jediný povolený JSON je dossier.json;
      // ne-JSON soubory (legacy graph.toml apod.) loader ignoruje.
      if (name.endsWith(".json") && name !== "dossier.json") {
        errors.push(`${relPath}: neočekávaný JSON na kořeni balíčku — jediný povolený je dossier.json, záznamy patří do registry adresářů`);
      }
    }
  }

  // _shared: entities + vocabularies; context/*.jsonld řeší context-loader,
  // ostatní budoucí _shared soubory nejsou záznamy (zrcadlí validate-shape).
  const sharedEntitiesDir = join(root, SHARED_DIR_NAME, "entities");
  if (existsSync(sharedEntitiesDir)) {
    for (const file of readdirSync(sharedEntitiesDir).sort()) {
      if (!file.endsWith(".json")) continue;
      const full = join(sharedEntitiesDir, file);
      const relPath = toPosix(relative(root, full));
      const record = readJson(full, relPath, errors);
      if (record !== null) entities.push({ record, relPath, dossier: null, registry: "entities" });
    }
  }
  const vocabulariesDir = join(root, SHARED_DIR_NAME, "vocabularies");
  if (existsSync(vocabulariesDir)) {
    for (const file of readdirSync(vocabulariesDir).sort()) {
      if (!file.endsWith(".json")) continue;
      const full = join(vocabulariesDir, file);
      const relPath = toPosix(relative(root, full));
      const data = readJson(full, relPath, errors);
      if (data !== null) vocabularies.push({ relPath, data });
    }
  }

  if (errors.length) {
    throw new Error(`loadCanonicalTree: ${errors.length} chyb(a) čtení kanonického datasetu:\n  ${errors.join("\n  ")}`);
  }

  return { root, dossiers, records, entities, vocabularies };
}
