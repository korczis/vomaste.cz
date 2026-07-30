#!/usr/bin/env node
// Regression tests for lint-source-outlets.mjs (coop task T-025). The
// load-bearing behavior is that the two ways a corroboration claim can be
// silently false — the same publisher written two ways, and a claim whose
// sources are all one publisher — actually fail, and that the real dataset
// stays clean.
//
// Usage: node --test scripts/lint/lint-source-outlets.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { outletKey } from "./lint-source-outlets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "lint-source-outlets.mjs");

test("the real dataset has no outlet aliasing", () => {
  const out = execFileSync("node", [SCRIPT], { stdio: "pipe" }).toString();
  assert.match(out, /OK — no outlet aliasing/);
});

test("outletKey collapses the spellings that actually occurred in this repo", () => {
  assert.equal(outletKey("ČT24"), outletKey("ČT24 (Česká televize)"));
  assert.equal(outletKey("Echo24"), outletKey("Echo24.cz"));
  assert.equal(outletKey("Blesk"), outletKey("Blesk.cz"));
  assert.equal(outletKey("Deník.cz"), outletKey("Deník.cz (VLTAVA LABE MEDIA)"));
  assert.equal(outletKey("iROZHLAS.cz"), outletKey("iROZHLAS.cz (Český rozhlas)"));
});

test("outletKey keeps genuinely different publishers apart", () => {
  const distinct = ["Seznam Zprávy", "Deník N", "Deník.cz", "FORUM 24", "Echo24", "ČT24", "Reflex"];
  const keys = distinct.map(outletKey);
  assert.equal(new Set(keys).size, distinct.length, `collision among ${JSON.stringify(keys)}`);
});

test("Deník N and Deník.cz are not merged — different publishers, similar names", () => {
  assert.notEqual(outletKey("Deník N"), outletKey("Deník.cz"));
});
