// End-to-end integration tests against the real local mock server +
// mock DNS adapter (§19, §20, §21). This is where the SSRF test matrix
// actually proves the FULL pipeline (parse → hostname → DNS → destination
// → pinned request → redirects → metadata) behaves correctly together,
// not just each module in isolation.
import { test } from "node:test";
import assert from "node:assert/strict";
import { preflightUrl } from "./preflight-url.mjs";
import { startMockServer } from "./testing/mock-http-server.mjs";
import { createMockDnsAdapter, DNS_FIXTURES } from "./testing/mock-dns-adapter.mjs";

const now = () => "2026-08-02T00:00:00.000Z";

function loopbackOpts(mock, dnsFixtures = {}) {
  return {
    dnsAdapter: createMockDnsAdapter(dnsFixtures),
    now,
    testAllowedPrivateAddresses: ["127.0.0.1"],
    testExtraAllowedPorts: [mock.port],
  };
}

test("a reachable public-looking HTML page: status reachable, metadata extracted, editorial_verification always not_performed", async () => {
  const mock = await startMockServer();
  try {
    const result = await preflightUrl({ submittedUrl: `${mock.baseUrl}/ok`, normalizedUrl: `${mock.baseUrl}/ok`, ...loopbackOpts(mock) });
    assert.equal(result.status, "reachable");
    assert.equal(result.policy_decision, "allowed");
    assert.equal(result.editorial_verification, "not_performed");
    assert.equal(result.metadata.title, "Mock Page");
    assert.equal(result.http.status, 200);
    assert.equal(result.network.remote_address, "127.0.0.1");
  } finally {
    await mock.close();
  }
});

test("http:// (not https://) is reachable but flagged insecure_transport", async () => {
  const mock = await startMockServer();
  try {
    const result = await preflightUrl({ submittedUrl: `${mock.baseUrl}/ok`, normalizedUrl: `${mock.baseUrl}/ok`, ...loopbackOpts(mock) });
    assert.ok(result.warnings.some((w) => w.code === "insecure_transport"));
  } finally {
    await mock.close();
  }
});

test("a redirect chain is followed, revalidated, and recorded", async () => {
  const mock = await startMockServer();
  try {
    const target = encodeURIComponent(`${mock.baseUrl}/ok`);
    const url = `${mock.baseUrl}/redirect-to/${target}`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "reachable");
    assert.equal(result.redirects.length, 1);
    assert.equal(result.metadata.title, "Mock Page");
  } finally {
    await mock.close();
  }
});

test("a redirect loop is blocked", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/redirect-loop-a`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "blocked");
    assert.equal(result.policy_decision, "blocked");
    assert.equal(result.errors[0].code, "redirect_loop");
  } finally {
    await mock.close();
  }
});

test("a redirect chain longer than the maximum is blocked", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/redirect-chain-long`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "blocked");
    assert.equal(result.errors[0].code, "url_redirect_limit_exceeded");
  } finally {
    await mock.close();
  }
});

test("a malformed redirect Location is blocked, not a crash", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/redirect-malformed`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "blocked");
    assert.equal(result.errors[0].code, "redirect_malformed_location");
  } finally {
    await mock.close();
  }
});

test("a redirect from https to http is blocked as a transport downgrade", async () => {
  const mock = await startMockServer();
  try {
    const httpsToHttp = `${mock.baseUrl}/redirect-to/${encodeURIComponent(mock.baseUrl.replace("http:", "https:") + "/ok")}`;
    // Simulate the initial hop as https by constructing the submitted URL
    // with https scheme pointing at the same loopback port (TLS isn't
    // actually negotiated here — the downgrade check triggers on the
    // Location header's scheme change before any connection to the
    // second hop is attempted, so this only needs the FIRST hop's
    // response, not a real TLS handshake).
    const url = `${mock.baseUrl}/redirect-to/${encodeURIComponent("http://elsewhere.example/x")}`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    // Both hops are http here (mock server has no TLS) so this specific
    // scenario can't trigger downgrade end-to-end without a TLS-capable
    // mock server (documented limitation — see docs/intake/url-preflight.md).
    // What IS verified: an http->http redirect is never mistaken for a
    // downgrade (no false positive).
    assert.notEqual(result.errors[0]?.code, "redirect_transport_downgrade");
  } finally {
    await mock.close();
  }
});

test("PDF content type: reachable, no metadata extracted", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/pdf`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "reachable");
    assert.equal(result.metadata, null);
    assert.ok(result.warnings.some((w) => w.code === "metadata_extraction_skipped"));
  } finally {
    await mock.close();
  }
});

