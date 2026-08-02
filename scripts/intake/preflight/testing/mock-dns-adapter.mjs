// Fixture-driven DNS adapter for tests (PHASE_004.md §19.2, §4.1). Same
// `resolveHostname(hostname) => Promise<{addresses, resolvedAt}>` shape
// as the production adapter (resolve-hostname.mjs) — tests inject this
// instead of touching a real resolver.
import { DnsResolutionError, PREFLIGHT_ERROR_CODES } from "../errors.mjs";

// `fixtures` maps hostname -> one of:
//   { addresses: [{address, family}, ...] }
//   { error: "not_found" | "timeout" | "temporary_failure" | "invalid_response" }
export function createMockDnsAdapter(fixtures, { now = () => "2026-08-02T00:00:00.000Z" } = {}) {
  return async function resolveHostname(hostname) {
    const fixture = fixtures[hostname];
    if (!fixture) {
      throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_NOT_FOUND, `no mock DNS fixture for ${hostname}`);
    }
    if (fixture.error === "not_found") throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_NOT_FOUND, `DNS_NOT_FOUND: ${hostname}`);
    if (fixture.error === "timeout") throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_TIMEOUT, `DNS_TIMEOUT: ${hostname}`);
    if (fixture.error === "temporary_failure") throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_TEMPORARY_FAILURE, `DNS_TEMPORARY_FAILURE: ${hostname}`);
    if (fixture.error === "invalid_response") throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_INVALID_RESPONSE, `DNS_INVALID_RESPONSE: ${hostname}`);
    return { addresses: fixture.addresses, resolvedAt: now() };
  };
}

// §19.2's own fixture catalog — public/private/mixed/multiple/NXDOMAIN/
// timeout/IPv4-mapped/metadata, keyed by a descriptive hostname so tests
// read like documentation.
export const DNS_FIXTURES = Object.freeze({
  "public-a.fixture": { addresses: [{ address: "93.184.216.34", family: 4 }] },
  "public-aaaa.fixture": { addresses: [{ address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 }] },
  "private-a.fixture": { addresses: [{ address: "10.0.0.5", family: 4 }] },
  "private-aaaa.fixture": { addresses: [{ address: "fc00::5", family: 6 }] },
  "mixed.fixture": { addresses: [{ address: "93.184.216.34", family: 4 }, { address: "10.0.0.5", family: 4 }] },
  "multiple-public.fixture": {
    addresses: [
      { address: "93.184.216.34", family: 4 },
      { address: "192.0.32.10", family: 4 },
    ],
  },
  "nxdomain.fixture": { error: "not_found" },
  "slow-dns.fixture": { error: "timeout" },
  "flaky-dns.fixture": { error: "temporary_failure" },
  "garbage-dns.fixture": { error: "invalid_response" },
  "ipv4-mapped.fixture": { addresses: [{ address: "::ffff:127.0.0.1", family: 6 }] },
  "metadata-hostname.fixture": { addresses: [{ address: "169.254.169.254", family: 4 }] },
  "public-then-changes.fixture": { addresses: [{ address: "93.184.216.34", family: 4 }] },
});
