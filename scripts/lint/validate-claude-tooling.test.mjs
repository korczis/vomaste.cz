#!/usr/bin/env node
// Testy brány Claude toolingu. Tři věci, které se ověřují:
//
// (1) skutečný repozitář bránou projde — jinak je to teorie;
// (2) každá kontrola SKUTEČNĚ padá na fixture. Brána, která nikdy nic
//     neodmítne, je vynucení bez krytí;
// (3) golden paths: pro každou personu existuje průchozí cesta a
//     všechno, na co ukazuje, existuje. Tohle je to jediné, co jde
//     z „end-to-end journey" otestovat mechanicky — text promptu se za
//     test vydávat nesmí.
//
// Usage: node --test scripts/lint/validate-claude-tooling.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frontmatterOf, pathCandidates, skillCandidates, npmCandidates, scannedFiles, validate } from "./validate-claude-tooling.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/* ---- 1) skutečnost ---------------------------------------------------- */

test("skutečný repozitář bránou projde", () => {
  assert.deepEqual(validate(ROOT), []);
});

test("skenuje se CLAUDE.md, pravidla, skilly, agenti i workflow", () => {
  const files = scannedFiles(ROOT);
  assert.ok(files.includes("CLAUDE.md"));
  assert.ok(files.some((f) => f.startsWith(".claude/rules/")));
  assert.ok(files.some((f) => f.endsWith("/SKILL.md")));
  assert.ok(files.some((f) => f.startsWith(".claude/agents/")));
  assert.ok(files.some((f) => f.startsWith(".claude/workflows/")));
});

/* ---- 2) rozpoznávání kandidátů --------------------------------------- */

test("zástupné symboly a gitové reference se za cestu nepovažují", () => {
  // Brána, která křičí na `data/dossiers/<slug>/`, se vypne — a pak
  // nehlídá nic.
  const text = "`data/dossiers/<slug>/x.json` `clm-NN.json` `CLM-##` `origin/master` `package.json`";
  assert.deepEqual(pathCandidates(text), ["package.json"]);
});

test("URL webu se nepovažuje za volání skillu", () => {
  // `/dossiers/` je adresa stránky, `/guide` je skill. Rozdíl je
  // v koncovém lomítku a je to jediné, co je spolehlivé.
  const text = "`/dossiers/` `/prirucka/ref-stavy-tvrzeni/` `/guide` `/verify-source`";
  assert.deepEqual(skillCandidates(text).sort(), ["guide", "verify-source"]);
});

test("npm příkazy se najdou i bez backticků", () => {
  assert.deepEqual(npmCandidates("spusť npm run build a pak `npm run data:validate`").sort(), [
    "build",
    "data:validate",
  ]);
});

test("frontmatter slepuje pokračovací řádky", () => {
  const meta = frontmatterOf("---\nname: x\ndescription: první\n  druhá\n---\ntělo");
  assert.equal(meta.name, "x");
  assert.equal(meta.description, "první druhá");
});

/* ---- 3) negativní případy: brána musí padat -------------------------- */

// Kontroly se ověřují na dočasném souboru ve skutečném stromu — jinak
// by test ověřoval jen regulární výrazy, ne bránu.
const withTempFile = (relPath, content, fn) => {
  const abs = join(ROOT, relPath);
  mkdirSync(dirname(abs), { recursive: true });
  const existed = existsSync(abs);
  const before = existed ? readFileSync(abs, "utf8") : null;
  try {
    writeFileSync(abs, content);
    return fn();
  } finally {
    if (existed) writeFileSync(abs, before);
    else rmSync(abs, { force: true });
  }
};

test("CT2: odkaz na neexistující cestu shodí bránu", () => {
  const errors = withTempFile(
    ".claude/rules/__test-probe.md",
    "---\npaths:\n  - \"nikde/**\"\n---\n\nViz `scripts/data/rozhodne-neexistuje.mjs`.\n",
    () => validate(ROOT),
  );
  assert.ok(errors.some((e) => /^CT2:.*rozhodne-neexistuje/.test(e)), JSON.stringify(errors));
});

