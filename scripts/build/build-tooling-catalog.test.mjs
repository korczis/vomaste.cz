#!/usr/bin/env node
// Regresní testy katalogu toolingu. Nosná chování, ne pokrytí řádků:
//
// (1) skutečný repozitář katalogem projde — jinak by brána byla jen
//     teoretická;
// (2) obě strany obousměrnosti SKUTEČNĚ padají. Brána, která nikdy nic
//     neodmítne, je vynucení bez krytí — a přesně to má tenhle katalog
//     u ostatních příkazů dokumentovat, takže si to nesmí dovolit sám;
// (3) dopočítávané údaje se čtou ze skutečných zdrojů (package.json,
//     justfile, .githooks/pre-commit, SKILL.md), ne z ručně psaných dat;
// (4) commitnutý výstup odpovídá datům a rozdíl se pozná.
//
// Usage: node --test scripts/build/build-tooling-catalog.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auditCatalog,
  executedPrograms,
  readJustRecipes,
  readNpmScripts,
  readPrecommitChecks,
  readAgents,
  readRecords,
  readSkills,
  slugFor,
  NPM_LIFECYCLE,
} from "./build-tooling-catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const real = () => ({
  records: readRecords(),
  scripts: readNpmScripts(),
  recipes: readJustRecipes(),
  skills: readSkills(),
});

/* ---- 1) skutečný repozitář ------------------------------------------- */

test("skutečný repozitář katalogem projde", () => {
  assert.deepEqual(auditCatalog(real()), []);
});

test("každý npm skript mimo lifecycle hooky má záznam", () => {
  const { records, scripts } = real();
  const documented = new Set(records.filter((r) => r.kind === "npm").map((r) => r.name));
  const missing = Object.keys(scripts).filter((s) => !NPM_LIFECYCLE.has(s) && !documented.has(s));
  assert.deepEqual(missing, []);
});

test("postinstall je vyřazený jako lifecycle hook, preflight ne", () => {
  // Prefixové pravidlo („cokoli na pre*/post*") by `preflight` omylem
  // vyhodilo z dokumentace — proto je množina vyjmenovaná.
  assert.ok(NPM_LIFECYCLE.has("postinstall"));
  assert.ok(!NPM_LIFECYCLE.has("preflight"));
  const { records } = real();
  assert.ok(records.some((r) => r.kind === "npm" && r.name === "preflight"));
});

/* ---- 2) negativní případy: brána musí padat -------------------------- */

const base = () => {
  const { records, scripts, recipes, skills } = real();
  return {
    records: records.filter((r) => ["data-validate", "skill-adr", "just-build"].includes(r.identifier)).map((r) => ({ ...r })),
    scripts: { "data:validate": scripts["data:validate"] },
    recipes: recipes.filter((r) => r.name === "build"),
    skills: skills.filter((s) => s.name === "adr"),
  };
};

test("G1: npm skript bez záznamu shodí bránu", () => {
  const fixture = base();
  fixture.scripts["novy:prikaz"] = "node scripts/build/pipeline.mjs build";
  const errors = auditCatalog(fixture);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /^G1: npm skript "novy:prikaz" nemá záznam/);
});

test("G1: záznam ukazující na neexistující npm skript shodí bránu", () => {
  const fixture = base();
  delete fixture.scripts["data:validate"];
  const errors = auditCatalog(fixture);
  assert.ok(errors.some((e) => /^G1: záznam data-validate ukazuje na npm skript/.test(e)));
});

test("G2: skill bez záznamu i mrtvý záznam skillu shodí bránu", () => {
  const missing = base();
  missing.skills.push({ name: "novy-skill", file: ".claude/skills/novy-skill/SKILL.md" });
  assert.ok(auditCatalog(missing).some((e) => /^G2: skill "novy-skill" nemá záznam/.test(e)));

  const dead = base();
  dead.skills = [];
  assert.ok(auditCatalog(dead).some((e) => /^G2: záznam skill-adr ukazuje na skill "adr"/.test(e)));
});

