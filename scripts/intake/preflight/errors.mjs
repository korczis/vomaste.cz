// Explicit error classes with stable codes (PHASE_004.md §22). Report and
// workflow logic must never branch on an error's message text — only on
// `code`.
export class PreflightError extends Error {
  constructor(className, code, message, details = {}) {
    super(message);
    this.name = className;
    this.code = code;
    this.details = details;
  }
}

export class UrlPolicyError extends PreflightError {
  constructor(code, message, details) {
    super("UrlPolicyError", code, message, details);
  }
}
export class DnsResolutionError extends PreflightError {
  constructor(code, message, details) {
    super("DnsResolutionError", code, message, details);
  }
}
export class DestinationBlockedError extends PreflightError {
  constructor(code, message, details) {
    super("DestinationBlockedError", code, message, details);
  }
}
export class NetworkTimeoutError extends PreflightError {
  constructor(code, message, details) {
    super("NetworkTimeoutError", code, message, details);
  }
}
export class TlsError extends PreflightError {
  constructor(code, message, details) {
    super("TlsError", code, message, details);
  }
}
export class RedirectPolicyError extends PreflightError {
  constructor(code, message, details) {
    super("RedirectPolicyError", code, message, details);
  }
}
export class ResponseLimitError extends PreflightError {
  constructor(code, message, details) {
    super("ResponseLimitError", code, message, details);
  }
}
export class MetadataExtractionError extends PreflightError {
  constructor(code, message, details) {
    super("MetadataExtractionError", code, message, details);
  }
}

// One canonical list — every code below must be reachable from exactly
// the module its name implies, checked by preflight-url.test.mjs's own
// coverage sweep.
export const PREFLIGHT_ERROR_CODES = Object.freeze({
  // UrlPolicyError
  UNSUPPORTED_PROTOCOL: "url_unsupported_protocol",
  CONTAINS_CREDENTIALS: "blocked_url_credentials",
  NONSTANDARD_PORT: "url_nonstandard_port",
  INVALID_HOSTNAME: "url_invalid_hostname",
  BLOCKED_HOSTNAME_SUFFIX: "url_blocked_hostname_suffix",
  SINGLE_LABEL_HOSTNAME: "url_single_label_hostname",
  // DnsResolutionError
  DNS_NOT_FOUND: "dns_not_found",
  DNS_TIMEOUT: "dns_timeout",
  DNS_TEMPORARY_FAILURE: "dns_temporary_failure",
  DNS_INVALID_RESPONSE: "dns_invalid_response",
  // DestinationBlockedError
  PRIVATE_DESTINATION: "url_private_destination",
  MIXED_PUBLIC_PRIVATE_DNS: "url_mixed_public_private_dns",
  METADATA_ENDPOINT: "url_metadata_endpoint",
  REMOTE_ADDRESS_MISMATCH: "remote_address_mismatch",
  // NetworkTimeoutError
  DNS_TIMEOUT_EXCEEDED: "url_timeout_dns",
  CONNECT_TIMEOUT_EXCEEDED: "url_timeout_connect",
  HEADERS_TIMEOUT_EXCEEDED: "url_timeout_headers",
  BODY_TIMEOUT_EXCEEDED: "url_timeout_body",
  TOTAL_TIMEOUT_EXCEEDED: "url_timeout_total",
  // TlsError
  TLS_CERTIFICATE_ERROR: "tls_certificate_error",
  TLS_HOSTNAME_MISMATCH: "tls_hostname_mismatch",
  TLS_EXPIRED_CERTIFICATE: "tls_expired_certificate",
  TLS_PROTOCOL_ERROR: "tls_protocol_error",
  // RedirectPolicyError
  REDIRECT_LIMIT_EXCEEDED: "url_redirect_limit_exceeded",
  REDIRECT_PRIVATE_DESTINATION: "url_redirect_private_destination",
  REDIRECT_TRANSPORT_DOWNGRADE: "redirect_transport_downgrade",
  REDIRECT_LOOP: "redirect_loop",
  REDIRECT_MALFORMED_LOCATION: "redirect_malformed_location",
  // ResponseLimitError
  RESPONSE_TOO_LARGE: "url_response_too_large",
  DECLARED_LENGTH_TOO_LARGE: "url_declared_length_too_large",
  // MetadataExtractionError
  UNSUPPORTED_CONTENT_TYPE: "url_unsupported_content_type",
  METADATA_EXTRACTION_FAILED: "url_metadata_extraction_failed",
  METADATA_EXTRACTION_SKIPPED: "metadata_extraction_skipped",
});
