#!/usr/bin/env node
// Testy orientačního SessionStart hooku. Není blokující, ale běží při
// každém startu — takže se testuje dvojí: že říká to podstatné, a že
// při čemkoli neočekávaném mlčí místo aby zdržel.
//
// Usage: node --test scripts/hooks/session-orientation.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { orientation } from "./session-orientation.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOOK = join(ROOT, "scripts/hooks/session-orientation.mjs");

test("na master upozorní, že commit nasazuje", () => {
  const out = orientation(ROOT, { branch: "master", dirty: "", deps: true, generated: true });
  assert.match(out, /POZOR/);
  assert.match(out, /deploy/);
});

test("na task větvi to varování nedává", () => {
  const out = orientation(ROOT, { branch: "task/T-091", dirty: "", deps: true, generated: true });
  assert.ok(!out.includes("POZOR"), "varování o deployi patří jen na master");
});

test("chybějící prerekvizity pošlou na /diagnose, ne na /bootstrap", () => {
  const out = orientation(ROOT, { branch: "task/T-1", dirty: "", deps: false, generated: false });
  assert.match(out, /node_modules/);
  assert.match(out, /generate:all/);
  assert.match(out, /\/diagnose/);
  assert.ok(!out.includes("/bootstrap"), "s rozbitým prostředím nemá smysl bootstrapovat");
});

test("se zdravým prostředím pošle na /bootstrap", () => {
  const out = orientation(ROOT, { branch: "task/T-1", dirty: "", deps: true, generated: true });
  assert.match(out, /\/bootstrap/);
  assert.ok(!out.includes("Chybí:"));
});

test("počítá změněné soubory, prázdný strom hlásí jako čistý", () => {
  assert.match(orientation(ROOT, { branch: "x", dirty: " M a\n M b", deps: true, generated: true }), /2 změněných/);
  assert.match(orientation(ROOT, { branch: "x", dirty: "", deps: true, generated: true }), /čistý strom/);
});

test("mimo git repozitář mlčí", () => {
  assert.equal(orientation(ROOT, { branch: null }), null);
});

test("je krátký — běží při každém startu", () => {
  const out = orientation(ROOT, { branch: "master", dirty: " M a", deps: false, generated: false });
  assert.ok(out.split("\n").length <= 5, `orientace má být do pěti řádků, má ${out.split("\n").length}`);
});

test("běží jako proces, nikdy nekončí chybou", () => {
  const res = spawnSync(process.execPath, [HOOK], { encoding: "utf8", env: { ...process.env, CLAUDE_PROJECT_DIR: ROOT } });
  assert.equal(res.status, 0);
});

test("nespadne ani s nesmyslným kořenem", () => {
  const res = spawnSync(process.execPath, [HOOK], {
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: "/nonexistent/path/xyz" },
  });
  assert.equal(res.status, 0);
});