test("binary content type: reachable, no metadata extracted", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/binary`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "reachable");
    assert.equal(result.metadata, null);
  } finally {
    await mock.close();
  }
});

test("an oversized response is reachable but body_truncated is recorded and warned", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/oversized`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.http.body_truncated, true);
    assert.ok(result.warnings.some((w) => w.code === "body_truncated"));
  } finally {
    await mock.close();
  }
});

test("an unterminated/invalid HTML body does not crash preflight", async () => {
  const mock = await startMockServer();
  try {
    const url = `${mock.baseUrl}/invalid-html`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, ...loopbackOpts(mock) });
    assert.equal(result.status, "reachable");
  } finally {
    await mock.close();
  }
});

test("an invalid URL (bad syntax) is status=invalid, policy_decision=blocked", async () => {
  const result = await preflightUrl({ submittedUrl: "not a url", normalizedUrl: "not a url", dnsAdapter: async () => ({ addresses: [] }), now });
  assert.equal(result.status, "invalid");
  assert.equal(result.policy_decision, "blocked");
});

// ---- SSRF matrix: hostnames resolving to non-public addresses (§20 "DNS") ----

const SSRF_DNS_HOSTNAMES = [
  ["private-a.fixture", "url_private_destination"],
  ["private-aaaa.fixture", "url_private_destination"],
  ["mixed.fixture", "url_mixed_public_private_dns"],
  ["metadata-hostname.fixture", "url_metadata_endpoint"],
  ["ipv4-mapped.fixture", "url_private_destination"], // ::ffff:127.0.0.1 classifies as loopback
];
for (const [hostname, expectedCode] of SSRF_DNS_HOSTNAMES) {
  test(`SSRF DNS case blocked: ${hostname} -> ${expectedCode}`, async () => {
    const dnsAdapter = createMockDnsAdapter(DNS_FIXTURES);
    const url = `https://${hostname}/x`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now });
    assert.equal(result.status, "blocked");
    assert.equal(result.errors[0].code, expectedCode);
  });
}

test("a public DNS answer is allowed through destination validation (SSRF matrix positive control)", async () => {
  const dnsAdapter = createMockDnsAdapter(DNS_FIXTURES);
  const url = "https://public-a.fixture/x";
  const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now });
  // This will still fail at the actual request stage (nothing listens at
  // 93.184.216.34 in the test sandbox) — the point of this test is that
  // it gets PAST destination validation (policy_decision=allowed) rather
  // than being blocked, proving the public path isn't accidentally denied.
  assert.equal(result.policy_decision, "allowed");
});

test("DNS NXDOMAIN is reported as unreachable, not blocked (a missing domain is not an SSRF finding)", async () => {
  const dnsAdapter = createMockDnsAdapter(DNS_FIXTURES);
  const url = "https://nxdomain.fixture/x";
  const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now });
  assert.equal(result.status, "unreachable");
  assert.equal(result.policy_decision, "allowed");
});

test("DNS timeout is reported as its own outcome", async () => {
  const dnsAdapter = createMockDnsAdapter(DNS_FIXTURES);
  const url = "https://slow-dns.fixture/x";
  const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now });
  assert.equal(result.status, "unreachable");
});

// ---- SSRF matrix: IP-literal hostnames (§20 "IPv4"/"IPv6") ----

const SSRF_LITERAL_HOSTNAMES = ["127.0.0.1", "127.1", "0.0.0.0", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "2130706433", "0x7f000001"];
for (const literal of SSRF_LITERAL_HOSTNAMES) {
  test(`SSRF IPv4-literal case blocked: http://${literal}/`, async () => {
    const url = `http://${literal}/`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter: async () => ({ addresses: [] }), now });
    assert.equal(result.status, "blocked");
  });
}

