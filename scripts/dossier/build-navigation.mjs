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
 *   compiled canonical dataset (T-028 fáze G) — which dossiers exist as
 *                            canonical records; every dossier carries all
 *                            five registry routes (build-route-manifest
 *                            registers them from the same model).
 *   data/concept-groups.toml + content/koncepty/*.md — the second subtree:
 *                            every concept page hangs under its group, which
 *                            hangs under the "concepts" item. KONCEPTY jsou
 *                            záměrná výjimka fáze G: nejsou dossierové
 *                            záznamy, kanonický model je nenese (viz
 *                            navigation-metrics registry — „Koncepty jsou
 *                            taxonomická vrstva mimo JSON-LD export"), takže
 *                            jejich front matter zůstává zdrojem do doby, než
 *                            dostanou vlastní kanonickou kolekci.
 *
 * Shape: every dossier hangs UNDER the "dossiers" item as its own subtree —
 * a person is never a top-level sidebar entry. Entity dossiers come first
 * (registry order), aggregate views last, flagged `isAggregate` so the
 * template can label them and refuse them an expandable subtree.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDossierRegistry } from "./lib/dossier-registry.mjs";
import { getCompiledModel } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAV_TOML = join(ROOT, "data/navigation.toml");
const OUT = join(ROOT, "data/generated/navigation.json");
const FLAT_OUT = join(ROOT, "data/generated/navigation-flat.json");

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
    // Metric NAME only — the value is resolved in the template from
    // data/generated/navigation-metrics.json, so a count can never be
    // hand-written into navigation.toml.
    countMetric: str(b, "count_metric"),
    countNoun: str(b, "count_noun"),
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

// T-028 fáze G: existence dossieru se ověřuje proti compiled modelu, ne
// skenem content/. Každý kanonický dossier nese všech pět registry rout
// (stejný invariant jako build-route-manifest.mjs) — strom tedy nikdy
// neodkáže routu, kterou kanonická data nedefinují. Dossier v registru
// bez kanonického záznamu je tvrdá chyba, ne tiché přeskočení.
const compiled = getCompiledModel(ROOT);
const canonicalSlugs = new Set(compiled.records.filter((w) => w.registry === "dossier").map((w) => w.dossier));

let skipped = 0;
for (const d of dossiers) {
  if (!canonicalSlugs.has(d.slug)) {
    console.log(`ERROR data/dossiers.toml: dossier "${d.slug}" nemá kanonický záznam v data/dossiers/ — strom odmítá odkázat neexistující routy.`);
    process.exit(1);
  }
  const isAggregate = d.dossierType !== "entity";
  const children = [];
  if (!isAggregate) {
    for (const reg of registries) {
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
    overviewLabel: isAggregate ? null : "Přehled dossieru",
    depth: 1,
    children,
  });
}

// --- entities subtree: one entry per entity type -----------------------------
// Real routes, not fragments: /entities/ groups by type only at runtime and
// the reader can switch that grouping, so an anchor into it would be a link
// into user-controlled state. content/entities/typ/<id>/ is generated by
// scripts/dossier/build-entity-type-sections.mjs — that generator must run
// before this one, which package.json enforces by ordering.
const entitiesItem = items.find((i) => i.id === "entities");
if (entitiesItem) {
  const typeSectionsDir = join(ROOT, "content", "entities", "typ");
  let typeDirs = [];
  try {
    typeDirs = readdirSync(typeSectionsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    // No sections yet (fresh clone before the generator ran). Leave the item
    // flat rather than inventing a subtree — validate-navigation would rather
    // see nothing than see links to routes that do not exist.
    typeDirs = [];
  }

  const typeLabels = new Map();
  const typeOrder = new Map();
  try {
    const typesText = readFileSync(join(ROOT, "data/entity-types.toml"), "utf8");
    for (const block of typesText.split(/\n\[\[types\]\]/).slice(1)) {
      const id = block.match(/^\s*id\s*=\s*"([^"]+)"/m)?.[1];
      const label = block.match(/^\s*label\s*=\s*"([^"]+)"/m)?.[1];
      const order = Number(block.match(/^\s*order\s*=\s*(\d+)/m)?.[1] ?? 999);
      if (id && label) {
        typeLabels.set(id, label);
        typeOrder.set(id, order);
      }
    }
  } catch { /* validate-entity-types.mjs is the gate for this file */ }

  typeDirs.sort((a, b) => (typeOrder.get(a) ?? 999) - (typeOrder.get(b) ?? 999) || a.localeCompare(b));
  for (const type of typeDirs) {
    entitiesItem.children.push({
      id: `entity-type-${type}`,
      label: typeLabels.get(type) ?? type,
      path: `@/entities/typ/${type}/_index.md`,
      matchPrefix: `/entities/typ/${type}/`,
      icon: entitiesItem.icon,
      depth: 1,
      // Grouped metric, resolved in the template from
      // data/generated/navigation-metrics.json — never a value written here.
      countMetric: "entities.by_type",
      countGroup: type,
      countNoun: "entit",
      children: [],
    });
  }
}

