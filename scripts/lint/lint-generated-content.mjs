#!/usr/bin/env node
/*
 * Lint generovaných content adaptérů (T-028 fáze H, mise §19).
 *
 * Od fáze H je content/** pro dossierové záznamy a entity GENEROVANÝ
 * minimální routing adaptér kanonických dat (data/dossiers/**). Tento
 * lint spadne, když soubor v pokrytém scope (isSyncedPath —
 * dossiers/<slug>/_index.md, dossiers/<slug>/<registry>/*.md,
 * entities/*.md):
 *
 *   L1  nenese `generated = true` v [extra] (ručně vytvořená stránka
 *       v generovaném scope),
 *   L2  nese front matter klíč mimo POVOLENOU OBÁLKU — doménová pole
 *       (status, sources, subjects, depth, …) žijí výhradně v kanonických
 *       datech a view modelech, ne ve front matter,
 *   L3  nenese povinná obálková pole (record_id/view_model — bez nich
 *       šablona nemá datový vstup).
 *
 * Povolená obálka (viz scripts/data/generate-zola-content.mjs — každé
 * ponechané pole je vyjmenované v reportu fáze H):
 *   top:    title, description, template, weight, aliases, sort_by
 *   extra:  generated, record_id, view_model, dossier, record_type, lang,
 *           seo_type, dossier_type, updated, reviewed_at (base.html +
 *           partials/jsonld.html), clm_id/src_id/case_id/gap_id/rel_id/
 *           entity_id (base.html is_record + entity.html lookupy)
 *
 * Výjimky (mimo pokrytý scope, kontrolují je jiné brány):
 *   content/dokumentace/**, content/koncepty/**, kořenové _index.md
 *   (dossiers/, entities/), mapa, entity typ/ sekce
 *   (build-entity-type-sections), aux stránky dossierů (evidence/,
 *   per-dossier entities/ — ručně psané, mimo isSyncedPath).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isSyncedPath } from "../data/sync-content.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONTENT = join(ROOT, "content");

const ALLOWED_TOP = new Set(["title", "description", "template", "weight", "aliases", "sort_by"]);
const ALLOWED_EXTRA = new Set([
  "generated", "record_id", "view_model", "dossier", "record_type", "lang",
  "seo_type", "dossier_type", "updated", "reviewed_at",
  "clm_id", "src_id", "case_id", "gap_id", "rel_id", "entity_id",
]);
// record_id/view_model jsou povinné jen u záznamových stubů; registry
// _index stuby nesou view_model bez record_id (strukturální stránka).
const REQUIRED_EXTRA = ["generated", "view_model"];

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

export function lintGeneratedContent(root = ROOT) {
  const errors = [];
  const contentDir = join(root, "content");
  const covered = walk(contentDir).filter(isSyncedPath);

  for (const rel of covered) {
    const text = readFileSync(join(contentDir, ...rel.split("/")), "utf8");
    const fmEnd = text.indexOf("\n+++", 3);
    if (!text.startsWith("+++") || fmEnd === -1) {
      errors.push(`content/${rel}: chybí front matter — generovaný adaptér musí nést obálku`);
      continue;
    }
    const fm = text.slice(4, fmEnd);
    const extraStart = fm.indexOf("\n[extra]");
    const top = extraStart === -1 ? fm : fm.slice(0, extraStart);
    const extra = extraStart === -1 ? "" : fm.slice(extraStart + "\n[extra]".length);

    if (!/^generated = true$/m.test(extra)) {
      errors.push(`content/${rel}: chybí extra.generated = true — ručně vytvořená/editovaná stránka v generovaném scope (edituj data/dossiers/** a spusť npm run data:build)`);
    }
    if (/^\[\[?extra\./m.test(fm)) {
      errors.push(`content/${rel}: front matter nese pod-sekce [extra.*] — doménové bloky (authorization/timeline/cases) žijí v kanonických datech, ne v adaptéru`);
    }
    const keysOf = (body) =>
      [...body.matchAll(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)].map((m) => m[1]);
    for (const key of keysOf(top)) {
      if (!ALLOWED_TOP.has(key)) {
        errors.push(`content/${rel}: top-level pole "${key}" je mimo povolenou obálku adaptéru — doménová pole patří do data/dossiers/** (view modely je nesou šablonám)`);
      }
    }
    for (const key of keysOf(extra)) {
      if (!ALLOWED_EXTRA.has(key)) {
        errors.push(`content/${rel}: extra pole "${key}" je mimo povolenou obálku adaptéru — doménová pole patří do data/dossiers/** (view modely je nesou šablonám)`);
      }
    }
    for (const key of REQUIRED_EXTRA) {
      if (!new RegExp(`^${key} = `, "m").test(extra)) {
        errors.push(`content/${rel}: chybí povinné obálkové pole extra.${key}`);
      }
    }
  }

  return { errors, checked: covered.length };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { errors, checked } = lintGeneratedContent();
  if (errors.length) {
    console.log(`${errors.length} error(s):`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    console.log("\nFAILED");
    process.exit(1);
  }
  console.log(`lint:generated-content — OK (${checked} generovaných adaptérů drží minimální obálku).`);
}
