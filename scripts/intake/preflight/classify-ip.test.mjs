import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyIpAddress, parseIPv4Loose, formatIPv4 } from "./classify-ip.mjs";

// §20 IPv4 SSRF test matrix — every one of the mission's own listed cases.
const IPV4_BLOCKED_CASES = [
  ["127.0.0.1", "loopback"],
  ["127.1", "loopback"],
  ["0.0.0.0", "unspecified"],
  ["10.0.0.1", "private"],
  ["172.16.0.1", "private"],
  ["192.168.1.1", "private"],
  ["169.254.169.254", "metadata"],
  ["100.64.0.1", "shared_address_space"],
  ["2130706433", "loopback"],
  ["0x7f000001", "loopback"],
];
for (const [address, category] of IPV4_BLOCKED_CASES) {
  test(`IPv4 SSRF case blocked: ${address} (${category})`, () => {
    const result = classifyIpAddress(address, 4);
    assert.equal(result.classification, "non_public");
    assert.equal(result.category, category);
  });
}

// §20 IPv6 SSRF test matrix.
const IPV6_BLOCKED_CASES = [
  ["::1", "loopback"],
  ["::", "unspecified"],
  ["fc00::1", "private"],
  ["fe80::1", "link_local"],
  ["::ffff:127.0.0.1", "loopback"],
];
for (const [address, category] of IPV6_BLOCKED_CASES) {
  test(`IPv6 SSRF case blocked: ${address} (${category})`, () => {
    const result = classifyIpAddress(address, 6);
    assert.equal(result.classification, "non_public");
    assert.equal(result.category, category);
  });
}

test("public IPv4 addresses classify as public", () => {
  for (const address of ["8.8.8.8", "93.184.216.34", "1.1.1.1"]) {
    assert.deepEqual(classifyIpAddress(address, 4), { classification: "public", category: null });
  }
});

test("public IPv6 addresses classify as public", () => {
  assert.deepEqual(classifyIpAddress("2001:4860:4860::8888", 6), { classification: "public", category: null });
});

test("documentation and benchmarking ranges are blocked (not just the obvious private ranges)", () => {
  assert.equal(classifyIpAddress("192.0.2.1", 4).category, "documentation");
  assert.equal(classifyIpAddress("198.51.100.1", 4).category, "documentation");
  assert.equal(classifyIpAddress("203.0.113.1", 4).category, "documentation");
  assert.equal(classifyIpAddress("198.18.0.1", 4).category, "benchmarking");
  assert.equal(classifyIpAddress("192.88.99.1", 4).category, "6to4_relay");
});

test("multicast and broadcast are blocked", () => {
  assert.equal(classifyIpAddress("224.0.0.1", 4).category, "multicast");
  assert.equal(classifyIpAddress("255.255.255.255", 4).category, "broadcast");
});

test("IPv6 metadata endpoint (AWS) is blocked", () => {
  assert.equal(classifyIpAddress("fd00:ec2::254", 6).category, "metadata");
});

test("IPv6 documentation/discard/orchid ranges are blocked", () => {
  assert.equal(classifyIpAddress("2001:db8::1", 6).category, "documentation");
  assert.equal(classifyIpAddress("100::1", 6).category, "discard_only");
});

test("an unparseable address returns null — callers MUST treat this as BLOCK (§1.2)", () => {
  assert.equal(classifyIpAddress("not-an-ip", 4), null);
  assert.equal(classifyIpAddress("999.999.999.999", 4), null);
  assert.equal(classifyIpAddress("gggg::1", 6), null);
  assert.equal(classifyIpAddress("1.2.3.4.5.6", 4), null);
});

test("a 3-part inet_aton form (a.b.c meaning a.b.0.c) parses per historical semantics, not rejected", () => {
  // §6.4's own alternative-representation requirement — "1.2.3" is valid
  // legacy inet_aton syntax for 1.2.0.3, not garbage input.
  assert.equal(formatIPv4(parseIPv4Loose("1.2.3")), "1.2.0.3");
});

test("alternative IPv4 representations round-trip through parseIPv4Loose/formatIPv4 to the same canonical address", () => {
  const canonical = "127.0.0.1";
  for (const alt of ["127.1", "2130706433", "0x7f000001", "0177.0.0.1"]) {
    assert.equal(formatIPv4(parseIPv4Loose(alt)), canonical, alt);
  }
});

test("classification is deterministic across repeated calls", () => {
  const a = classifyIpAddress("10.0.0.1", 4);
  const b = classifyIpAddress("10.0.0.1", 4);
  assert.deepEqual(a, b);
});
