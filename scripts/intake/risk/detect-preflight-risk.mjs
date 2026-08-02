// Translates PHASE_004.md §14 preflight results into the §15 risk-flag
// vocabulary. Purely a mapping — this module makes no network calls and
// no policy decisions of its own; scripts/intake/preflight/* already
// decided what happened, this only turns that into flags
// classify-intake-risk.mjs's precedence engine can consume.
import { FLAG_CATALOG, DETECTOR_VERSION } from "./constants.mjs";

function makeFlag(code, sourceField, explanation) {
  const meta = FLAG_CATALOG[code];
  return { code, severity: meta.severity, category: meta.category, source_field: sourceField, evidence: { kind: "derived", redacted_excerpt: null }, effect: meta.effect, explanation, detector_version: DETECTOR_VERSION };
}

const DNS_ERROR_CODES = new Set(["dns_not_found", "dns_timeout", "dns_temporary_failure", "dns_invalid_response"]);

// §1.1 reminder baked into every explanation this module writes: HTTP
// reachability is a technical fact, never a statement about editorial
// trust — see docs/intake/url-preflight.md's own restatement of the
// same four inequalities.
export function detectPreflightRisk(sourcePreflight) {
  const flags = [];

  for (const result of sourcePreflight.results) {
    const field = result.submitted_url;
    const isRedirectHop = result.redirects.length > 0;

    for (const error of result.errors) {
      if (error.code === "url_unsupported_protocol") flags.push(makeFlag("url_unsupported_protocol", field, `${field}: unsupported protocol`));
      else if (error.code === "blocked_url_credentials") flags.push(makeFlag("url_contains_credentials", field, `${field}: URL contains embedded credentials`));
      else if (error.code === "url_nonstandard_port") flags.push(makeFlag("url_nonstandard_port", field, `${field}: nonstandard port`));
      else if (error.code === "url_private_destination" || error.code === "url_metadata_endpoint" || error.code === "url_mixed_public_private_dns" || error.code === "remote_address_mismatch") {
        const code = isRedirectHop ? "url_redirect_private_destination" : error.code === "url_mixed_public_private_dns" ? "url_mixed_public_private_dns" : "url_private_destination";
        flags.push(makeFlag(code, field, `${field}: destination blocked (${error.code})`));
      } else if (DNS_ERROR_CODES.has(error.code)) flags.push(makeFlag("url_dns_failure", field, `${field}: DNS resolution failed (${error.code})`));
      else if (error.code === "redirect_loop") flags.push(makeFlag("url_redirect_loop", field, `${field}: redirect loop detected`));
      else if (error.code === "redirect_transport_downgrade") flags.push(makeFlag("url_redirect_transport_downgrade", field, `${field}: redirect downgraded https to http`));
      else if (String(error.code).startsWith("tls_")) flags.push(makeFlag("url_tls_error", field, `${field}: TLS error (${error.code})`));
      else if (String(error.code).startsWith("url_timeout")) flags.push(makeFlag("url_timeout", field, `${field}: request timed out`));
      else if (error.code === "url_invalid" || result.status === "invalid") flags.push(makeFlag("url_invalid", field, `${field}: URL failed policy validation`));
    }

    for (const warning of result.warnings) {
      if (warning.code === "body_truncated") flags.push(makeFlag("url_response_too_large", field, `${field}: response body truncated`));
      if (warning.code === "metadata_extraction_skipped") flags.push(makeFlag("url_unsupported_content_type", field, `${field}: content type not eligible for metadata extraction`));
      if (warning.code === "url_metadata_extraction_failed") flags.push(makeFlag("url_metadata_extraction_failed", field, `${field}: metadata extraction failed`));
    }

    if (result.status === "timeout") flags.push(makeFlag("url_timeout", field, `${field}: preflight timed out`));
    if (result.status === "partial") flags.push(makeFlag("url_preflight_partial", field, `${field}: preflight completed only partially`));
    if (result.status === "unreachable" && result.errors.length === 0) flags.push(makeFlag("url_preflight_failed", field, `${field}: destination unreachable`));
  }

  return flags;
}
