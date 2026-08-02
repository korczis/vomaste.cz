import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyHostname } from "./classify-hostname.mjs";

test("accepts an ordinary public-looking hostname", () => {
  assert.equal(classifyHostname("example.cz").ok, true);
});

test("rejects an empty hostname", () => {
  assert.equal(classifyHostname("").ok, false);
});

test("rejects control characters or whitespace in a hostname", () => {
  assert.equal(classifyHostname("exa\tmple.cz").ok, false);
  assert.equal(classifyHostname("exa mple.cz").ok, false);
});

test("rejects a single-label hostname", () => {
  const result = classifyHostname("localhost");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "single_label_hostname");
});

for (const host of ["a.local", "a.localhost", "metadata.google.internal", "a.home", "a.lan", "a.test", "a.invalid", "a.example"]) {
  test(`rejects blocked suffix: ${host}`, () => {
    const result = classifyHostname(host);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "blocked_hostname_suffix");
  });
}

test("a test-only allowed suffix is accepted only when explicitly passed", () => {
  assert.equal(classifyHostname("mock.example").ok, false);
  assert.equal(classifyHostname("mock.example", { testAllowedSuffixes: [".example"] }).ok, true);
});

test("rejects an over-length hostname", () => {
  const longHost = `${"a".repeat(250)}.cz`;
  assert.equal(classifyHostname(longHost).ok, false);
});

test("rejects an over-length label", () => {
  const host = `${"a".repeat(64)}.cz`;
  assert.equal(classifyHostname(host).ok, false);
});

test("an IPv4-literal hostname routes directly to IP classification, skipping suffix/single-label checks", () => {
  const result = classifyHostname("127.0.0.1");
  assert.equal(result.ok, true);
  assert.equal(result.isIpLiteral, true);
  assert.equal(result.classification.classification, "non_public");
});

test("an IPv6-literal hostname (bracket-stripped) routes directly to IP classification", () => {
  const result = classifyHostname("::1");
  assert.equal(result.ok, true);
  assert.equal(result.isIpLiteral, true);
  assert.equal(result.family, 6);
});

test("a public IP literal is accepted as an IP literal, not rejected", () => {
  const result = classifyHostname("93.184.216.34");
  assert.equal(result.ok, true);
  assert.equal(result.classification.classification, "public");
});
