// Per-URL orchestrator (PHASE_004.md §0's full pipeline, §14 result
// model). This is the one place that wires parse → hostname policy →
// DNS → destination validation → pinned request → redirect loop →
// metadata extraction together. Every error path ends in a structured
// result object, never an uncaught throw — a single URL's failure must
// never abort preflighting the rest (§16).
import { parseAndPolicyCheckUrl } from "./parse-url.mjs";
import { classifyHostname } from "./classify-hostname.mjs";
import { validateDestination } from "./validate-destination.mjs";
import { requestOnce } from "./request-once.mjs";
import { followRedirects } from "./follow-redirects.mjs";
import { extractHtmlMetadata } from "./extract-html-metadata.mjs";
import { PreflightError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";
import { TIMEOUTS_MS, MAX_BODY_BYTES } from "./constants.mjs";

// Runs the full per-hop validation pipeline for exactly one URL string
// (used both for the initial URL and for every redirect target by
// follow-redirects.mjs's injected `validateOneHop`). Throws a
// PreflightError subclass on any policy violation — never silently
// degrades.
async function validateAndRequestOneHop(url, { dnsAdapter, timeouts, maxBodyBytes, testAllowedSuffixes, testAllowedPrivateAddresses, testExtraAllowedPorts }) {
  const parsed = parseAndPolicyCheckUrl(url, { testExtraAllowedPorts });
  const hostnamePolicy = classifyHostname(parsed.hostnameForDns, { testAllowedSuffixes });
  if (!hostnamePolicy.ok) {
    throw new PreflightError("UrlPolicyError", `url_${hostnamePolicy.reason}`, `hostname rejected: ${hostnamePolicy.reason}`);
  }

  let addresses;
  if (hostnamePolicy.isIpLiteral) {
    addresses = [{ address: hostnamePolicy.literalAddress, family: hostnamePolicy.family }];
  } else {
    const dnsResult = await dnsAdapter(parsed.hostnameForDns);
    addresses = dnsResult.addresses;
  }

  const destination = validateDestination(addresses, { testAllowedPrivateAddresses });
  if (!destination.allowed) {
    throw new PreflightError("DestinationBlockedError", `url_${destination.reason}`, `destination blocked: ${destination.reason}`, { classifiedAddresses: destination.classifiedAddresses });
  }

  const response = await requestOnce({
    url: parsed.requestUrl,
    hostname: parsed.hostname,
    pinnedAddress: destination.pinnedAddress,
    timeouts,
    maxBodyBytes,
  });

  return { requestUrl: parsed.requestUrl, insecureTransport: parsed.insecureTransport, response, resolvedAddresses: destination.classifiedAddresses, pinnedAddress: destination.pinnedAddress };
}

function statusFromError(err) {
  if (err instanceof PreflightError) {
    if (err.name === "UrlPolicyError" || err.name === "DestinationBlockedError" || err.name === "RedirectPolicyError" || err.name === "TlsError") {
      return { status: "blocked", policyDecision: "blocked" };
    }
    if (err.name === "NetworkTimeoutError") return { status: "timeout", policyDecision: "allowed" };
    if (err.name === "MetadataExtractionError") return { status: "partial", policyDecision: "allowed" };
  }
  return { status: "unreachable", policyDecision: "allowed" };
}

// Returns one §14-shaped result object. `submittedUrl`/`normalizedUrl`
// always come from Phase 2's own syntactic normalization — this module
// never re-derives them.
export async function preflightUrl({
  submittedUrl,
  normalizedUrl,
  dnsAdapter,
  now,
  timeouts = TIMEOUTS_MS,
  maxBodyBytes = MAX_BODY_BYTES,
  testAllowedSuffixes = [],
  testAllowedPrivateAddresses = [],
  testExtraAllowedPorts = [],
}) {
  const warnings = [];
  const errors = [];
  const base = { submitted_url: submittedUrl, normalized_url: normalizedUrl, checked_at: now(), editorial_verification: "not_performed" };

  let syntaxCheck;
  try {
    syntaxCheck = parseAndPolicyCheckUrl(normalizedUrl, { testExtraAllowedPorts });
  } catch (err) {
    errors.push({ code: err.code, message: err.message });
    return { ...base, status: "invalid", policy_decision: "blocked", http: null, network: null, redirects: [], metadata: null, warnings, errors };
  }
  if (syntaxCheck.insecureTransport) warnings.push({ code: "insecure_transport", message: "URL uses http:// instead of https://" });

  let redirectResult;
  try {
    redirectResult = await followRedirects(syntaxCheck.requestUrl, (hopUrl) =>
      validateAndRequestOneHop(hopUrl, { dnsAdapter, timeouts, maxBodyBytes, testAllowedSuffixes, testAllowedPrivateAddresses, testExtraAllowedPorts })
    );
  } catch (err) {
    const { status, policyDecision } = statusFromError(err);
    errors.push({ code: err.code ?? PREFLIGHT_ERROR_CODES.METADATA_EXTRACTION_FAILED, message: err.message });
    return { ...base, status, policy_decision: policyDecision, http: null, network: null, redirects: err.details?.chain ?? [], metadata: null, warnings, errors };
  }

  const { response, chain } = redirectResult;
  const contentType = (response.headers["content-type"] ?? "").split(";")[0].trim();

  let metadata = null;
  if (response.status >= 200 && response.status < 300) {
    try {
      const extracted = extractHtmlMetadata(response.body, response.headers["content-type"]);
      metadata = extracted.metadata;
    } catch (err) {
      if (err.code === PREFLIGHT_ERROR_CODES.UNSUPPORTED_CONTENT_TYPE) {
        warnings.push({ code: PREFLIGHT_ERROR_CODES.METADATA_EXTRACTION_SKIPPED, message: `no metadata extraction for content type: ${contentType}` });
      } else {
        warnings.push({ code: PREFLIGHT_ERROR_CODES.METADATA_EXTRACTION_FAILED, message: err.message });
      }
    }
  }

  const status = response.status >= 200 && response.status < 400 ? "reachable" : "unreachable";
  if (response.bodyTruncated) warnings.push({ code: "body_truncated", message: `response body truncated at ${maxBodyBytes} bytes` });

  return {
    ...base,
    status,
    policy_decision: "allowed",
    http: {
      status: response.status,
      content_type: contentType || null,
      content_length_declared: response.headers["content-length"] ? Number(response.headers["content-length"]) : null,
      body_bytes_read: response.body.length,
      body_truncated: response.bodyTruncated,
    },
    network: { resolved_addresses: redirectResult.resolvedAddresses ?? [], remote_address: redirectResult.pinnedAddress?.address ?? null },
    redirects: chain,
    metadata,
    warnings,
    errors,
  };
}
