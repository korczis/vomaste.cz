import { test } from "node:test";
import assert from "node:assert/strict";
import { detectSensitiveMaterialClaims } from "./detect-sensitive-material-claims.mjs";

test("detects a nonpublic-material claim", () => {
  const flags = detectSensitiveMaterialClaims({ description_text: "Mám interní dokument, který to dokazuje." });
  assert.ok(flags.some((f) => f.code === "contains_nonpublic_material_claim"));
});

test("detects a confidentiality request", () => {
  const flags = detectSensitiveMaterialClaims({ description_text: "Nechci zveřejnit své jméno." });
  assert.ok(flags.some((f) => f.code === "contains_confidentiality_request"));
});

test("false positive: an ordinary public source reference triggers nothing", () => {
  const flags = detectSensitiveMaterialClaims({ description_text: "Zdroj: veřejně dostupný zápis ze zastupitelstva." });
  assert.deepEqual(flags, []);
});

test("nonpublic material claim's effect is security_review_required (§13.4)", () => {
  const flags = detectSensitiveMaterialClaims({ description_text: "Posílám přílohu s tajnou nahrávkou." });
  const flag = flags.find((f) => f.code === "contains_nonpublic_material_claim");
  assert.equal(flag.effect, "security_review_required");
});
