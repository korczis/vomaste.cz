#!/usr/bin/env node
// Testy sdíleného formátovače chyb AJV (lib/ajv-format.mjs). Záruka:
// začátek hlášky se nemění (testy a grep na něj spoléhají) a u enum,
// const, pattern/format, type a cizího pole hláška řekne, co opravit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAjvErrors, valueAt } from "./lib/ajv-format.mjs";
import { validateRecordObject } from "./validate-shape.mjs";
import { readFileSync } from "node:fs";

const err = (keyword, instancePath, message, params = {}) => ({ keyword, instancePath, message, params });

test("enum vypíše povolené hodnoty a zadanou hodnotu, začátek hlášky zůstává", () => {
  const [line] = formatAjvErrors("a.json", [err("enum", "/status", "must be equal to one of the allowed values", { allowedValues: ["x", "y"] })], { status: "z" });
  assert.match(line, /^a\.json: \/status must be equal to one of the allowed values/);
  assert.match(line, /povolené hodnoty: "x", "y" \(zadáno: "z"\)$/);
});

test("dlouhý výčet se zkrátí a řekne, kolik zbývá", () => {
  const allowedValues = Array.from({ length: 20 }, (_, i) => `v${i}`);
  const [line] = formatAjvErrors("a.json", [err("enum", "/t", "m", { allowedValues })]);
  assert.match(line, /"v11", … \(\+8\)$/);
});

test("const, pattern, type a cizí pole", () => {
  const data = { recordType: "x", "@id": "spatne", n: "5" };
  const lines = formatAjvErrors("a.json", [
    err("const", "/recordType", "must be equal to constant", { allowedValue: "claim" }),
    err("pattern", "/@id", 'must match pattern "^https"'),
    err("type", "/n", "must be integer"),
    err("additionalProperties", "", "must NOT have additional properties", { additionalProperty: "truthScore" }),
  ], data);
  assert.match(lines[0], /očekávaná hodnota: "claim" \(zadáno: "x"\)/);
  assert.match(lines[1], /\(zadáno: "spatne"\)$/);
  assert.match(lines[2], /\(zadáno: string\)$/);
  assert.match(lines[3], /^a\.json: \(root\) must NOT have additional properties \(cizí pole "truthScore"\)$/);
});

test("bez záznamu se nic nevymýšlí", () => {
  const [line] = formatAjvErrors("a.json", [err("pattern", "/x", "must match")]);
  assert.equal(line, "a.json: /x must match");
});

test("JSON pointer i s escapy ~0 ~1", () => {
  assert.equal(valueAt({ "a/b": { "c~d": 1 } }, "/a~1b/c~0d"), 1);
  assert.equal(valueAt({ a: 1 }, "/neni"), undefined);
});

test("skutečné schéma: neplatný stav tvrzení vypíše všech pět stavů", () => {
  const rec = JSON.parse(readFileSync("data/dossiers/andrej-babis/claims/clm-01.json", "utf8"));
  rec.status = "status-maybe";
  const errors = validateRecordObject(rec, "claims/clm-01.json");
  const line = errors.find((e) => e.includes("/status"));
  for (const s of ["status-corroborated", "status-single", "status-quote", "status-disputed", "status-opinion"]) {
    assert.ok(line.includes(`"${s}"`), line);
  }
  assert.ok(line.includes('(zadáno: "status-maybe")'), line);
});