// --- concepts subtree: group → concept page ---------------------------------
// Same shape as the dossier subtree, so templates/base.html renders both with
// one generic three-level loop. Groups have no page of their own — they are
// anchors on /koncepty/ — hence `anchor` instead of a deeper route.
const conceptsItem = items.find((i) => i.id === "concepts");
if (conceptsItem) {
  const groupsText = readFileSync(join(ROOT, "data/concept-groups.toml"), "utf8");
  const groups = [...groupsText.matchAll(/\[\[groups\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)]
    .map((m) => ({ id: str(m[1], "id"), label: str(m[1], "label"), order: num(m[1], "order"), icon: str(m[1], "icon") }))
    .sort((a, b) => a.order - b.order);

  const dir = join(ROOT, "content/koncepty");
  const pages = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "_index.md")
    .map((f) => {
      const fm = (readFileSync(join(dir, f), "utf8").match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
      return { slug: f.replace(/\.md$/, ""), title: str(fm, "title"), tile: str(fm, "tile_title"), group: str(fm, "group"), weight: num(fm, "weight") };
    })
    .sort((a, b) => a.weight - b.weight);

  for (const g of groups) {
    const children = pages
      .filter((p) => p.group === g.id)
      .map((p) => ({
        id: `koncept-${p.slug}`,
        label: p.tile || p.title,
        path: `@/koncepty/${p.slug}.md`,
        matchPrefix: `/koncepty/${p.slug}/`,
        icon: g.icon,
        depth: 2,
        children: [],
      }));
    if (children.length === 0) continue;
    conceptsItem.children.push({
      id: `koncepty-${g.id}`,
      label: g.label,
      path: "@/koncepty/_index.md",
      anchor: g.id,
      matchPrefix: `/koncepty/#${g.id}`, // never prefix-matches a real path; the
      // group highlights via its children instead (see base.html active_trail)
      icon: g.icon,
      overviewLabel: `Vše: ${g.label.toLowerCase()}`,
      depth: 1,
      children,
    });
  }
}

/*
 * Learning subtree — Start, Bootcamp, Akademie, Příručka, Jak přispět.
 *
 * Jedna kořenová položka („Naučit se“) a pod ní pět sekcí z
 * data/learning.toml. Sekce, která si v datech řekne `nav_children = true`,
 * dostane i třetí úroveň se svými stránkami; Akademie a Příručka ne —
 * padesát lekcí ve stromu by z postranního panelu udělalo seznam, ve kterém
 * se ztratí všechno ostatní, a obě mají vlastní seskupený index, který to
 * zobrazí líp.
 *
 * Stejné pravidlo jako u zbytku stromu: strom následuje data. Přidání lekce
 * je jeden soubor v content/, nikdo needituje skeleton, a smazaná lekce tu
 * nemůže zůstat viset jako mrtvý odkaz.
 */
const learnItem = items.find((i) => i.id === "learn");
if (learnItem) {
  const learningText = readFileSync(join(ROOT, "data/learning.toml"), "utf8");
  const sections = [...learningText.matchAll(/\[\[sections\]\]\n([\s\S]*?)(?=\n\[\[|\n#\s*---|\n*$)/g)]
    .map((m) => ({
      id: str(m[1], "id"),
      label: str(m[1], "label"),
      route: str(m[1], "route"),
      order: num(m[1], "order"),
      icon: str(m[1], "icon"),
      navChildren: /^\s*nav_children\s*=\s*true\s*$/m.test(m[1]),
    }))
    .filter((s) => s.id)
    .sort((a, b) => a.order - b.order);

  for (const s of sections) {
    const dir = join(ROOT, "content", s.id);
    let children = [];
    if (s.navChildren && existsSync(dir)) {
      children = readdirSync(dir)
        .filter((f) => f.endsWith(".md") && f !== "_index.md")
        .map((f) => {
          const fm = (readFileSync(join(dir, f), "utf8").match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
          return { slug: f.replace(/\.md$/, ""), title: str(fm, "title"), weight: num(fm, "weight") };
        })
        .sort((a, b) => a.weight - b.weight || (a.title < b.title ? -1 : 1))
        .map((p) => ({
          id: `${s.id}-${p.slug}`,
          label: p.title || p.slug,
          path: `@/${s.id}/${p.slug}.md`,
          matchPrefix: `/${s.id}/${p.slug}/`,
          icon: s.icon,
          depth: 2,
          children: [],
        }));
    }
    learnItem.children.push({
      id: `learn-${s.id}`,
      label: s.label,
      path: s.route,
      matchPrefix: `/${s.id}/`,
      icon: s.icon,
      overviewLabel: children.length > 0 ? `Přehled: ${s.label.toLowerCase()}` : "",
      depth: 1,
      children,
    });
  }
}

/*
 * Documentation subtree — generated from the pages that actually exist.
 *
 * Same rule the rest of this tree follows: the sidebar follows the data, not a
 * hand-kept list. Documentation had only its landing item, so every document
 * under it — the constitution, the licences, the newly generated media
 * attribution index — was one click away and invisible from the sidebar.
 * Listing pages here means adding a document is enough; nobody has to remember
 * to also edit the skeleton, and a removed document cannot linger as a dead
 * link.
 */
const docsItem = items.find((i) => i.id === "docs");
if (docsItem) {
  const dir = join(ROOT, "content/dokumentace");
  docsItem.children = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "_index.md")
    .map((f) => {
      const fm = (readFileSync(join(dir, f), "utf8").match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
      return { slug: f.replace(/\.md$/, ""), title: str(fm, "title"), weight: num(fm, "weight") };
    })
    .sort((a, b) => a.weight - b.weight || (a.title < b.title ? -1 : 1))
    .map((p) => ({
      id: `dokumentace-${p.slug}`,
      label: p.title || p.slug,
      path: `@/dokumentace/${p.slug}.md`,
      matchPrefix: `/dokumentace/${p.slug}/`,
      icon: docsItem.icon,
      depth: 1,
      children: [],
    }));
}

for (const i of items) i.depth = 0;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ items }, null, 2) + "\n");

// Zploštělý seznam pro JSON-LD (templates/partials/jsonld.html).
//
// Navigační SiteNavigationElement uzly jsou na KAŽDÉ stránce totožné, ale
// šablona si je skládala znovu a znovu trojitou vnořenou smyčkou přes
// items × children × grandchildren. Tera nemá push: každé přidání se dělá
// přes `concat`, který vytváří nové pole, takže sestavení ~180 položek je
// kvadratické v alokacích — a opakovalo se to na 1733 stránkách.
//
// Změřeno: se zaslepenou šablonou jsonld.html trval `zola build` 48,8 s,
// s ní 366,1 s. Ta jedna šablona tedy stála 87 % celého buildu a tohle
// zplošťování byla jeho hlavní část.
// DVĚ ÚROVNĚ, NE TŘI. Zploštělý seznam se vydává jako uzly
// SiteNavigationElement do KAŽDÉ stránky. S třetí úrovní (registry každého
// dossieru) to při 233 dossierech bylo 1964 uzlů a 217 kB JSON-LD na
// stránku — proti 8 kB skutečného obsahu té stránky. Krát 6042 stránek to
// byla jedna z půlek desetigigabajtového `public/`, na kterém GitHub Pages
// odmítly artefakt nasadit (běh 31796352276).
//
// Sémanticky navíc SiteNavigationElement popisuje navigaci WEBU, ne
// rozbalený podstrom aktuální stránky: patří sem rozcestníky a dossiery,
// ne claims/sources/gaps každého z nich. Postranní strom se řídí týmž
// pravidlem (templates/base.html vypisuje registry jen u aktivního
// dossieru), takže strukturovaná data a sidebar dál popisují totéž —
// invariant z AGENTS.md drží, jen se obě strany zbavily balastu.
const FLAT_DEPTH = 2;
const flat = [];
const walk = (list, depth = 0) => {
  if (depth >= FLAT_DEPTH) return;
  for (const item of list ?? []) {
    flat.push(item);
    walk(item.children, depth + 1);
  }
};
walk(items);
writeFileSync(FLAT_OUT, JSON.stringify({ items: flat }, null, 2) + "\n");

const entityCount = dossiers.filter((d) => d.dossierType === "entity").length;
const childCount = dossiersItem.children.reduce((n, c) => n + c.children.length, 0);
const conceptGroups = conceptsItem ? conceptsItem.children.length : 0;
const conceptPages = conceptsItem ? conceptsItem.children.reduce((n, c) => n + c.children.length, 0) : 0;
console.log(
  `Wrote ${OUT}: ${items.length} top-level item(s), ${dossiersItem.children.length} dossier(s) ` +
    `(${entityCount} entity) nested under "${dossiersItem.label}", ${childCount} registry link(s), ` +
    `${conceptPages} concept page(s) in ${conceptGroups} group(s)` +
    (skipped ? `; ${skipped} registry slot(s) skipped (no section on disk)` : "") + ".",
);
