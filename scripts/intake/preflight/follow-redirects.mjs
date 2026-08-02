// Redirect orchestration (PHASE_004.md §9). Every redirect re-runs the
// FULL validation pipeline from scratch — protocol/credentials/port
// policy, hostname policy, DNS resolution, IP classification, pinned
// request — never inherits trust from the original host (§9.2: "Nikdy
// nepřebírej důvěru z původního hostu"). This is deliberately the same
// pipeline `preflight-url.mjs` runs for the initial URL; the two share
// `validateOneHop` so there is exactly one place that logic lives.
import { MAX_REDIRECTS } from "./constants.mjs";
import { RedirectPolicyError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

// `validateOneHop(url)` is injected by the caller (preflight-url.mjs) —
// it runs parse-url → classify-hostname → resolve-hostname →
// validate-destination → request-once for exactly one URL and returns
// `{ requestUrl, response, insecureTransport }` or throws. Keeping that
// as an injected function (rather than importing every module here) is
// what lets this module be tested purely against a scripted hop
// sequence, independent of any real network/DNS adapter.
export async function followRedirects(initialUrl, validateOneHop) {
  const chain = [];
  const visited = new Set();
  let currentUrl = initialUrl;
  let wasSecure = initialUrl.startsWith("https:");

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (visited.has(currentUrl)) {
      throw new RedirectPolicyError(PREFLIGHT_ERROR_CODES.REDIRECT_LOOP, "redirect loop detected", { chain });
    }
    visited.add(currentUrl);

    let hopResult;
    try {
      hopResult = await validateOneHop(currentUrl);
    } catch (err) {
      // Attach the chain accumulated so far to ANY hop failure (not just
      // this module's own RedirectPolicyErrors) — a "redirect to a
      // private IP" failure on hop 2 must still report hops 0-1 in the
      // result, not silently lose them.
      if (err.details && !err.details.chain) err.details.chain = chain;
      throw err;
    }
    const { response } = hopResult;
    const isRedirectStatus = response.status >= 300 && response.status < 400 && response.headers.location;

    if (!isRedirectStatus) {
      return { finalUrl: currentUrl, response, chain, resolvedAddresses: hopResult.resolvedAddresses, pinnedAddress: hopResult.pinnedAddress };
    }

    if (hop === MAX_REDIRECTS) {
      throw new RedirectPolicyError(PREFLIGHT_ERROR_CODES.REDIRECT_LIMIT_EXCEEDED, `exceeded ${MAX_REDIRECTS} redirects`, { chain });
    }

    let nextUrl;
    try {
      nextUrl = new URL(response.headers.location, currentUrl).toString();
    } catch {
      throw new RedirectPolicyError(PREFLIGHT_ERROR_CODES.REDIRECT_MALFORMED_LOCATION, `malformed Location header: ${response.headers.location}`, { chain });
    }

    const nextIsSecure = nextUrl.startsWith("https:");
    if (wasSecure && !nextIsSecure) {
      throw new RedirectPolicyError(PREFLIGHT_ERROR_CODES.REDIRECT_TRANSPORT_DOWNGRADE, `redirect downgrades https to http: ${currentUrl} -> ${nextUrl}`, { chain });
    }

    chain.push({ from: currentUrl, to: nextUrl, status: response.status });
    currentUrl = nextUrl;
    wasSecure = nextIsSecure;
  }

  // Unreachable in practice (the loop always returns or throws), kept as
  // an explicit fail-closed fallback rather than an implicit `undefined`.
  throw new RedirectPolicyError(PREFLIGHT_ERROR_CODES.REDIRECT_LIMIT_EXCEEDED, "redirect chain did not terminate", { chain });
}