test("G3: just recept bez záznamu i mrtvý záznam receptu shodí bránu", () => {
  const missing = base();
  missing.recipes.push({ name: "novy-recept", params: [], doc: null, body: ["npm test"] });
  assert.ok(auditCatalog(missing).some((e) => /^G3: just recept "novy-recept" nemá záznam/.test(e)));

  const dead = base();
  dead.recipes = [];
  assert.ok(auditCatalog(dead).some((e) => /^G3: záznam just-build ukazuje na just recept "build"/.test(e)));
});

test("G4: slug, který neodpovídá popisovanému příkazu, shodí bránu", () => {
  const fixture = base();
  fixture.records = fixture.records.map((r) => (r.identifier === "data-validate" ? { ...r, identifier: "neco-jineho" } : r));
  assert.ok(auditCatalog(fixture).some((e) => /^G4: záznam neco-jineho popisuje npm "data:validate"/.test(e)));
});

test("G5: neexistující sourceFile a sourceFile, který příkaz nevolá, shodí bránu", () => {
  const ghost = base();
  ghost.records = ghost.records.map((r) => (r.identifier === "data-validate" ? { ...r, sourceFile: "scripts/data/neexistuje.mjs" } : r));
  assert.ok(auditCatalog(ghost).some((e) => /^G5: záznam data-validate odkazuje na scripts\/data\/neexistuje\.mjs/.test(e)));

  const wrong = base();
  wrong.records = wrong.records.map((r) => (r.identifier === "data-validate" ? { ...r, sourceFile: "scripts/build/pipeline.mjs" } : r));
  assert.ok(auditCatalog(wrong).some((e) => /^G5: záznam data-validate deklaruje scripts\/build\/pipeline\.mjs, ale příkaz/.test(e)));
});

test("G6: npm skript spouštějící soubor repozitáře musí říct který", () => {
  const fixture = base();
  fixture.records = fixture.records.map((r) => {
    if (r.identifier !== "data-validate") return r;
    const { sourceFile, ...rest } = r;
    return rest;
  });
  assert.ok(auditCatalog(fixture).some((e) => /^G6: záznam data-validate nemá sourceFile/.test(e)));
});

test("executedPrograms nevyžaduje sourceFile u testových běhů a bundlerů", () => {
  // `node --test <glob>` a vstupy bundleru nejsou implementací příkazu:
  // vybrat z množiny souborů jeden by byla libovůle, ne dokumentace.
  assert.deepEqual(executedPrograms("node --test scripts/build/*.test.mjs scripts/ci/*.test.mjs"), []);
  assert.deepEqual(executedPrograms("esbuild assets/js/app.js --bundle --outdir=static/js"), []);
  assert.deepEqual(executedPrograms("tailwindcss -i ./static/css/input.css -o ./static/css/main.css --minify"), []);
  assert.deepEqual(executedPrograms("npm run a && npm run b"), []);
  // Naopak skutečné spuštění se pozná i v řetězu a přes shell soubor.
  assert.deepEqual(executedPrograms("node scripts/data/validate.mjs"), ["scripts/data/validate.mjs"]);
  assert.deepEqual(
    executedPrograms("node scripts/build/require-generated.mjs --quiet || npm run generate:all ; zola serve"),
    ["scripts/build/require-generated.mjs"],
  );
  assert.deepEqual(executedPrograms("./scripts/coop/coop.sh status"), ["scripts/coop/coop.sh"]);
});

test("slugFor odděluje vrstvy, takže se npm skript a stejnojmenný recept nesrazí", () => {
  assert.equal(slugFor("npm", "data:validate"), "data-validate");
  assert.equal(slugFor("just", "build"), "just-build");
  assert.equal(slugFor("skill", "adr"), "skill-adr");
  assert.notEqual(slugFor("npm", "build"), slugFor("just", "build"));
});

/* ---- 2b) Claude vrstva: subagenti, workflow, persona, riziko --------- */

