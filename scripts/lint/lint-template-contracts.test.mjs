#!/usr/bin/env node
// Testy kontraktu komponent. Kontrola, která nikdy nic neodmítne, je
// vynucení bez krytí — u téhle to platí dvojnásob, protože vznikla
// jako reakce na dvě chyby, které žádná z 47 bran nezachytila.
//
// Usage: node --test scripts/lint/lint-template-contracts.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bareSafeIdentifiers, guardBody, guards, lint, paramNames, parseComponents, siblingBranches } from "./lint-template-contracts.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const withTemplate = (rel, content, fn) => {
  const abs = join(ROOT, rel);
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

test("skutečné šablony kontraktem projdou", () => {
  assert.deepEqual(lint(ROOT), []);
});

test("TC1 chytí přesně tu chybu, co ujela u calloutu", () => {
  // Historická podoba: parametr se přejmenoval na `text`, tělo dál
  // vypisovalo `body`, a `| safe` chybu spolklo. 98 stránek vyšlo
  // s prázdným rámečkem a build byl zelený.
  const errors = withTemplate(
    "templates/macros/__probe.html",
    '{% component probe_callout(kind, text="") -%}\n<div>{{ body | safe }}</div>\n{%- endcomponent %}\n',
    () => lint(ROOT),
  );
  assert.ok(errors.some((e) => /^TC1 .*probe_callout.*body \| safe/.test(e)), JSON.stringify(errors));
});

test("TC1 nehlásí `| safe` na deklarovaném parametru", () => {
  const errors = withTemplate(
    "templates/macros/__probe.html",
    '{% component probe_ok(text="") -%}\n<div>{{ text | safe }}</div>\n{%- endcomponent %}\n',
    () => lint(ROOT),
  );
  assert.ok(!errors.some((e) => e.startsWith("TC1")), JSON.stringify(errors));
});

test("TC2 chytí deklarovaný a nepřečtený parametr", () => {
  const errors = withTemplate(
    "templates/macros/__probe.html",
    '{% component probe_unused(page, zbytecny) -%}\n<div>{{ page.title }}</div>\n{%- endcomponent %}\n',
    () => lint(ROOT),
  );
  assert.ok(errors.some((e) => /^TC2 .*"zbytecny"/.test(e)), JSON.stringify(errors));
});

test("TC3 chytí guard na jiné pole, než se renderuje", () => {
  const errors = withTemplate(
    "templates/__probe.html",
    "{% if v.provenance.discoveredVia %}\n<p>{{ v.provenanceResolved.discoveredVia }}</p>\n{% endif %}\n",
    () => lint(ROOT),
  );
  assert.ok(errors.some((e) => /^TC3 .*provenanceResolved/.test(e)), JSON.stringify(errors));
});

test("TC3 nehlásí podmíněný atribut ani jiný obsah pod příznakem", () => {
  // Dva legitimní vzory, které první verze kontroly hlásila — 29
  // falešných poplachů na 31 nálezů. Kontrola, která takhle křičí,
  // se vypne a pak nehlídá nic.
  const errors = withTemplate(
    "templates/__probe.html",
    '{% if searchable %}class="x"{% endif %}\n' +
      "{% if section.extra.show_paths %}<p>{{ section.pages }}</p>{% endif %}\n",
    () => lint(ROOT),
  );
  assert.ok(!errors.some((e) => e.startsWith("TC3")), JSON.stringify(errors));
});

test("guardBody počítá vnořené podmínky", () => {
  // Bez tohohle se tělo uřízne na vnitřním endif a kontrola ohlásí, že
  // vnější guard svou hodnotu nečte, přestože ji čte o řádek níž.
  const text = "{% if s.claims %}A{% if s.family %}B{% endif %}{{ s.claims }}{% endif %}";
  const body = guardBody(text, text.indexOf("A"));
  assert.ok(body.includes("s.claims"), body);
  assert.deepEqual(guards(text).filter((g) => g.condition === "s.claims").length, 1);
});

test("paramNames zvládne default s čárkou uvnitř", () => {
  assert.deepEqual(paramNames('a, b="x, y", c: integer = -1'), ["a", "b", "c"]);
});

test("parseComponents najde jméno, parametry i tělo", () => {
  const [c] = parseComponents('{% component x(a, b="") -%}TĚLO{%- endcomponent %}');
  assert.equal(c.name, "x");
  assert.deepEqual(c.params, ["a", "b"]);
  assert.ok(c.body.includes("TĚLO"));
});

test("siblingBranches hlásí jen rozvětvenou verzi téhož pole", () => {
  assert.deepEqual(
    siblingBranches("{{ v.provenanceResolved.claims }}", "v.provenance.claimRefs"),
    ["v.provenanceResolved.claims"],
  );
  assert.deepEqual(siblingBranches("{{ s.pages }}", "s.extra.show_paths"), []);
});

test("bareSafeIdentifiers ignoruje výrazy s filtrem", () => {
  assert.deepEqual(bareSafeIdentifiers("{{ x | safe }}"), ["x"]);
  assert.deepEqual(bareSafeIdentifiers("{{ x | markdown | safe }}"), []);
  assert.deepEqual(bareSafeIdentifiers("{{ a.b | safe }}"), []);
});
