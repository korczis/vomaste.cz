#!/usr/bin/env node
/*
 * Validates content/entities/* against data/entity-types.toml.
 *
 * Why this exists: registr entit (templates/entities-index.html) seskupuje
 * entity podle `extra.entity_type` a název skupiny bere z tohohle slovníku.
 * Bez kontroly by nový typ entity tiše propadl do skupiny pojmenované syrovou
 * hodnotou (`legal_or_administrative_process`), a mrtvý překlad by tu ležel
 * roky, aniž by si toho někdo všiml — obojí je neviditelné v zeleném
 * `zola build`. Kontroluje se tedy oběma směry, stejně jako u konceptů:
 *
 *   - každý typ použitý v datech musí mít záznam ve slovníku,
 *   - každý záznam ve slovníku musí být v datech použitý.
 *
 * Slovník je jen popiskovač. Zdrojem pravdy o tom, jaké typy existují,
 * zůstává front matter stránek entit.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENTITIES_DIR = join(ROOT, "content/entities");
const TYPES_TOML = join(ROOT, "data/entity-types.toml");

const errors = [];
const err = (msg) => errors.push(msg);

const frontMatter = (text) => (text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
const str = (fm, key) => (fm.match(new RegExp(`^\\s*${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;

const typesText = readFileSync(TYPES_TOML, "utf8");
const declared = [...typesText.matchAll(/\[\[types\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)].map((m) => ({
  id: str(m[1], "id"),
  label: str(m[1], "label"),
}));
if (declared.length === 0) err("data/entity-types.toml: no [[types]] found.");

const byId = new Map();
for (const t of declared) {
  if (!t.id) err("data/entity-types.toml: a type has no id.");
  else if (byId.has(t.id)) err(`data/entity-types.toml: duplicate type id "${t.id}".`);
  else byId.set(t.id, t);
  if (t.id && !t.label) err(`data/entity-types.toml: type "${t.id}" has no label — the group header would show the raw id.`);
}

const used = new Map();
const files = readdirSync(ENTITIES_DIR).filter((f) => f.endsWith(".md") && f !== "_index.md");
for (const file of files) {
  const fm = frontMatter(readFileSync(join(ENTITIES_DIR, file), "utf8"));
  const type = str(fm, "entity_type");
  if (!type) {
    err(`content/entities/${file}: missing entity_type — it would land in an unnamed group.`);
    continue;
  }
  if (!used.has(type)) used.set(type, []);
  used.get(type).push(file);
}

for (const [type, pages] of used) {
  if (!byId.has(type)) {
    err(
      `entity_type "${type}" (${pages.length} page(s), e.g. content/entities/${pages[0]}) has no entry in data/entity-types.toml — add one with a human label.`,
    );
  }
}
for (const id of byId.keys()) {
  if (!used.has(id)) {
    err(`data/entity-types.toml: type "${id}" is not used by any entity page — remove it instead of keeping a dead label.`);
  }
}

if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  process.exit(1);
}
console.log(
  `OK — entity types: ${byId.size} declared, all used; ${files.length} entity page(s) checked, every type has a label.`,
);