// Minimální platný pár záznam + soubor. Skutečné agenty a workflow tenhle
// repozitář v době psaní testu ještě nemá, takže se brána musí dát ověřit
// na fixture — jinak by testy zezelenaly jen proto, že není co kontrolovat.
const agentRecord = (over = {}) => ({
  identifier: "agent-source-verifier",
  kind: "agent",
  name: "source-verifier",
  personas: ["researcher"],
  riskLevel: "read-only",
  writes: false,
  ...over,
});

const agentFile = (over = {}) => ({
  name: "source-verifier",
  file: ".claude/agents/source-verifier.md",
  declaredName: "source-verifier",
  description: "Ověří zdroj a vrátí evidence summary.",
  tools: ["Read", "Grep"],
  model: null,
  skills: [],
  ...over,
});

const withAgent = (recordOver = {}, fileOver = {}) => {
  const fixture = base();
  fixture.records.push(agentRecord(recordOver));
  fixture.agents = [agentFile(fileOver)];
  return fixture;
};

test("Claude vrstva projde, když záznam i soubor sedí", () => {
  assert.deepEqual(auditCatalog(withAgent()), []);
});

test("G8: subagent bez záznamu i mrtvý záznam agenta shodí bránu", () => {
  const missing = base();
  missing.agents = [agentFile()];
  assert.ok(auditCatalog(missing).some((e) => /^G8: subagent .* "source-verifier" nemá záznam/.test(e)));

  const dead = withAgent();
  dead.agents = [];
  assert.ok(auditCatalog(dead).some((e) => /^G8: záznam agent-source-verifier ukazuje na/.test(e)));
});

test("G9: workflow bez záznamu i mrtvý záznam workflow shodí bránu", () => {
  const missing = base();
  missing.workflows = [{ name: "verify-a-claim", file: ".claude/workflows/verify-a-claim.md" }];
  assert.ok(auditCatalog(missing).some((e) => /^G9: workflow .* "verify-a-claim" nemá záznam/.test(e)));

  const dead = base();
  dead.records.push({
    identifier: "workflow-verify-a-claim",
    kind: "workflow",
    name: "verify-a-claim",
    personas: ["verifier"],
    riskLevel: "read-only",
    writes: false,
  });
  assert.ok(auditCatalog(dead).some((e) => /^G9: záznam workflow-verify-a-claim ukazuje na/.test(e)));
});

test("G10: schopnost bez persony, rizika nebo writes shodí bránu", () => {
  for (const missing of ["personas", "riskLevel", "writes"]) {
    const fixture = withAgent();
    delete fixture.records.at(-1)[missing];
    const errors = auditCatalog(fixture);
    assert.ok(
      errors.some((e) => e.startsWith("G10:") && e.includes(missing)),
      `chybějící ${missing} musí shodit bránu, dostal jsem: ${JSON.stringify(errors)}`,
    );
  }
});

test("G10: prázdné pole person se nepočítá za vyplněné", () => {
  assert.ok(auditCatalog(withAgent({ personas: [] })).some((e) => /^G10:.*personas/.test(e)));
});

test("G10: „jen čte\" spolu se zápisem je nepravdivý štítek", () => {
  const fixture = withAgent({ riskLevel: "read-only", writes: true });
  assert.ok(auditCatalog(fixture).some((e) => /^G10: záznam agent-source-verifier má riskLevel "read-only"/.test(e)));
});

test("G10: npm skript personu mít nemusí — je to příkazová vrstva", () => {
  // Kdyby brána vyžadovala personu i tady, muselo by se 104 npm skriptům
  // vymyslet publikum, které nemají. To by byla libovůle, ne dokumentace.
  const fixture = base();
  assert.ok(fixture.records.some((r) => r.kind === "npm" && !r.personas));
  assert.deepEqual(auditCatalog(fixture), []);
});

test("G11: subagent bez vyjmenovaných tools shodí bránu", () => {
  // Nejdůležitější negativní případ celé vrstvy: vynechané `tools` znamená
  // v Claude Code dědění všech nástrojů, takže by „read-only" agent uměl
  // Write a Edit. Tichý průchod by tu byl bezpečnostní díra.
  assert.ok(auditCatalog(withAgent({}, { tools: null })).some((e) => /^G11: .* neuvádí "tools"/.test(e)));
});

