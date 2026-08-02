// URL syntax policy (PHASE_004.md §5). Pure, no network. Builds on the
// WHATWG URL parser (already IDNA/percent-encoding aware) and applies
// the protocol/credentials/fragment/port policy on top of it.
import { ALLOWED_PROTOCOLS, ALLOWED_PORTS } from "./constants.mjs";
import { UrlPolicyError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

const DEFAULT_PORT_BY_PROTOCOL = Object.freeze({ "https:": 443, "http:": 80 });

// Returns `{ requestUrl, hostname, port, protocol, hadFragment,
// insecureTransport }`. `requestUrl` is the URL.toString() with
// credentials and fragment stripped — this, never the raw submitted
// string, is what ever gets sent to a server (§5.3, §5.4). Throws
// UrlPolicyError (fail-closed) for anything this policy rejects.
// `testExtraAllowedPorts` — same test-only-escape-hatch pattern as
// classify-hostname.mjs's `testAllowedSuffixes` and validate-destination.mjs's
// `testAllowedPrivateAddresses`: lets a test file point at a local mock
// server's ephemeral port without loosening production policy (never
// wired to a CLI flag or env var).
export function parseAndPolicyCheckUrl(rawUrl, { testExtraAllowedPorts = [] } = {}) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UrlPolicyError(PREFLIGHT_ERROR_CODES.INVALID_HOSTNAME, "URL failed to parse");
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw new UrlPolicyError(PREFLIGHT_ERROR_CODES.UNSUPPORTED_PROTOCOL, `protocol not allowed: ${parsed.protocol}`, { protocol: parsed.protocol });
  }
  if (parsed.username || parsed.password) {
    throw new UrlPolicyError(PREFLIGHT_ERROR_CODES.CONTAINS_CREDENTIALS, "URL contains embedded credentials");
  }

  const port = parsed.port ? Number(parsed.port) : DEFAULT_PORT_BY_PROTOCOL[parsed.protocol];
  if (!ALLOWED_PORTS.includes(port) && !testExtraAllowedPorts.includes(port)) {
    throw new UrlPolicyError(PREFLIGHT_ERROR_CODES.NONSTANDARD_PORT, `port not allowed: ${port}`, { port });
  }

  const hadFragment = parsed.hash.length > 0;
  parsed.hash = ""; // §5.4: fragment is never sent to the server

  // WHATWG URL's own host-parsing algorithm already canonicalizes
  // alternative IPv4 forms ("2130706433", "0x7f000001", "127.1" all
  // become "127.0.0.1") — verified directly against V8's implementation.
  // classify-ip.mjs's own loose IPv4 parser is kept as defense-in-depth
  // for any value that reaches it via a path other than `new URL()`, not
  // because this normalization is unreliable.
  const hostnameForDns = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;

  return {
    requestUrl: parsed.toString(),
    hostname: parsed.hostname,
    hostnameForDns,
    port,
    protocol: parsed.protocol,
    hadFragment,
    insecureTransport: parsed.protocol === "http:",
  };
}
