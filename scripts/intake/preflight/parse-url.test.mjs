import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAndPolicyCheckUrl } from "./parse-url.mjs";
import { UrlPolicyError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

test("accepts https on the default port", () => {
  const result = parseAndPolicyCheckUrl("https://example.cz/a");
  assert.equal(result.protocol, "https:");
  assert.equal(result.port, 443);
  assert.equal(result.insecureTransport, false);
});

test("accepts http but flags it as insecure transport", () => {
  const result = parseAndPolicyCheckUrl("http://example.cz/a");
  assert.equal(result.insecureTransport, true);
});

for (const protocol of ["file:", "ftp:", "data:", "javascript:", "ws:", "gopher:"]) {
  test(`rejects disallowed protocol: ${protocol}`, () => {
    assert.throws(() => parseAndPolicyCheckUrl(`${protocol}//example.cz/x`), (err) => err instanceof UrlPolicyError && err.code === PREFLIGHT_ERROR_CODES.UNSUPPORTED_PROTOCOL);
  });
}

test("rejects credentials in the URL", () => {
  assert.throws(() => parseAndPolicyCheckUrl("https://user:pass@example.cz/"), (err) => err.code === PREFLIGHT_ERROR_CODES.CONTAINS_CREDENTIALS);
});

test("rejects a nonstandard port by default", () => {
  assert.throws(() => parseAndPolicyCheckUrl("https://example.cz:8443/"), (err) => err.code === PREFLIGHT_ERROR_CODES.NONSTANDARD_PORT);
});

test("a test-only extra allowed port is accepted only when explicitly passed", () => {
  assert.throws(() => parseAndPolicyCheckUrl("http://example.cz:9999/"));
  const result = parseAndPolicyCheckUrl("http://example.cz:9999/", { testExtraAllowedPorts: [9999] });
  assert.equal(result.port, 9999);
});

test("strips the fragment from the request URL but records that one was present", () => {
  const result = parseAndPolicyCheckUrl("https://example.cz/a#section-2");
  assert.equal(result.hadFragment, true);
  assert.equal(result.requestUrl.includes("#"), false);
});

test("no fragment present is recorded as such", () => {
  assert.equal(parseAndPolicyCheckUrl("https://example.cz/a").hadFragment, false);
});

test("an IPv6-literal hostname is exposed without brackets in hostnameForDns", () => {
  const result = parseAndPolicyCheckUrl("http://[::1]/x", { testExtraAllowedPorts: [] });
  assert.equal(result.hostname, "[::1]");
  assert.equal(result.hostnameForDns, "::1");
});

test("throws on completely unparseable input", () => {
  assert.throws(() => parseAndPolicyCheckUrl("not a url at all"));
});

test("alternative IPv4 hostname representations are canonicalized by the URL parser itself", () => {
  assert.equal(parseAndPolicyCheckUrl("http://2130706433/x").hostname, "127.0.0.1");
  assert.equal(parseAndPolicyCheckUrl("http://0x7f000001/x").hostname, "127.0.0.1");
});
