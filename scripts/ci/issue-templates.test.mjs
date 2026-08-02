#!/usr/bin/env node
// Regresní stráž nad .github/ISSUE_TEMPLATE/** (audit T-042, GitHub
// CRITICAL nález: blank issues + obsahový formulář bez varování a
// checkboxu = nejsnazší cesta, jak citlivý podnět skončí trvale veřejně).
//
// Hlídá:
//   1. blank_issues_enabled je false a zůstane false,
//   2. contact_links nikdy neslibují důvěrnost/anonymitu a security
//      kanál není nabízen jako intake pro citlivé dossier podněty
//      (PHASE_005 §17.2),
//   3. každý obsahový formulář (návrh dossieru, oprava faktu, reakce
//      subjektu) nese varování o veřejnosti issue + POVINNÝ potvrzovací
//      checkbox,
//   4. YAML všech šablon je syntakticky validní. Repo nemá JS/py YAML
//      parser (a kvůli jedné stráži se nepřidává závislost) — použije se
//      systémový ruby -ryaml, je-li k dispozici; jinak se syntaktická
//      část přeskočí a strukturální kontroly (string-level) běží vždy.
//
// Usage: node --test scripts/ci/issue-templates.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, ".github", "ISSUE_TEMPLATE");

const read = (f) => readFileSync(path.join(DIR, f), "utf8");
const CONTENT_FORMS = ["navrh-dossieru.yml", "oprava-faktu.yml", "reakce-subjektu.yml"];

test("blank issues are disabled (fail-closed intake channel)", () => {
  const cfg = read("config.yml");
  assert.match(cfg, /^blank_issues_enabled:\s*false\s*$/m, "config.yml musí mít blank_issues_enabled: false");
});

test("contact links never promise confidentiality and honestly state there is no confidential channel", () => {
  const cfg = read("config.yml");
  assert.match(cfg, /NEMÁ důvěrný intake kanál/, "poctivé přiznání absence důvěrného kanálu musí zůstat");
  // security kanál nesmí být nabízen jako intake pro citlivé dossier podněty (PHASE_005 §17.2)
  assert.match(cfg, /NENÍ určen pro citlivé podněty/, "security link musí explicitně vyloučit citlivé dossier podněty");
  for (const forbidden of [/anonymn/i, /zaručujeme/i, /důvěrně vám/i]) {
    assert.doesNotMatch(cfg, forbidden, `config.yml nesmí slibovat důvěrnost/anonymitu (${forbidden})`);
  }
});

for (const form of CONTENT_FORMS) {
  test(`${form}: carries a publicness warning and a required confirmation checkbox`, () => {
    const text = read(form);
    assert.match(text, /veřejná/, `${form}: chybí varování o veřejnosti issue`);
    assert.match(text, /type:\s*checkboxes/, `${form}: chybí checkboxes sekce`);
    assert.match(text, /required:\s*true/, `${form}: potvrzovací checkbox musí být povinný`);
  });
}

test("navrh-dossieru.yml: warning is the FIRST body block and states no dossier/authorization arises", () => {
  const text = read("navrh-dossieru.yml");
  const bodyIdx = text.indexOf("body:");
  const warnIdx = text.indexOf("veřejná a dlouhodobě dohledatelná");
  assert.ok(warnIdx > bodyIdx && bodyIdx !== -1, "varování musí existovat uvnitř body");
  const firstField = text.search(/- type: (input|textarea|dropdown|checkboxes)/);
  assert.ok(warnIdx < firstField, "varování musí předcházet prvnímu vstupnímu poli");
  assert.match(text, /nevzniká dossier ani autorizace/);
  assert.match(text, /identitu oznamovatele/);
});

test("all issue template YAML files are syntactically valid (ruby -ryaml, skipped if unavailable)", (t) => {
  const probe = spawnSync("ruby", ["-ryaml", "-e", "true"], { stdio: "ignore" });
  if (probe.error || probe.status !== 0) {
    t.skip("ruby s YAML není k dispozici — syntaktická kontrola přeskočena (strukturální kontroly proběhly)");
    return;
  }
  for (const f of readdirSync(DIR).filter((f) => f.endsWith(".yml"))) {
    execFileSync("ruby", ["-ryaml", "-e", "YAML.safe_load(File.read(ARGV[0]))", path.join(DIR, f)], {
      stdio: "pipe",
    });
  }
});
