import { test } from "node:test";
import assert from "node:assert/strict";
import { previousIntakeStatusFromLabels, shouldPingOwner, buildOwnerPingLine } from "./determine-notification.mjs";

test("previousIntakeStatusFromLabels: no intake:* label present → null (no prior state)", () => {
  assert.equal(previousIntakeStatusFromLabels(["good-first-issue"]), null);
});

test("previousIntakeStatusFromLabels: reads the single present intake:* label", () => {
  assert.equal(previousIntakeStatusFromLabels(["authorization:pending-owner", "intake:needs-information", "publication:blocked"]), "needs_information");
});

test("first valid processing (no prior label, lands in triage) → ping", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: null, newIntakeStatus: "triage" }), true);
});

test("first valid processing landing directly in security_review_required → ping", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: null, newIntakeStatus: "security_review_required" }), true);
});

test("first valid processing landing in needs_information → no ping (not an owner-actionable state, §12.2)", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: null, newIntakeStatus: "needs_information" }), false);
});

test("needs_information → triage transition → ping", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: "needs_information", newIntakeStatus: "triage" }), true);
});

test("triage → security_review_required transition → ping", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: "triage", newIntakeStatus: "security_review_required" }), true);
});

test("an ordinary edit that keeps the same triage status → no repeated ping (§12.3 anti-spam)", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: "triage", newIntakeStatus: "triage" }), false);
});

test("a rerun that stays in security_review_required → no repeated ping", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: "security_review_required", newIntakeStatus: "security_review_required" }), false);
});

test("possible_duplicate → needs_information transition → no ping (needs_information itself is never ping-worthy)", () => {
  assert.equal(shouldPingOwner({ previousIntakeStatus: "possible_duplicate", newIntakeStatus: "needs_information" }), false);
});

test("buildOwnerPingLine: produces a live @mention of exactly the configured owner", () => {
  assert.equal(buildOwnerPingLine("korczis"), "@korczis — tento podnět čeká na vaše posouzení.");
});

test("buildOwnerPingLine: returns null (never a broken mention) when no owner is configured", () => {
  assert.equal(buildOwnerPingLine(null), null);
  assert.equal(buildOwnerPingLine(undefined), null);
});
