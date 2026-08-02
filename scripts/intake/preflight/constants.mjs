// URL preflight policy constants (PHASE_004.md §5-§9, §16, §17). One
// place for every limit/allowlist so a value is never duplicated (and
// silently drifted) between the modules that enforce it and the tests
// that check it.

export const PREFLIGHT_VERSION = "1.0.0";

// §5.1/§5.2: allowlist is the primary defense, not a blacklist —
// BLOCKED_PROTOCOLS exists only for clearer error messages/tests, ALLOWED
// is what parse-url.mjs actually checks against.
export const ALLOWED_PROTOCOLS = Object.freeze(["https:", "http:"]);
export const BLOCKED_PROTOCOLS = Object.freeze([
  "file:", "ftp:", "ftps:", "data:", "javascript:", "blob:", "mailto:",
  "ssh:", "git:", "gopher:", "ws:", "wss:", "smb:", "nfs:", "ldap:", "ldaps:",
]);

// §5.5.
export const ALLOWED_PORTS = Object.freeze([80, 443]);
export const EXPLICITLY_BLOCKED_PORTS = Object.freeze([22, 25, 53, 2375, 2376, 3000, 3306, 5432, 6379, 8080, 8443, 9200, 11211, 27017]);

// §5.6: suffixes blocked in production. Test fixtures may use `.example`/
// `.test` deliberately — validate-destination.mjs's caller decides which
// hostname policy (production vs. test) applies, never a runtime env flag.
export const BLOCKED_HOSTNAME_SUFFIXES = Object.freeze([".local", ".localhost", ".internal", ".home", ".lan", ".test", ".invalid", ".example"]);
export const MAX_HOSTNAME_LENGTH = 253;
export const MAX_HOSTNAME_LABEL_LENGTH = 63;

// §6.3.
export const BLOCKED_METADATA_HOSTNAMES = Object.freeze(["metadata.google.internal", "metadata.azure.internal"]);
export const METADATA_IPV4 = "169.254.169.254";
export const METADATA_IPV6 = "fd00:ec2::254";

// §8.3 — separate timeouts per phase, never one blanket "request timeout".
export const TIMEOUTS_MS = Object.freeze({ dns: 3000, connect: 5000, headers: 8000, body: 5000, total: 12000 });

// §8.4.
export const MAX_BODY_BYTES = 256 * 1024;

// §9.1.
export const MAX_REDIRECTS = 3;

// §12.3.
export const METADATA_LIMITS = Object.freeze({ titleMaxChars: 500, descriptionMaxChars: 2000, canonicalUrlMaxChars: 2048 });

// §16.
export const MAX_URLS_PREFLIGHTED = 20; // of Phase 2's own MAX_SOURCE_URLS=100 total submitted
export const CONCURRENCY = 3;
export const PER_HOST_CONCURRENCY = 1;

// §17.
export const USER_AGENT = "vomaste.cz-source-preflight/1.0 (+https://vomaste.cz/)";
export const REQUEST_HEADERS = Object.freeze({
  "User-Agent": USER_AGENT,
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
  "Accept-Encoding": "identity",
});

// §12.1 — the ONLY metadata fields ever extracted; anything else in the
// HTML is ignored, never partially parsed "just in case".
export const METADATA_ALLOWLIST = Object.freeze([
  "title", "canonical_url", "og_title", "og_site_name", "og_type", "description", "article_published_time", "article_modified_time",
]);

// §13.1 — content types metadata extraction is even attempted for.
export const HTML_CONTENT_TYPES = Object.freeze(["text/html", "application/xhtml+xml"]);

// §26.2 — query-parameter names redacted in the report (never in the raw
// manifest submission, which stays untouched per Phase 2's raw-preservation
// rule; only the DERIVED normalized/preflight-facing URL is redacted).
export const SENSITIVE_QUERY_PARAM_NAMES = Object.freeze(["token", "access_token", "auth", "key", "apikey", "api_key", "signature", "sig", "password", "session"]);

// §14.1/§14.2.
export const PREFLIGHT_STATUSES = Object.freeze(["reachable", "unreachable", "blocked", "timeout", "invalid", "unsupported", "partial", "not_attempted"]);
export const POLICY_DECISIONS = Object.freeze(["allowed", "blocked", "not_attempted"]);
