// List-level orchestration (PHASE_004.md §16). Caps how many of the
// submitted URLs are actually preflighted, runs them with bounded
// concurrency and at most one in-flight request per hostname, and never
// retries automatically.
import { MAX_URLS_PREFLIGHTED, CONCURRENCY, PER_HOST_CONCURRENCY, PREFLIGHT_VERSION } from "./constants.mjs";
import { preflightUrl } from "./preflight-url.mjs";

function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// A tiny bounded-concurrency + per-host-serialization scheduler — not a
// general task-queue library (§37: don't build a crawler). `items` is
// the list of normalized-URL entries; `run(item)` does the actual work.
async function scheduleWithLimits(items, run) {
  const results = new Array(items.length);
  const hostLocks = new Map(); // hostname -> Promise chain, enforces PER_HOST_CONCURRENCY = 1
  let nextIndex = 0;

  async function runOne(index) {
    const item = items[index];
    const host = hostnameOf(item.normalized);
    const previous = hostLocks.get(host) ?? Promise.resolve();
    const current = previous.then(() => run(item));
    hostLocks.set(
      host,
      current.catch(() => {})
    );
    results[index] = await current.catch((err) => ({ __error: err }));
  }

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await runOne(index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
}

// `normalizedUrls` is Phase 2's `normalization.normalized_source_urls[]`
// (each `{raw, normalized, syntax_observations}`). `dnsAdapter`/`now` are
// always caller-injected (§4.3/§4.1) — no adapter is constructed inside
// this module, so a caller that never passes one gets an immediate,
// obvious error rather than an accidental real DNS lookup.
export async function preflightUrls(normalizedUrls, { dnsAdapter, now, testAllowedSuffixes = [] }) {
  const attempted = normalizedUrls.slice(0, MAX_URLS_PREFLIGHTED);
  const skipped = normalizedUrls.slice(MAX_URLS_PREFLIGHTED);

  const attemptedResults = await scheduleWithLimits(attempted, (entry) =>
    preflightUrl({ submittedUrl: entry.raw, normalizedUrl: entry.normalized, dnsAdapter, now, testAllowedSuffixes })
  );

  const results = attemptedResults.map((result, i) =>
    result.__error
      ? { submitted_url: attempted[i].raw, normalized_url: attempted[i].normalized, status: "unreachable", policy_decision: "blocked", checked_at: now(), http: null, network: null, redirects: [], metadata: null, editorial_verification: "not_performed", warnings: [], errors: [{ code: "url_preflight_failed", message: String(result.__error?.message ?? result.__error) }] }
      : result
  );

  for (const entry of skipped) {
    results.push({
      submitted_url: entry.raw,
      normalized_url: entry.normalized,
      status: "not_attempted",
      policy_decision: "not_attempted",
      checked_at: now(),
      http: null,
      network: null,
      redirects: [],
      metadata: null,
      editorial_verification: "not_performed",
      warnings: [{ code: "not_attempted_limit", message: `preflight limited to ${MAX_URLS_PREFLIGHTED} URLs per submission` }],
      errors: [],
    });
  }

  return { version: PREFLIGHT_VERSION, checked_at: now(), results };
}

// The default, fully offline result (§23.1: preflight is opt-in; the
// default run never touches the network at all). Every submitted URL is
// `not_attempted` with `policy_decision: "not_attempted"`.
export function offlinePreflightResult(normalizedUrls, now) {
  return {
    version: PREFLIGHT_VERSION,
    checked_at: now(),
    results: normalizedUrls.map((entry) => ({
      submitted_url: entry.raw,
      normalized_url: entry.normalized,
      status: "not_attempted",
      policy_decision: "not_attempted",
      checked_at: now(),
      http: null,
      network: null,
      redirects: [],
      metadata: null,
      editorial_verification: "not_performed",
      warnings: [],
      errors: [],
    })),
  };
}
