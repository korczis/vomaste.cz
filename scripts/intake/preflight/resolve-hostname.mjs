// DNS adapter (PHASE_004.md §4.1, §7). The adapter is an explicit
// interface — `resolveHostname(hostname, options) => Promise<{addresses,
// resolvedAt}>` — so core policy (validate-destination.mjs) never talks
// to node:dns directly and tests can inject a fixture adapter with the
// exact same shape instead of touching a real resolver.
import { resolve4, resolve6 } from "node:dns/promises";
import { DnsResolutionError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";
import { TIMEOUTS_MS } from "./constants.mjs";

function withTimeout(promise, ms, onTimeout) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(onTimeout()), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Production DNS adapter — real node:dns lookups. `now` is an injected
// clock function (PHASE_004.md §4.3: every timestamp must be
// injectable); defaults to `() => new Date().toISOString()` only at the
// CLI entrypoint, never inside a tested core module.
export function createProductionDnsAdapter({ now, timeoutMs = TIMEOUTS_MS.dns } = {}) {
  return async function resolveHostname(hostname) {
    const results = await Promise.allSettled([
      withTimeout(resolve4(hostname), timeoutMs, () => new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_TIMEOUT, "DNS A lookup timed out")),
      withTimeout(resolve6(hostname), timeoutMs, () => new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_TIMEOUT, "DNS AAAA lookup timed out")),
    ]);

    const addresses = [];
    let sawTimeout = false;
    let sawNotFound = 0;
    for (const [index, result] of results.entries()) {
      const family = index === 0 ? 4 : 6;
      if (result.status === "fulfilled") {
        for (const address of result.value) addresses.push({ address, family });
      } else if (result.reason instanceof DnsResolutionError) {
        sawTimeout = true;
      } else if (result.reason?.code === "ENOTFOUND" || result.reason?.code === "ENODATA") {
        sawNotFound += 1;
      }
    }

    if (addresses.length === 0) {
      if (sawTimeout) throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_TIMEOUT, `DNS lookup for ${hostname} timed out`);
      if (sawNotFound === 2) throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_NOT_FOUND, `DNS lookup for ${hostname} returned no records`);
      throw new DnsResolutionError(PREFLIGHT_ERROR_CODES.DNS_TEMPORARY_FAILURE, `DNS lookup for ${hostname} failed`);
    }

    return { addresses, resolvedAt: now() };
  };
}