test("CT4: odkaz na neexistující npm příkaz shodí bránu", () => {
  const errors = withTempFile(
    ".claude/rules/__test-probe.md",
    "---\npaths:\n  - \"nikde/**\"\n---\n\nSpusť `npm run rozhodne-neexistuje`.\n",
    () => validate(ROOT),
  );
  assert.ok(errors.some((e) => /^CT4:.*rozhodne-neexistuje/.test(e)));
});

test("CT5: odkaz na neexistující skill shodí bránu", () => {
  const errors = withTempFile(
    ".claude/rules/__test-probe.md",
    "---\npaths:\n  - \"nikde/**\"\n---\n\nPoužij `/rozhodne-neexistuje`.\n",
    () => validate(ROOT),
  );
  assert.ok(errors.some((e) => /^CT5:.*rozhodne-neexistuje/.test(e)));
});

test("CT6: skill bez hranice použití shodí bránu", () => {
  const errors = withTempFile(
    ".claude/skills/__test-probe/SKILL.md",
    "---\nname: __test-probe\ndescription: Sonda.\n---\n\nTělo bez hranice.\n",
    () => validate(ROOT),
  );
  assert.ok(errors.some((e) => /^CT6: skill "__test-probe"/.test(e)));
});

test("CT8: workflow ukazující na neexistující skill shodí bránu", () => {
  const errors = withTempFile(
    ".claude/workflows/__test-probe.md",
    "---\ntitle: Sonda\npersona: reader\ngoal: Ověřit bránu.\nskills: rozhodne-neexistuje\n---\n\nTělo.\n",
    () => validate(ROOT),
  );
  assert.ok(errors.some((e) => /^CT8:.*rozhodne-neexistuje/.test(e)));
});

test("CT8: neznámá persona a chybějící cíl shodí bránu", () => {
  const bad = withTempFile(
    ".claude/workflows/__test-probe.md",
    "---\ntitle: Sonda\npersona: kouzelnik\ngoal: X\n---\n\nTělo.\n",
    () => validate(ROOT),
  );
  assert.ok(bad.some((e) => /^CT8:.*neznámou personu "kouzelnik"/.test(e)));

  const noGoal = withTempFile(
    ".claude/workflows/__test-probe.md",
    "---\ntitle: Sonda\npersona: reader\n---\n\nTělo.\n",
    () => validate(ROOT),
  );
  assert.ok(noGoal.some((e) => /^CT8:.*neuvádí goal/.test(e)));
});

test("CT9: riziková zapisující schopnost bez zámku shodí bránu", () => {
  // Nejcennější negativní případ celé brány: /commit na master nasazuje
  // web během sekund. Kdyby ho Claude mohl spustit mimoděk jako vedlejší
  // efekt jiné práce, není mezi rozpracovanou změnou a produkcí nic.
  const path = join(ROOT, ".claude/skills/commit/SKILL.md");
  const before = readFileSync(path, "utf8");
  try {
    writeFileSync(path, before.replace(/^disable-model-invocation:.*$/m, ""));
    const errors = validate(ROOT);
    assert.ok(errors.some((e) => /^CT9: skill "commit"/.test(e)), JSON.stringify(errors));
  } finally {
    writeFileSync(path, before);
  }
  assert.deepEqual(validate(ROOT), []);
});

test("CT9: schopnost, která jen čte, zámek nepotřebuje", () => {
  // /authorization-check se rozsahu dotýká, ale nic nemění. Kontrola
  // rozsahu se má dít často a sama — brána, která by ji zamykala, by
  // byla překážkou správného chování, ne pojistkou.
  const rec = JSON.parse(readFileSync(join(ROOT, "data/tooling/skill-authorization-check.json"), "utf8"));
  assert.equal(rec.requiresAuthorization, true);
  assert.equal(rec.writes, false);
  assert.ok(!validate(ROOT).some((e) => e.includes("authorization-check")));
});