test("G11: rozejité name a název souboru shodí bránu", () => {
  const fixture = withAgent({}, { declaredName: "neco-jineho" });
  assert.ok(auditCatalog(fixture).some((e) => /^G11: .* deklaruje name "neco-jineho"/.test(e)));

  const noName = withAgent({}, { declaredName: null });
  assert.ok(auditCatalog(noName).some((e) => /^G11: .* nemá povinné pole "name"/.test(e)));
});

test("G11: subagent bez description shodí bránu", () => {
  const fixture = withAgent({}, { description: null });
  assert.ok(auditCatalog(fixture).some((e) => /^G11: .* nemá povinné pole "description"/.test(e)));
});

test("readAgents odliší vynechané tools od prázdného seznamu", () => {
  // `tools` vynechané (zdědí všechno) a `tools: Read, Grep` jsou dvě různé
  // věci a brána G11 na tom rozdílu stojí.
  const dir = join(ROOT, ".claude/agents");
  mkdirSync(dir, { recursive: true });
  const probe = join(dir, "__test-probe.md");
  try {
    writeFileSync(probe, "---\nname: __test-probe\ndescription: Sonda.\n---\n\nTělo.\n");
    const found = readAgents(ROOT).find((a) => a.name === "__test-probe");
    assert.equal(found.tools, null);
    assert.equal(found.declaredName, "__test-probe");

    writeFileSync(probe, "---\nname: __test-probe\ndescription: Sonda.\ntools: Read, Grep\n---\n\nTělo.\n");
    assert.deepEqual(readAgents(ROOT).find((a) => a.name === "__test-probe").tools, ["Read", "Grep"]);
  } finally {
    rmSync(probe, { force: true });
  }
});

/* ---- 3) dopočítávané údaje čtou skutečnost --------------------------- */

test("just recepty se čtou z justfile, přiřazení proměnné se za recept nepovažuje", () => {
  const recipes = readJustRecipes();
  const names = recipes.map((r) => r.name);
  assert.ok(names.includes("build"));
  assert.ok(names.includes("scaffold"));
  assert.ok(!names.some((n) => n.includes("node_major")), "`node_major := …` není recept");
  assert.deepEqual(
    recipes.find((r) => r.name === "scaffold").params,
    ["slug", "title", "subject", "auth_record_id"],
  );
  assert.ok(recipes.find((r) => r.name === "build").body.includes("npm run build"));
});

test("pre-commit členství se čte z .githooks/pre-commit, ne z dat", () => {
  const checks = readPrecommitChecks();
  assert.ok(checks.includes("data:validate"));
  assert.ok(checks.includes("verify:source-catalog"));
  // Komentáře v poli FAST_CHECKS se nesmí načíst jako názvy skriptů.
  const scripts = readNpmScripts();
  for (const c of checks) assert.ok(scripts[c], `pre-commit odkazuje na neexistující skript "${c}"`);
});

test("frontmatter skillu se přebírá doslova", () => {
  const adr = readSkills().find((s) => s.name === "adr");
  assert.equal(adr.file, ".claude/skills/adr/SKILL.md");
  assert.ok(adr.description && adr.description.length > 40);
  assert.ok(adr.argumentHint);
});

/* ---- 4) parita commitnutého výstupu ---------------------------------- */

const runCheck = () =>
  spawnSync("node", [join(ROOT, "scripts/build/build-tooling-catalog.mjs"), "--check"], { cwd: ROOT, encoding: "utf8" });

test("commitnutý výstup odpovídá datům", () => {
  const res = runCheck();
  assert.equal(res.status, 0, res.stdout + res.stderr);
});

test("rozejitý výstup brána pozná", () => {
  const path = join(ROOT, "docs/TOOLING.md");
  const original = readFileSync(path);
  try {
    writeFileSync(path, original.toString() + "\nRuční dopisek, který generátor nikdy nenapsal.\n");
    const res = runCheck();
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Katalog toolingu není aktuální/);
    assert.match(res.stderr, /docs\/TOOLING\.md/);
  } finally {
    writeFileSync(path, original);
  }
});
