// Preflight musí odvozovat seznam ze šablon, ne z ručního výčtu.
//
// Kdyby byl výčet ruční, nový load_data by z kontroly tiše vypadl
// a preflight by tvrdil „vše v pořádku" u stromu, se kterým zola spadne —
// tedy přesně to selhání, kvůli kterému preflight vznikl.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MODES } from "./pipeline.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

function zeSablon() {
  const out = new Set();
  const stack = [join(ROOT, "templates")];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name.endsWith(".html")) {
        for (const m of readFileSync(p, "utf8").matchAll(/load_data\(path="(data\/generated\/[^"]+)"/g)) out.add(m[1]);
      }
    }
  }
  return [...out];
}

test("skript nemá zadrátovaný seznam souborů", () => {
  const src = readFileSync(join(ROOT, "scripts/build/require-generated.mjs"), "utf8");
  const telo = src.replace(/^[\s\S]*?^const ROOT/m, "");
  assert.ok(!/navigation-flat\.json/.test(telo), "seznam je zadrátovaný — nový load_data by z kontroly vypadl");
});

test("šablony skutečně nějaké generované vstupy čtou", () => {
  // Pojistka proti tichému vyprázdnění: kdyby se změnil zápis load_data,
  // preflight by nekontroloval nic a tvářil se zeleně.
  assert.ok(zeSablon().length >= 3, "ze šablon se nevyčetl žádný generovaný vstup");
});

test("všechny nalezené vstupy jsou v .gitignore", () => {
  // Kdyby některý byl verzovaný, preflight by na něj zbytečně upozorňoval.
  const ignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
  assert.match(ignore, /data\/generated/, "data/generated není v .gitignore — preflight řeší neexistující problém");
});

test("hook po pullu existuje a je spustitelný", () => {
  const p = join(ROOT, ".githooks/post-merge");
  assert.ok(existsSync(p), "chybí .githooks/post-merge");
  assert.match(readFileSync(p, "utf8"), /require-generated/, "hook nevolá preflight");
});

test("generate:all pokrývá všechny generátory z dev pipeline", () => {
  // Seznam jsem nejdřív sestavil ručně a VYNECHAL data:metrics, takže
  // `npm run serve` skončil na chybějícím navigation-metrics.json —
  // tedy přesně na tom selhání, které měl preflight řešit.
  //
  // generate:all se proto odvozuje z jednotné dev pipeline (všechny
  // generátory kromě validátorů, offline bran a serveru). Tenhle test hlídá,
  // že se ty dva seznamy nerozejdou, až někdo přidá nový generátor jen do dev.
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const ocekavane = MODES.dev
    .filter((step) => typeof step === "string")
    .filter((step) => !step.startsWith("validate:") && step !== "data:validate" && step !== "archive:check")
    .map((step) => `npm run ${step}`);
  const maji = pkg.scripts["generate:all"].split("&&").map((x) => x.trim());

  const chybi = ocekavane.filter((k) => !maji.includes(k));
  assert.deepEqual(chybi, [], `generate:all nepokrývá: ${chybi.join(", ")}`);
  assert.ok(!/zola/.test(pkg.scripts["generate:all"]), "generate:all nesmí spouštět zolu");
  assert.ok(ocekavane.length >= 8, "z dev pipeline se nevyčetly generátory — parser je rozbitý");
});
