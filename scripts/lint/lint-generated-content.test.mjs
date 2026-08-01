// Testy lintu generovaných content adaptérů (T-028 fáze H, mise §19):
// obálka je vynucená, ne jen slibovaná — ruční pole i chybějící marker
// musí spadnout.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintGeneratedContent } from "./lint-generated-content.mjs";

const GOOD_STUB = `+++
# GENERATED FILE. DO NOT EDIT.
title = "CLM-01"
description = "Testovací tvrzení."
template = "dossier-claim.html"
weight = 1

[extra]
generated = true
record_id = "https://vomaste.cz/id/dossiers/x/claims/CLM-01"
view_model = "generated/views/dossiers/x/claims/clm-01.json"
dossier = "x"
record_type = "claim"
lang = "cs"
clm_id = "CLM-01"
+++
Tělo.
`;

function freshRoot() {
  const root = mkdtempSync(join(tmpdir(), "lint-gen-"));
  mkdirSync(join(root, "content/dossiers/x/claims"), { recursive: true });
  mkdirSync(join(root, "content/entities"), { recursive: true });
  return root;
}

test("čistý minimální stub projde", () => {
  const root = freshRoot();
  writeFileSync(join(root, "content/dossiers/x/claims/clm-01.md"), GOOD_STUB);
  const { errors, checked } = lintGeneratedContent(root);
  assert.deepEqual(errors, []);
  assert.equal(checked, 1);
});

test("chybějící generated = true je chyba (ručně vytvořená stránka)", () => {
  const root = freshRoot();
  writeFileSync(join(root, "content/dossiers/x/claims/clm-01.md"), GOOD_STUB.replace("generated = true\n", ""));
  const { errors } = lintGeneratedContent(root);
  assert.ok(errors.some((e) => e.includes("generated = true")), errors.join("\n"));
});

test("doménové pole mimo obálku je chyba (top i extra)", () => {
  const root = freshRoot();
  writeFileSync(
    join(root, "content/dossiers/x/claims/clm-01.md"),
    GOOD_STUB.replace("clm_id = \"CLM-01\"\n", "clm_id = \"CLM-01\"\nstatus = \"status-single\"\nsources = [\"SRC-01\"]\n"),
  );
  const { errors } = lintGeneratedContent(root);
  assert.ok(errors.some((e) => e.includes('"status"')), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes('"sources"')));

  writeFileSync(
    join(root, "content/entities/foo.md"),
    GOOD_STUB.replace('title = "CLM-01"', 'title = "Foo"\ncustom_top = "x"'),
  );
  const { errors: e2 } = lintGeneratedContent(root);
  assert.ok(e2.some((e) => e.includes('"custom_top"')));
});

test("doménové pod-sekce [extra.*] jsou chyba", () => {
  const root = freshRoot();
  writeFileSync(
    join(root, "content/dossiers/x/_index.md"),
    GOOD_STUB.replace("+++\nTělo.", "\n[extra.authorization]\nauthorized = true\n+++\nTělo."),
  );
  const { errors } = lintGeneratedContent(root);
  assert.ok(errors.some((e) => e.includes("[extra.*]")), errors.join("\n"));
});

test("chybějící view_model je chyba", () => {
  const root = freshRoot();
  writeFileSync(
    join(root, "content/dossiers/x/claims/clm-01.md"),
    GOOD_STUB.replace(/^view_model = .*\n/m, ""),
  );
  const { errors } = lintGeneratedContent(root);
  assert.ok(errors.some((e) => e.includes("extra.view_model")), errors.join("\n"));
});

test("výjimky mimo scope se nelintují (kořenové indexy, aux, koncepty)", () => {
  const root = freshRoot();
  mkdirSync(join(root, "content/koncepty"), { recursive: true });
  mkdirSync(join(root, "content/dossiers/x/evidence"), { recursive: true });
  writeFileSync(join(root, "content/entities/_index.md"), "+++\ntitle = \"Registr\"\nvlastni_pole = 1\n+++\n");
  writeFileSync(join(root, "content/dossiers/_index.md"), "+++\ntitle = \"Dossiery\"\n+++\n");
  writeFileSync(join(root, "content/koncepty/foo.md"), "+++\ntitle = \"Koncept\"\n[extra]\nbullets = []\n+++\n");
  writeFileSync(join(root, "content/dossiers/x/evidence/_index.md"), "+++\ntitle = \"Evidence\"\n[extra]\ndossier_title = \"X\"\n+++\n");
  const { errors, checked } = lintGeneratedContent(root);
  assert.deepEqual(errors, []);
  assert.equal(checked, 0);
});
