#!/usr/bin/env node
/*
 * Validates content/koncepty/* against data/concept-groups.toml.
 *
 * Why this exists: every tile on the landing page is rendered from a concept
 * page's own front matter (extra.tile_title / tile_summary / bullets) and links
 * to that page. A concept missing its tile fields silently renders an empty,
 * clickable box on the landing page; a concept in an unknown group silently
 * disappears from it entirely. Both are invisible in a passing `zola build`,
 * so they are checked here — same "front matter + template + validator must
 * agree" rule the dossier registries follow (see CLAUDE.md).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONCEPTS_DIR = join(ROOT, "content/koncepty");
const GROUPS_TOML = join(ROOT, "data/concept-groups.toml");

const errors = [];
const err = (msg) => errors.push(msg);

// Minimal front-matter reader: the +++ TOML block, only the keys we check.
function frontMatter(text) {
  const m = text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/);
  return m ? m[1] : "";
}
const str = (fm, key) => (fm.match(new RegExp(`^\\s*${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;
const hasArray = (fm, key) => new RegExp(`^\\s*${key}\\s*=\\s*\\[`, "m").test(fm);

const groupsText = readFileSync(GROUPS_TOML, "utf8");
const groups = [...groupsText.matchAll(/\[\[groups\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)].map((m) => ({
  id: str(m[1], "id"),
  label: str(m[1], "label"),
  lead: str(m[1], "lead"),
}));
if (groups.length === 0) err("data/concept-groups.toml: no [[groups]] found.");
for (const g of groups) {
  if (!g.id) err("data/concept-groups.toml: a group has no id.");
  if (!g.label) err(`concept group "${g.id}": missing label.`);
  if (!g.lead) err(`concept group "${g.id}": missing lead (used as the group blurb on /koncepty/).`);
}

// Fields each group's tiles need to render correctly on the landing page.
const REQUIRED_BY_GROUP = {
  model: ["code"],
  stav: ["badge_class", "badge_label"],
  metodika: ["icon"],
};

const files = readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith(".md") && f !== "_index.md");
if (files.length === 0) err("content/koncepty/: no concept pages found.");

const seenGroups = new Set();
for (const file of files) {
  const rel = `content/koncepty/${file}`;
  const fm = frontMatter(readFileSync(join(CONCEPTS_DIR, file), "utf8"));
  if (!fm) { err(`${rel}: no +++ front matter block.`); continue; }

  if (str(fm, "template") !== "concept.html") err(`${rel}: template must be "concept.html".`);
  if (!str(fm, "title")) err(`${rel}: missing title.`);
  if (!str(fm, "description")) err(`${rel}: missing description (used as the meta description and the card text on /koncepty/).`);

  const group = str(fm, "group");
  if (!group) {
    err(`${rel}: missing extra.group — it would never appear on the landing page.`);
  } else if (!groups.some((g) => g.id === group)) {
    err(`${rel}: extra.group = "${group}" is not defined in data/concept-groups.toml.`);
  } else {
    seenGroups.add(group);
    for (const key of REQUIRED_BY_GROUP[group] ?? []) {
      if (!str(fm, key)) err(`${rel}: group "${group}" requires extra.${key} for its landing-page tile.`);
    }
  }

  if (!str(fm, "tile_title")) err(`${rel}: missing extra.tile_title — the landing tile would fall back to the full page title.`);
  if (!str(fm, "tile_summary") && !hasArray(fm, "bullets")) {
    err(`${rel}: needs extra.tile_summary or extra.bullets, otherwise its landing tile renders empty.`);
  }

  const slug = basename(file, ".md");
  if (!/^[a-z0-9-]+$/.test(slug)) err(`${rel}: filename must be a lowercase kebab-case slug (it becomes the public URL).`);
}

for (const g of groups) {
  if (g.id && !seenGroups.has(g.id)) {
    err(`concept group "${g.id}" has no pages — the landing page would render an empty section for it.`);
  }
}

if (errors.length) {
  console.log(`${errors.length} error(s):`);
  for (const e of errors) console.log(`  ERROR ${e}`);
  process.exit(1);
}
console.log(`OK — ${files.length} concept page(s) across ${groups.length} group(s), all landing-tile fields present.`);