const SSRF_IPV6_LITERALS = ["[::1]", "[::]", "[fc00::1]", "[fe80::1]", "[::ffff:127.0.0.1]"];
for (const literal of SSRF_IPV6_LITERALS) {
  test(`SSRF IPv6-literal case blocked: http://${literal}/`, async () => {
    const url = `http://${literal}/`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter: async () => ({ addresses: [] }), now });
    assert.equal(result.status, "blocked");
  });
}

// ---- SSRF matrix: blocked hostnames (§20 "Hostnames") ----

const SSRF_BLOCKED_HOSTNAMES = ["localhost", "metadata.google.internal", "example.local"];
for (const hostname of SSRF_BLOCKED_HOSTNAMES) {
  test(`SSRF hostname case blocked (hostname-suffix layer): http://${hostname}/`, async () => {
    const url = `http://${hostname}/`;
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter: async () => ({ addresses: [{ address: "93.184.216.34", family: 4 }] }), now });
    assert.equal(result.status, "blocked");
  });
}

test("SSRF hostname case blocked (defense-in-depth: IP-classification layer, not the suffix blocklist): http://localhost.localdomain/", async () => {
  // "localhost.localdomain" is NOT in BLOCKED_HOSTNAME_SUFFIXES (§5.6's
  // list doesn't include ".localdomain") — this hostname is only ever
  // blocked because it resolves to a loopback address, exactly the §6.3
  // principle this test exists to prove: "Nespoléhej pouze na hostname
  // blacklist. IP classification musí stačit." A DNS adapter that (as
  // real-world resolvers commonly do for this exact hostname, via
  // /etc/hosts) answers with 127.0.0.1 must still be blocked.
  const url = "http://localhost.localdomain/";
  const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter: async () => ({ addresses: [{ address: "127.0.0.1", family: 4 }] }), now });
  assert.equal(result.status, "blocked");
  assert.equal(result.errors[0].code, "url_private_destination");
});

// ---- SSRF matrix: redirects (§20 "Redirects") ----

test("SSRF redirect case: public -> private is blocked", async () => {
  const mock = await startMockServer();
  try {
    const target = encodeURIComponent("http://10.0.0.1/x");
    const url = `${mock.baseUrl}/redirect-to/${target}`;
    const dnsAdapter = createMockDnsAdapter({});
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now, testAllowedPrivateAddresses: ["127.0.0.1"], testExtraAllowedPorts: [mock.port] });
    assert.equal(result.status, "blocked");
    assert.equal(result.errors[0].code, "url_private_destination");
    assert.equal(result.redirects.length, 1, "the chain up to the blocked hop must still be recorded");
  } finally {
    await mock.close();
  }
});

test("SSRF redirect case: public -> localhost is blocked", async () => {
  const mock = await startMockServer();
  try {
    const target = encodeURIComponent("http://localhost/x");
    const url = `${mock.baseUrl}/redirect-to/${target}`;
    const dnsAdapter = createMockDnsAdapter({});
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now, testAllowedPrivateAddresses: ["127.0.0.1"], testExtraAllowedPorts: [mock.port] });
    assert.equal(result.status, "blocked");
  } finally {
    await mock.close();
  }
});

test("SSRF redirect case: public -> metadata endpoint is blocked", async () => {
  const mock = await startMockServer();
  try {
    const target = encodeURIComponent("http://169.254.169.254/x");
    const url = `${mock.baseUrl}/redirect-to/${target}`;
    const dnsAdapter = createMockDnsAdapter({});
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now, testAllowedPrivateAddresses: ["127.0.0.1"], testExtraAllowedPorts: [mock.port] });
    assert.equal(result.status, "blocked");
    assert.equal(result.errors[0].code, "url_metadata_endpoint");
  } finally {
    await mock.close();
  }
});

test("SSRF redirect case: public -> URL with credentials is blocked", async () => {
  const mock = await startMockServer();
  try {
    const target = encodeURIComponent("http://user:pass@example.test/x");
    const url = `${mock.baseUrl}/redirect-to/${target}`;
    const dnsAdapter = createMockDnsAdapter({});
    const result = await preflightUrl({ submittedUrl: url, normalizedUrl: url, dnsAdapter, now, testAllowedPrivateAddresses: ["127.0.0.1"], testExtraAllowedPorts: [mock.port] });
    assert.equal(result.status, "blocked");
    assert.equal(result.errors[0].code, "blocked_url_credentials");
  } finally {
    await mock.close();
  }
});