/* ---- 4) golden paths: každá persona má průchozí cestu ---------------- */

const PERSONAS = [
  "reader", "verifier", "source-contributor", "researcher", "editor",
  "developer", "reviewer", "maintainer", "orchestrator",
];

const catalogRecords = () =>
  readdirSync(join(ROOT, "data/tooling"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(ROOT, "data/tooling", f), "utf8")));

test("každá persona má aspoň jednu schopnost a aspoň jednu cestu", () => {
  const records = catalogRecords();
  for (const persona of PERSONAS) {
    const skills = records.filter((r) => r.kind === "skill" && r.personas?.includes(persona));
    const paths = records.filter((r) => r.kind === "workflow" && r.personas?.includes(persona));
    assert.ok(skills.length > 0, `persona "${persona}" nemá žádný skill`);
    assert.ok(paths.length > 0, `persona "${persona}" nemá žádnou cestu`);
  }
});

test("každá persona má aspoň jednu READ-ONLY schopnost, kterou může začít", () => {
  // Pro začátečníka je výchozí doporučení vždy read-only. Persona, která
  // žádnou nemá, by musela začít zápisem.
  const records = catalogRecords();
  for (const persona of PERSONAS) {
    const safe = records.filter(
      (r) => r.kind === "skill" && r.personas?.includes(persona) && r.riskLevel === "read-only",
    );
    assert.ok(safe.length > 0, `persona "${persona}" nemá bezpečný vstupní bod`);
  }
});

test("každá cesta vede přes schopnosti, které její personu skutečně obsluhují", () => {
  // Cesta pro čtenáře nesmí vést přes skill, který je jen pro údržbáře —
  // to by byl návod, na který uživatel nemá.
  const records = catalogRecords();
  const skillByName = new Map(records.filter((r) => r.kind === "skill").map((r) => [r.name, r]));

  for (const file of readdirSync(join(ROOT, ".claude/workflows")).filter((f) => f.endsWith(".md") && f !== "README.md")) {
    const meta = frontmatterOf(readFileSync(join(ROOT, ".claude/workflows", file), "utf8"));
    const record = records.find((r) => r.kind === "workflow" && r.name === file.replace(/\.md$/, ""));
    assert.ok(record, `${file} nemá katalogový záznam`);

    for (const skillName of (meta.skills ?? "").split(/[,\s]+/).filter(Boolean)) {
      const skill = skillByName.get(skillName);
      assert.ok(skill, `${file} ukazuje na neexistující skill ${skillName}`);
      const shared = skill.personas.some((p) => record.personas.includes(p));
      assert.ok(shared, `${file} (${record.personas.join(",")}) používá /${skillName} (${skill.personas.join(",")}), který žádnou z jeho person neobsluhuje`);
    }
  }
});

test("žádná cesta netvrdí, že je read-only, a přitom nevede přes zápis", () => {
  const records = catalogRecords();
  const skillByName = new Map(records.filter((r) => r.kind === "skill").map((r) => [r.name, r]));

  for (const file of readdirSync(join(ROOT, ".claude/workflows")).filter((f) => f.endsWith(".md") && f !== "README.md")) {
    const name = file.replace(/\.md$/, "");
    const record = records.find((r) => r.kind === "workflow" && r.name === name);
    if (record.riskLevel !== "read-only") continue;

    const meta = frontmatterOf(readFileSync(join(ROOT, ".claude/workflows", file), "utf8"));
    for (const skillName of (meta.skills ?? "").split(/[,\s]+/).filter(Boolean)) {
      assert.ok(
        !skillByName.get(skillName)?.writes,
        `cesta ${name} je označená read-only, ale vede přes /${skillName}, který zapisuje`,
      );
    }
  }
});
