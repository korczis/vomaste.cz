import { test } from "node:test";
import assert from "node:assert/strict";
import { preflightUrls, offlinePreflightResult } from "./preflight-urls.mjs";
import { MAX_URLS_PREFLIGHTED } from "./constants.mjs";

const now = () => "2026-08-02T00:00:00.000Z";

function entries(n) {
  return Array.from({ length: n }, (_, i) => ({ normalized: `https://host-${i}.invalid/`, raw: `https://host-${i}.invalid/` }));
}

test("caps attempted preflights at MAX_URLS_PREFLIGHTED, the rest are not_attempted_limit", async () => {
  const dnsAdapter = async () => {
    throw new Error("dns_not_found");
  };
  const result = await preflightUrls(entries(MAX_URLS_PREFLIGHTED + 5), { dnsAdapter, now });
  const attempted = result.results.filter((r) => r.policy_decision !== "not_attempted");
  const skipped = result.results.filter((r) => r.policy_decision === "not_attempted");
  assert.equal(attempted.length, MAX_URLS_PREFLIGHTED);
  assert.equal(skipped.length, 5);
  assert.ok(skipped.every((r) => r.warnings.some((w) => w.code === "not_attempted_limit")));
  assert.ok(skipped.every((r) => r.status === "not_attempted"));
});

test("a per-URL failure never aborts the rest of the batch", async () => {
  let call = 0;
  const dnsAdapter = async () => {
    call += 1;
    if (call === 2) throw new Error("boom");
    return { addresses: [] };
  };
  const result = await preflightUrls(entries(3), { dnsAdapter, now });
  assert.equal(result.results.length, 3);
  assert.ok(result.results.every((r) => r.status));
});

test("results preserve input order", async () => {
  const dnsAdapter = async () => ({ addresses: [] });
  const list = entries(5);
  const result = await preflightUrls(list, { dnsAdapter, now });
  assert.deepEqual(
    result.results.map((r) => r.submitted_url),
    list.map((e) => e.raw)
  );
});

test("at most one in-flight request per hostname (per-host serialization)", async () => {
  const active = new Set();
  let maxConcurrentPerHost = 0;
  const dnsAdapter = async (hostname) => {
    if (active.has(hostname)) maxConcurrentPerHost = Math.max(maxConcurrentPerHost, 2);
    active.add(hostname);
    await new Promise((r) => setTimeout(r, 10));
    active.delete(hostname);
    return { addresses: [] };
  };
  // Two entries with the SAME hostname — must never run concurrently.
  const sameHost = [
    { normalized: "https://same-host.invalid/a", raw: "https://same-host.invalid/a" },
    { normalized: "https://same-host.invalid/b", raw: "https://same-host.invalid/b" },
  ];
  await preflightUrls(sameHost, { dnsAdapter, now });
  assert.equal(maxConcurrentPerHost, 0, "same-hostname requests must never overlap");
});

test("empty input yields an empty result set with the right envelope shape", async () => {
  const result = await preflightUrls([], { dnsAdapter: async () => ({ addresses: [] }), now });
  assert.deepEqual(result.results, []);
  assert.equal(typeof result.version, "string");
  assert.equal(typeof result.checked_at, "string");
});

test("offlinePreflightResult marks every URL not_attempted without ever calling a DNS/HTTP adapter", () => {
  const result = offlinePreflightResult(entries(3), now);
  assert.equal(result.results.length, 3);
  assert.ok(result.results.every((r) => r.status === "not_attempted" && r.policy_decision === "not_attempted"));
  assert.ok(result.results.every((r) => r.editorial_verification === "not_performed"));
});
