import test from "node:test";
import assert from "node:assert/strict";
import { isFreeLicence } from "./lib/licences.mjs";

/*
 * This list decides what may legally be republished here, so the test states
 * both halves explicitly: what passes, and — more importantly — what must keep
 * failing. A licence quietly slipping into the allowlist is the failure mode
 * worth guarding against.
 */

test("volné licence projdou", () => {
  for (const licence of [
    "CC0",
    "CC0 1.0",
    "Public domain",
    "PD-textlogo",
    "PD",
    "CC BY 3.0",
    "CC BY-SA 4.0",
    "cc by-sa 2.5",
    "Attribution",
    "Government Open Data Licence",
    "Open Government Licence",
  ]) {
    assert.equal(isFreeLicence(licence), true, `mělo projít: ${licence}`);
  }
});

test("nevolné a neznámé licence neprojdou", () => {
  for (const licence of [
    "Fair use",
    "fair use rationale",
    "Non-free logo",
    "All rights reserved",
    "©",
    "© ČTK",
    "Copyrighted",
    "CC BY-NC 4.0",
    "CC BY-ND 4.0",
    "GFDL only",
    "",
    "   ",
    null,
    undefined,
  ]) {
    assert.equal(isFreeLicence(licence), false, `nemělo projít: ${JSON.stringify(licence)}`);
  }
});

test("prefix se nedá obejít připojeným textem před názvem", () => {
  // "not CC BY-SA" nesmí projít jen proto, že název licence obsahuje.
  assert.equal(isFreeLicence("not CC BY-SA 4.0"), false);
  assert.equal(isFreeLicence("no public domain claim"), false);
});
