#!/usr/bin/env node
/*
 * Generates the primary navigation TREE from data, into
 * data/generated/navigation.json (what templates/base.html actually renders).
 *
 * Inputs:
 *   data/navigation.toml   — static skeleton: top-level items, the per-dossier
 *                            registry template ([[registries]]), dossier icons.
 *                            Contains no slug and no person.
 *   data/dossiers.toml     — which dossiers exist and of which type.
 *   content/dossiers/<slug>/<registry>/_index.md — which registries a dossier
 *                            actually has (the tree never links a route that
 *                            isn't on disk).
 *
 * Shape: every dossier hangs UNDER the "dossiers" item as its own subtree —
 * a person is never a top-level sidebar entry. Entity dossiers come first
 * (registry order), aggregate views last, flagged `isAggregate` so the
 * template can label them and refuse them an expandable subtree.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAV_TOML = join(ROOT, "data/navigation.toml");
const OUT = join(ROOT, "data/generated/navigation.json");

const text = readFileSync(NAV_TOML, "utf8");
const str = (block, key) => (block.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;
const num = (block, key) => {
  const m = block.match(new RegExp(`^${key}\\s*=\\s*(\\d+)`, "m"));
  return m ? Number(m[1]) : 0;
};
const blocks = (name) => [...text.matchAll(new RegExp(`\\[\\[${name}\\]\\]\\n([\\s\\S]*?)(?=\\n\\[|\\n*$)`, "g"))].map((m) => m[1]);

const items = blocks("items")
  .map((b) => ({
    id: str(b, "id"),
    label: str(b, "label"),
    path: str(b, "path"),
    matchPrefix: str(b, "match_prefix"),
    order: num(b, "order"),
    icon: str(b, "icon"),
    children: [],
  }))
  .sort((a, b) => a.order - b.order);

const registries = blocks("registries")
  .map((b) => ({ id: str(b, "id"), label: str(b, "label"), order: num(b, "order"), icon: str(b, "icon") }))
  .sort((a, b) => a.order - b.order);

const iconsBlock = (text.match(/\[dossier_icons\]\n([\s\S]*?)(?=\n\[|\n*$)/) ?? [])[1] ?? "";
const dossierIcons = { entity: str(iconsBlock, "entity"), aggregate: str(iconsBlock, "aggregate") };

const dossiersItem = items.find((i) => i.id === "dossiers");
if (!dossiersItem) {
  console.log("ERROR data/navigation.toml: no item with id = \"dossiers\" to attach the dossier tree to.");
  process.exit(1);
}

// Entity dossiers first, aggregates last; stable, data-driven ordering within
// each bucket (registry order, then slug) so the sidebar never reshuffles.
const registry = loadDossierRegistry();
const rank = (d) => (d.dossierType === "entity" ? 0 : 1);
const dossiers = [...registry].sort((a, b) => rank(a) - rank(b) || a.slug.localeCompare(b.slug, "cs"));

let skipped = 0;
for (const d of dossiers) {
  const isAggregate = d.dossierType !== "entity";
  const children = [];
  if (!isAggregate) {
    for (const reg of registries) {
      const file = join(ROOT, "content/dossiers", d.slug, reg.id, "_index.md");
      if (!existsSync(file)) { skipped++; continue; }
      children.push({
        id: `${d.slug}-${reg.id}`,
        label: reg.label,
        path: `@/dossiers/${d.slug}/${reg.id}/_index.md`,
        matchPrefix: `/dossiers/${d.slug}/${reg.id}/`,
        icon: reg.icon,
        depth: 2,
        children: [],
      });
    }
  }
  dossiersItem.children.push({
    id: d.slug,
    label: isAggregate ? `${d.title} (agregovaný pohled)` : d.title,
    path: `@/dossiers/${d.slug}/_index.md`,
    matchPrefix: `/dossiers/${d.slug}/`,
    icon: isAggregate ? dossierIcons.aggregate : dossierIcons.entity,
    isAggregate,
    depth: 1,
    children,
  });
}

for (const i of items) i.depth = 0;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ items }, null, 2) + "\n");

const entityCount = dossiers.filter((d) => d.dossierType === "entity").length;
const childCount = dossiersItem.children.reduce((n, c) => n + c.children.length, 0);
console.log(
  `Wrote ${OUT}: ${items.length} top-level item(s), ${dossiersItem.children.length} dossier(s) ` +
    `(${entityCount} entity) nested under "${dossiersItem.label}", ${childCount} registry link(s)` +
    (skipped ? `; ${skipped} registry slot(s) skipped (no section on disk)` : "") + ".",
);
