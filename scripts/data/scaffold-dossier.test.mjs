// Testy scaffoldu kanonického dossier balíčku (T-028 fáze I).
//
// Vše běží nad TEMP adresářem se syntetickou autorizací — žádný test
// nesahá na reálné data/dossiers/** ani data/authorizations.toml.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { scaffoldDossier, loadAuthorizationRecords, REGISTRY_DIRS } from "./scaffold-dossier.mjs";
import { validateShapeTree } from "./validate-shape.mjs";
import { loadCanonicalDataset, validateCanonicalDataset } from "./lib/dataset.mjs";

const AUTH_ID = "AUTH-0000-00-00-TEST";
const SYNTHETIC_AUTH = `# Syntetická testovací transkripce — žádná reálná osoba.

[[authorizations]]
id = "${AUTH_ID}"
authorized_at = "2026-01-01"
subjects = ["example"]
agents_md_section = "Synthetic test record"
scope_summary = "Syntetický testovací záznam."
`;

function makeTmp() {
  const dir = mkdtempSync(join(tmpdir(), "scaffold-dossier-"));
  const authorizationsPath = join(dir, "authorizations.toml");
  writeFileSync(authorizationsPath, SYNTHETIC_AUTH, "utf8");
  const root = join(dir, "dossiers");
  return { dir, root, authorizationsPath };
}

const baseArgs = (t) => ({
  slug: "example-subject",
  title: "Example Subject",
  subject: "example",
  authorizationRecordId: AUTH_ID,
  root: t.root,
  authorizationsPath: t.authorizationsPath,
  today: "2026-01-02",
});

test("loadAuthorizationRecords čte id i subjects", () => {
  const t = makeTmp();
  try {
    const records = loadAuthorizationRecords(t.authorizationsPath);
    assert.deepEqual(records.get(AUTH_ID)?.subjects, ["example"]);
  } finally {
    rmSync(t.dir, { recursive: true, force: true });
  }
});

test("BLOCKED — neexistující autorizační záznam nic nezapíše", () => {
  const t = makeTmp();
  try {
    assert.throws(
      () => scaffoldDossier({ ...baseArgs(t), authorizationRecordId: "AUTH-9999-99-99-NOPE" }),
      /BLOCKED.*neexistuje/s,
    );
    assert.ok(!existsSync(join(t.root, "example-subject")), "brána nesmí zapsat ani bajt");
  } finally {
    rmSync(t.dir, { recursive: true, force: true });
  }
});

test("BLOCKED — záznam existuje, ale neautorizuje daný subjekt", () => {
  const t = makeTmp();
  try {
    assert.throws(
      () => scaffoldDossier({ ...baseArgs(t), subject: "someone-else" }),
      /BLOCKED.*neautorizuje subjekt "someone-else"/s,
    );
    assert.ok(!existsSync(join(t.root, "example-subject")));
  } finally {
    rmSync(t.dir, { recursive: true, force: true });
  }
});

test("existující balíček se nikdy nepřepisuje", () => {
  const t = makeTmp();
  try {
    scaffoldDossier(baseArgs(t));
    assert.throws(() => scaffoldDossier(baseArgs(t)), /nikdy nepřepisuji/);
  } finally {
    rmSync(t.dir, { recursive: true, force: true });
  }
});

test("e2e: vytvořený balíček projde stejnou validací jako npm run data:validate", async () => {
  const t = makeTmp();
  try {
    const { dir, dossierFile, registryDirs } = scaffoldDossier(baseArgs(t));
    assert.ok(existsSync(dossierFile));
    assert.equal(registryDirs.length, REGISTRY_DIRS.length);
    for (const rdir of registryDirs) assert.ok(existsSync(rdir), `chybí registry adresář ${rdir}`);
    assert.ok(dir.startsWith(t.root));

    // 1) tvar — validate-shape.mjs nad temp stromem
    const shape = validateShapeTree(t.root);
    assert.deepEqual(shape.errors, [], shape.errors.join("\n"));
    assert.equal(shape.records, 1);

    // 2) reference + sémantika + JSON-LD — stejné validátory jako
    //    check.mjs --validate-only, se syntetickou autorizací injektovanou
    //    přesně tak, jak to dělají testy validate-semantics.
    const model = await loadCanonicalDataset(t.root);
    const { errors } = await validateCanonicalDataset(model, {
      authorizations: new Set([AUTH_ID]),
      baseline: [],
    });
    assert.deepEqual(errors, [], errors.join("\n"));
  } finally {
    rmSync(t.dir, { recursive: true, force: true });
  }
});

test("e2e: proti reálnému data/authorizations.toml projde autorizační sémantika i bez injektáže", async () => {
  // Stejný balíček, ale sémantika si autorizace načte z authorizationsPath —
  // ověřuje, že formát, který scaffold vyžaduje, je i formát, který
  // validate-semantics skutečně čte.
  const t = makeTmp();
  try {
    scaffoldDossier(baseArgs(t));
    const model = await loadCanonicalDataset(t.root);
    const { errors } = await validateCanonicalDataset(model, {
      authorizationsPath: t.authorizationsPath,
      baseline: [],
    });
    assert.deepEqual(errors, [], errors.join("\n"));
  } finally {
    rmSync(t.dir, { recursive: true, force: true });
  }
});
