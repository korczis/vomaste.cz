// Testy jednosouborového režimu `npm run data:validate -- --file <cesta>`
// (T-028 fáze I). Vše nad temp soubory — nic se nezapisuje do repa.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { validateSingleFile } from "./validate.mjs";

const VALID_CLAIM = {
  $schema: "https://vomaste.cz/schemas/canonical/claim.schema.json",
  schemaVersion: 1,
  "@context": "https://vomaste.cz/context/v1.jsonld",
  "@id": "https://vomaste.cz/id/dossiers/example-subject/claims/CLM-01",
  "@type": "vomaste:Claim",
  recordType: "claim",
  identifier: "CLM-01",
  dossier: { "@id": "https://vomaste.cz/id/dossiers/example-subject" },
  text: "Syntetické testovací tvrzení.",
  status: "status-single",
  statusLabel: "1 ZDROJ",
  sources: [{ "@id": "https://vomaste.cz/id/dossiers/example-subject/sources/SRC-01" }],
  subjects: ["example"],
  order: 1,
  content: [{ type: "markdown", value: "Syntetické testovací tělo." }],
};

test("validní záznam projde bez chyb", () => {
  const dir = mkdtempSync(join(tmpdir(), "validate-file-"));
  try {
    const file = join(dir, "clm-01.json");
    writeFileSync(file, JSON.stringify(VALID_CLAIM, null, 2), "utf8");
    assert.deepEqual(validateSingleFile(file), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("chybová hláška nese cestu k souboru (schémová chyba)", () => {
  const dir = mkdtempSync(join(tmpdir(), "validate-file-"));
  try {
    const file = join(dir, "clm-bad.json");
    const bad = { ...VALID_CLAIM, status: "status-neexistuje" };
    writeFileSync(file, JSON.stringify(bad, null, 2), "utf8");
    const errors = validateSingleFile(file);
    assert.ok(errors.length > 0);
    assert.ok(errors.every((e) => e.includes("clm-bad.json")), errors.join("\n"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("neplatný JSON i neexistující soubor hlásí cestu", () => {
  const dir = mkdtempSync(join(tmpdir(), "validate-file-"));
  try {
    const file = join(dir, "broken.json");
    writeFileSync(file, "{ not json", "utf8");
    const errors = validateSingleFile(file);
    assert.equal(errors.length, 1);
    assert.ok(errors[0].includes("broken.json") && errors[0].includes("neplatný JSON"), errors[0]);

    const missing = validateSingleFile(join(dir, "missing.json"));
    assert.ok(missing[0].includes("missing.json") && missing[0].includes("neexistuje"), missing[0]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("neznámý recordType je srozumitelná chyba s cestou", () => {
  const dir = mkdtempSync(join(tmpdir(), "validate-file-"));
  try {
    const file = join(dir, "unknown.json");
    writeFileSync(file, JSON.stringify({ recordType: "banana" }), "utf8");
    const errors = validateSingleFile(file);
    assert.equal(errors.length, 1);
    assert.ok(errors[0].includes("unknown.json") && errors[0].includes("recordType"), errors[0]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
