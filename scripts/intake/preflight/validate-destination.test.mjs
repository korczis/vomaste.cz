import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDestination } from "./validate-destination.mjs";

test("a single public address is allowed and pinned", () => {
  const result = validateDestination([{ address: "93.184.216.34", family: 4 }]);
  assert.equal(result.allowed, true);
  assert.deepEqual(result.pinnedAddress, { address: "93.184.216.34", family: 4 });
});

test("a single private address is blocked", () => {
  const result = validateDestination([{ address: "10.0.0.1", family: 4 }]);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "private_destination");
});

test("mixed public and private answers are blocked (§7.1)", () => {
  const result = validateDestination([
    { address: "93.184.216.34", family: 4 },
    { address: "10.0.0.1", family: 4 },
  ]);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "mixed_public_private_dns");
});

test("multiple public addresses are all validated and one is deterministically pinned", () => {
  const result = validateDestination([
    { address: "93.184.216.34", family: 4 },
    { address: "192.0.32.10", family: 4 },
  ]);
  assert.equal(result.allowed, true);
  assert.equal(result.pinnedAddress.address, "93.184.216.34");
});

test("a metadata endpoint is always blocked, even alongside a public address", () => {
  const result = validateDestination([
    { address: "93.184.216.34", family: 4 },
    { address: "169.254.169.254", family: 4 },
  ]);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "metadata_endpoint");
});

test("an unclassifiable address is blocked, never assumed public (§1.2)", () => {
  const result = validateDestination([{ address: "not-a-real-ip", family: 4 }]);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "unclassifiable_address");
});

test("empty address list is blocked", () => {
  assert.equal(validateDestination([]).allowed, false);
});

test("testAllowedPrivateAddresses allows only the exact named address, not the whole private range", () => {
  const allowed = validateDestination([{ address: "127.0.0.1", family: 4 }], { testAllowedPrivateAddresses: ["127.0.0.1"] });
  assert.equal(allowed.allowed, true);

  const stillBlocked = validateDestination([{ address: "10.0.0.1", family: 4 }], { testAllowedPrivateAddresses: ["127.0.0.1"] });
  assert.equal(stillBlocked.allowed, false, "a DIFFERENT private address must still be blocked");
});

test("testAllowedPrivateAddresses never overrides the metadata-endpoint block", () => {
  const result = validateDestination([{ address: "169.254.169.254", family: 4 }], { testAllowedPrivateAddresses: ["169.254.169.254"] });
  assert.equal(result.allowed, false, "metadata endpoints are blocked unconditionally");
});

test("classifiedAddresses always reports every input address with its category, even when blocked", () => {
  const result = validateDestination([{ address: "10.0.0.1", family: 4 }]);
  assert.equal(result.classifiedAddresses.length, 1);
  assert.equal(result.classifiedAddresses[0].category, "private");
});
