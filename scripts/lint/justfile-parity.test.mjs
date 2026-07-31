/*
 * The justfile documents itself as a thin wrapper whose single rule is
 * "package.json wins; a recipe that disagrees is the bug". That is a claim,
 * and per the constitution (§8) a claim nothing enforces does not count as
 * implemented — so this test enforces it.
 *
 * It checks the two ways a wrapper silently rots:
 *   1. a recipe calls `npm run <script>` that no longer exists (renamed or
 *      dropped in package.json) — the recipe then fails with npm's own error
 *      and looks like a broken repo rather than a stale wrapper;
 *   2. a recipe calls a repo script path that no longer exists.
 *
 * It deliberately does NOT assert the reverse (that every npm script has a
 * recipe): the justfile covers the commands an adopter needs, not all ~30.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const justfile = readFileSync(join(ROOT, "justfile"), "utf8");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

test("every `npm run <script>` in the justfile exists in package.json", () => {
  const referenced = [...justfile.matchAll(/npm run (?:--silent )?([\w:-]+)/g)].map((m) => m[1]);
  assert.ok(referenced.length > 0, "no npm run references found — did the justfile format change?");

  const missing = [...new Set(referenced)].filter((s) => !(s in pkg.scripts));
  assert.deepEqual(
    missing,
    [],
    `justfile calls npm script(s) that package.json does not define: ${missing.join(", ")}. ` +
      "package.json wins — fix the justfile.",
  );
});

test("every repo script path the justfile runs exists on disk", () => {
  const paths = [
    ...[...justfile.matchAll(/node (scripts\/[\w./-]+\.mjs)/g)].map((m) => m[1]),
    ...[...justfile.matchAll(/^\s+\.?\/?((?:scripts|\.githooks)\/[\w./-]+)/gm)].map((m) => m[1]),
  ];
  assert.ok(paths.length > 0, "no script paths found — did the justfile format change?");

  const missing = [...new Set(paths)].filter((p) => !existsSync(join(ROOT, p)));
  assert.deepEqual(missing, [], `justfile runs path(s) that do not exist: ${missing.join(", ")}`);
});

test("every recipe appears in the README task-runner table", () => {
  // README presents that table as the complete list, so a recipe missing
  // from it is a documentation claim that quietly stopped being true —
  // which is exactly how `just expand` fell out of it.
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  const table = readme.slice(readme.indexOf("## Task runner"));

  const recipes = [...justfile.matchAll(/^([a-z][\w-]*)(?: [^\n:]*)?:$/gm)]
    .map((m) => m[1])
    .filter((name) => name !== "default");

  const undocumented = [...new Set(recipes)].filter(
    (name) => !new RegExp(`\`just ${name}\\b`).test(table),
  );
  assert.deepEqual(
    undocumented,
    [],
    `recipe(s) missing from the README task-runner table: ${undocumented.join(", ")}`,
  );
});

test("`just build` wraps the real gate, not a subset", () => {
  // If someone ever points `just build` at something cheaper, the README and
  // the landing-page concept both start lying about what the gate is.
  const recipe = justfile.match(/^build:\n((?:\s+.+\n)+)/m);
  assert.ok(recipe, "no `build:` recipe found in the justfile");
  assert.match(recipe[1], /npm run build\b/, "`just build` must call `npm run build`");
});

test("`just check` runs the hook itself so it cannot drift from it", () => {
  const recipe = justfile.match(/^check:\n((?:\s+.+\n)+)/m);
  assert.ok(recipe, "no `check:` recipe found in the justfile");
  assert.match(
    recipe[1],
    /\.githooks\/pre-commit/,
    "`just check` must execute .githooks/pre-commit rather than re-listing its steps",
  );
});
