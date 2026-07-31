#!/usr/bin/env node
/*
 * Generate one section page per entity type at content/entities/typ/<id>/,
 * giving each type a real route instead of a JS-only view.
 *
 * WHY A ROUTE AND NOT AN ANCHOR — /entities/ already groups by type, but it
 * does so at runtime: the server renders one flat pool of every entity and
 * Alpine moves those nodes into groups. That is a deliberate, correct design
 * (the pool is a usable registry with JavaScript disabled), but it means
 * there is nothing to link into: an anchor like #type-person would not exist
 * server-side, and would be wrong the moment the reader switches the
 * grouping to "dossier" or "role", which they control. A route is stable;
 * a fragment into user-controlled state is not.
 *
 * WHY A PROJECTION AND NOT A MOVE — entity pages stay exactly where they
 * are. Each entity has one canonical page and URL carrying `aliases` from
 * dossier subtrees and an `@id` in the JSON-LD exports; foldering them by
 * type would change all of those and break the canonical identifiers. These
 * sections are filtered views over the one registry, never a second copy of
 * the records.
 *
 * Every type present in the data gets a section, including types with a
 * single entity. A threshold would be an undocumented gap — a reader who
 * follows "9 types" and finds 6 routes has been misled, and the cutoff would
 * be a number nobody could justify later.
 *
 * Idempotent and safe to re-run: content is derived entirely from
 * data/entity-types.toml plus the entity pages, and stale sections for types
 * no longer present are removed.
 *
 * Usage: node scripts/dossier/build-entity-type-sections.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const ENTITIES_DIR = path.join(ROOT, "content", "entities");
const OUT_ROOT = path.join(ENTITIES_DIR, "typ");
const TYPES_TOML = path.join(ROOT, "data", "entity-types.toml");

function fail(msg) {
  console.error(`build-entity-type-sections: ${msg}`);
  process.exit(1);
}

// --- type vocabulary ------------------------------------------------------
// validate-entity-types.mjs already guarantees this file and the data agree,
// so a missing label here is a bug in that contract, not something to paper
// over with a fallback string.
const typesText = readFileSync(TYPES_TOML, "utf8");
const labels = new Map();
const orders = new Map();
for (const block of typesText.split(/\n\[\[types\]\]/).slice(1)) {
  const id = block.match(/^\s*id\s*=\s*"([^"]+)"/m)?.[1];
  const label = block.match(/^\s*label\s*=\s*"([^"]+)"/m)?.[1];
  const order = Number(block.match(/^\s*order\s*=\s*(\d+)/m)?.[1] ?? 999);
  if (id && label) {
    labels.set(id, label);
    orders.set(id, order);
  }
}
if (labels.size === 0) fail(`no [[types]] entries parsed from ${path.relative(ROOT, TYPES_TOML)}.`);

// --- which types actually occur -------------------------------------------
const counts = new Map();
for (const file of readdirSync(ENTITIES_DIR)) {
  if (!file.endsWith(".md") || file === "_index.md") continue;
  const fm = readFileSync(path.join(ENTITIES_DIR, file), "utf8");
  const type = fm.match(/^entity_type\s*=\s*"([^"]+)"/m)?.[1];
  if (!type) continue;
  counts.set(type, (counts.get(type) ?? 0) + 1);
}
if (counts.size === 0) fail("no entity pages with an entity_type found — refusing to wipe the sections.");

for (const type of counts.keys()) {
  if (!labels.has(type)) {
    fail(`entity_type "${type}" occurs in the data but has no label in ${path.relative(ROOT, TYPES_TOML)}.`);
  }
}

// --- write ----------------------------------------------------------------
mkdirSync(OUT_ROOT, { recursive: true });

// Drop sections for types that no longer occur, so a renamed type cannot
// leave an empty route behind advertising a category that does not exist.
if (existsSync(OUT_ROOT)) {
  for (const dir of readdirSync(OUT_ROOT)) {
    if (!counts.has(dir)) {
      rmSync(path.join(OUT_ROOT, dir), { recursive: true, force: true });
      console.log(`  removed stale section for type "${dir}"`);
    }
  }
}

const escape = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const sorted = [...counts.keys()].sort((a, b) => (orders.get(a) ?? 999) - (orders.get(b) ?? 999) || a.localeCompare(b));

// Section index for /entities/typ/ itself, so the route is not a 404 between
// its children.
writeFileSync(
  path.join(OUT_ROOT, "_index.md"),
  `+++
title = "Entity podle typu"
description = "Rozcestník filtrovaných pohledů na globální registr entit — jeden pohled na každý typ entity."
template = "entity-type-list.html"
sort_by = "weight"

[extra]
lang = "cs"
seo_type = "CollectionPage"
generated_by = "scripts/dossier/build-entity-type-sections.mjs"
+++

Filtrované pohledy na [globální registr entit](@/entities/_index.md) — jeden
na každý typ. **Nejsou to kopie záznamů**: každá entita má i nadále jedinou
kanonickou stránku, tyto pohledy na ni jen odkazují.
`,
);

for (const type of sorted) {
  const dir = path.join(OUT_ROOT, type);
  mkdirSync(dir, { recursive: true });
  const label = labels.get(type);
  writeFileSync(
    path.join(dir, "_index.md"),
    `+++
title = "${escape(label)}"
description = "Filtrovaný pohled na globální registr entit — entity typu ${escape(label.toLowerCase())}."
template = "entity-type-index.html"
weight = ${orders.get(type) ?? 999}
sort_by = "weight"

[extra]
lang = "cs"
seo_type = "CollectionPage"
entity_type = "${escape(type)}"
generated_by = "scripts/dossier/build-entity-type-sections.mjs"
+++

Entity typu **${escape(label.toLowerCase())}** v [globálním registru
entit](@/entities/_index.md). Kanonický záznam každé entity žije tam — tato
stránka je jeho filtrovaný pohled, ne druhá kopie.

Zařazení podle typu je **popisný údaj**, ne hodnocení: neříká nic o tom, zda
je entita subjektem pokrytí, ani o ničem, co je o ní doloženo.
`,
  );
}

console.log(
  `build-entity-type-sections: wrote ${sorted.length} section(s) under content/entities/typ/ — ` +
    sorted.map((t) => `${t}(${counts.get(t)})`).join(", "),
);
