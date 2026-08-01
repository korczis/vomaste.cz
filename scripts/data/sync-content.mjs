#!/usr/bin/env node
/*
 * Sync generovaných content adaptérů (T-028 fáze F).
 *
 * Kopíruje data/generated/content-staging/** → content/** pro všechny
 * cesty pokryté kanonickým modelem (dossierové záznamy, registry indexy,
 * dossier _index, entities/<id>.md). Od fáze F je content/** pro tyto
 * cesty GENEROVANÝ artefakt — ruční edit se přepíše dalším syncem
 * (edituje se data/dossiers/**, viz ADR json-first-canonical-data-model).
 *
 * Co sync NIKDY nekopíruje ani nemaže:
 *   - SYNC_EXCLUDED kořenové indexy (content/dossiers/_index.md,
 *     content/entities/_index.md) — ručně psané stránky s redakčním tělem
 *     mimo kanonický model v1;
 *   - ručně psané aux indexy dossierů (evidence/_index.md,
 *     entities/_index.md per dossier) a cokoliv mimo pokryté scope
 *     (dokumentace, koncepty, mapa, entity-type sekce generované
 *     build-entity-type-sections.mjs, …).
 *
 * Mazání: uvnitř pokrytých scope (registry adresáře, dossier _index,
 * entities/*.md) se odstraní .md soubory bez staging protějšku — zánik
 * kanonického záznamu musí zaniknout i v content/, jinak Zola postaví
 * sirotčí stránku. Výjimky výše se nemažou nikdy.
 *
 * Determinismus: kopírování je byte-verné; druhý běh nad stejným stavem
 * nezmění nic (vypisuje copied=0, deleted=0).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STAGING_REL, SYNC_EXCLUDED } from "./generate-zola-content.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const walk = (dir, prefix = "") => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(full).isDirectory()) out.push(...walk(full, rel));
    else out.push(rel);
  }
  return out;
};

// Pokrytý scope: cesty, kde je content/ od fáze F generovaný artefakt.
// Aux indexy (evidence/, per-dossier entities/) a kořenové indexy jsou
// mimo — viz hlavička.
export function isSyncedPath(rel) {
  if (SYNC_EXCLUDED.includes(rel)) return false;
  if (/^dossiers\/[^/]+\/_index\.md$/.test(rel)) return true;
  if (/^dossiers\/[^/]+\/(claims|sources|cases|gaps|relations)\/[^/]+\.md$/.test(rel)) return true;
  if (/^entities\/[^/]+\.md$/.test(rel) && rel !== "entities/_index.md") return true;
  return false;
}

export function syncContent({ root = REPO_ROOT, dryRun = false } = {}) {
  const stagingDir = join(root, STAGING_REL);
  const contentDir = join(root, "content");
  if (!existsSync(stagingDir)) {
    throw new Error(`${STAGING_REL} neexistuje — spusť napřed npm run data:generate-content.`);
  }

  const staged = walk(stagingDir).filter(isSyncedPath);
  const stagedSet = new Set(staged);
  const copied = [];
  const deleted = [];

  for (const rel of staged) {
    const src = join(stagingDir, ...rel.split("/"));
    const dst = join(contentDir, ...rel.split("/"));
    const next = readFileSync(src);
    if (existsSync(dst) && readFileSync(dst).equals(next)) continue;
    if (!dryRun) {
      mkdirSync(dirname(dst), { recursive: true });
      writeFileSync(dst, next);
    }
    copied.push(rel);
  }

  // Mazání sirotků uvnitř pokrytého scope.
  for (const rel of walk(contentDir)) {
    if (!isSyncedPath(rel)) continue;
    if (stagedSet.has(rel)) continue;
    if (!dryRun) rmSync(join(contentDir, ...rel.split("/")));
    deleted.push(rel);
  }

  return { staged: staged.length, copied, deleted };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const dryRun = process.argv.includes("--dry-run");
  const { staged, copied, deleted } = syncContent({ dryRun });
  console.log(
    `Sync content adaptérů${dryRun ? " (dry-run)" : ""}: ${staged} pokrytých cest; ` +
      `zapsáno ${copied.length}, smazáno ${deleted.length}.`,
  );
  for (const rel of copied.slice(0, 20)) console.log(`  WRITE content/${rel}`);
  if (copied.length > 20) console.log(`  … a dalších ${copied.length - 20}`);
  for (const rel of deleted) console.log(`  DELETE content/${rel}`);
  console.log("OK");
}
