#!/usr/bin/env node
// Testy PreToolUse guardrailu. Blokující hook bez testu je zakázaný,
// a to ze dvou stran:
//
// (1) musí SKUTEČNĚ blokovat to, co má — jinak je to jen komentář;
// (2) nesmí blokovat nic dalšího a nesmí spadnout na svém vlastním
//     vstupu. Hook, který kvůli chybnému parsování zastaví práci na
//     celém repozitáři, je horší než žádný.
//
// Usage: node --test scripts/hooks/protect-canonical.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decide, isGenerated, relativePath, LOG_HEADING } from "./protect-canonical.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOOK = join(ROOT, "scripts/hooks/protect-canonical.mjs");

const edit = (file, over = {}) => ({
  tool_name: "Edit",
  tool_input: { file_path: join(ROOT, file), old_string: "x", new_string: "y", ...over },
});

/* ---- 1) kotva, na které hook stojí ----------------------------------- */

test("nadpis autorizačního logu v AGENTS.md skutečně existuje", () => {
  // Kdyby se přejmenoval, hook by tiše přestal blokovat. Radši ať to
  // shodí test než aby se to zjistilo po přepsaném záznamu.
  assert.ok(readFileSync(join(ROOT, "AGENTS.md"), "utf8").includes(LOG_HEADING));
});

/* ---- 2) blokované případy -------------------------------------------- */

test("P1: editace uvnitř autorizačního logu se blokuje", () => {
  const text = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  const logStart = text.indexOf(LOG_HEADING);
  // Vezmi skutečný kus textu z logu — ne vymyšlený.
  const snippet = text.slice(logStart + 200, logStart + 260);
  const reason = decide(edit("AGENTS.md", { old_string: snippet }), ROOT);
  assert.match(reason ?? "", /^P1:/);
});

test("P1: Write přes celý AGENTS.md se blokuje", () => {
  const payload = {
    tool_name: "Write",
    tool_input: { file_path: join(ROOT, "AGENTS.md"), content: "cokoli" },
  };
  assert.match(decide(payload, ROOT) ?? "", /^P1:/);
});

test("P2: generovaný obsah se blokuje ve všech chráněných tvarech", () => {
  const blocked = [
    "content/dossiers/petr-pavel/_index.md",
    "content/dossiers/petr-pavel/claims/clm-01.md",
    "content/dossiers/petr-pavel/sources/src-01.md",
    "content/entities/nekdo.md",
    "content/entities/typ/firma/_index.md",
    "content/dokumentace/prikazy/skill-guide.md",
    "content/zdroje/ares.md",
    "data/generated/tooling-catalog.json",
    "docs/TOOLING.md",
    "docs/osint/SOURCE_CATALOG.md",
  ];
  for (const file of blocked) {
    assert.match(decide(edit(file), ROOT) ?? "", /^P2:/, `${file} se má blokovat`);
  }
});

test("P2: hláška říká, kde je kanonický vstup", () => {
  const reason = decide(edit("content/dossiers/petr-pavel/claims/clm-01.md"), ROOT);
  assert.match(reason, /data\/dossiers/);
  assert.match(reason, /data:build/);
});

/* ---- 3) povolené případy: hook nesmí přerůst svůj důvod --------------- */

test("kanonická data se NEblokují — mají se měnit", () => {
  assert.equal(decide(edit("data/dossiers/petr-pavel/claims/clm-01.json"), ROOT), null);
  assert.equal(decide(edit("data/tooling/skill-guide.json"), ROOT), null);
  assert.equal(decide(edit("data/source-catalog/ares.json"), ROOT), null);
});

test("ostatní sekce AGENTS.md se NEblokují", () => {
  const text = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
  const before = text.slice(100, 160); // hodně nad logem
  assert.equal(decide(edit("AGENTS.md", { old_string: before }), ROOT), null);
});

test("ručně psané stránky v content/ se NEblokují", () => {
  for (const file of [
    "content/_index.md",
    "content/dossiers/_index.md",
    "content/koncepty/co-je-dossier.md",
    "content/akademie/a101-co-je-dossier.md",
    "content/dossiers/petr-pavel/evidence/_index.md",
  ]) {
    assert.equal(decide(edit(file), ROOT), null, `${file} se blokovat nemá`);
  }
});

test("čtení a jiné nástroje se neřeší", () => {
  for (const tool of ["Read", "Grep", "Bash", "Glob"]) {
    assert.equal(decide({ tool_name: tool, tool_input: { file_path: join(ROOT, "docs/TOOLING.md") } }, ROOT), null);
  }
});

/* ---- 4) hraniční a poškozený vstup ----------------------------------- */

test("chybějící pole nevedou k blokaci ani k pádu", () => {
  assert.equal(decide({}, ROOT), null);
  assert.equal(decide({ tool_name: "Edit" }, ROOT), null);
  assert.equal(decide({ tool_name: "Edit", tool_input: {} }, ROOT), null);
  assert.equal(decide(null, ROOT), null);
});

test("cesta mimo repozitář se neřeší", () => {
  assert.equal(relativePath("/etc/passwd", ROOT), null);
  assert.equal(decide({ tool_name: "Edit", tool_input: { file_path: "/tmp/jinde/docs/TOOLING.md" } }, ROOT), null);
});

test("podobná, ale jiná cesta se neblokuje", () => {
  // Vzory musí být kotvené. `mydocs/TOOLING.md` ani
  // `content/dossiers/x/poznamky/y.md` chráněné nejsou.
  assert.ok(!isGenerated("mydocs/TOOLING.md"));
  assert.ok(!isGenerated("content/dossiers/x/poznamky/y.md"));
  assert.ok(!isGenerated("data/generated"));
  assert.ok(isGenerated("data/generated/views/x.json"));
});

/* ---- 5) skutečný běh přes stdin -------------------------------------- */

const run = (stdin) =>
  spawnSync(process.execPath, [HOOK], {
    input: stdin,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT },
  });

test("hook běží jako proces a vydává platné rozhodnutí", () => {
  const denied = run(JSON.stringify(edit("docs/TOOLING.md")));
  assert.equal(denied.status, 0);
  const parsed = JSON.parse(denied.stdout);
  assert.equal(parsed.hookSpecificOutput.permissionDecision, "deny");
  assert.match(parsed.hookSpecificOutput.permissionDecisionReason, /^P2:/);

  const allowed = run(JSON.stringify(edit("data/dossiers/x/claims/clm-01.json")));
  assert.equal(allowed.status, 0);
  assert.deepEqual(JSON.parse(allowed.stdout), {});
});

test("poškozený vstup končí povolením, ne pádem", () => {
  for (const bad of ["", "{", "null", "[]", "not json at all"]) {
    const res = run(bad);
    assert.equal(res.status, 0, `vstup ${JSON.stringify(bad)} nesmí shodit hook`);
    assert.deepEqual(JSON.parse(res.stdout), {}, "poškozený vstup se má povolit");
  }
});
