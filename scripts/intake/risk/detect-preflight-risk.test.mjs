import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPreflightRisk } from "./detect-preflight-risk.mjs";

function result(overrides) {
  return { submitted_url: "https://example.cz/x", redirects: [], errors: [], warnings: [], status: "reachable", ...overrides };
}

test("a private-destination block on the first hop yields url_private_destination", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "blocked", errors: [{ code: "url_private_destination", message: "x" }] })] });
  assert.equal(flags[0].code, "url_private_destination");
  assert.equal(flags[0].effect, "security_review_required");
});

test("the SAME block on a redirect hop yields url_redirect_private_destination instead", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "blocked", redirects: [{ from: "a", to: "b", status: 302 }], errors: [{ code: "url_private_destination", message: "x" }] })] });
  assert.equal(flags[0].code, "url_redirect_private_destination");
});

test("credentials in URL yields url_contains_credentials at security_review_required", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "blocked", errors: [{ code: "blocked_url_credentials", message: "x" }] })] });
  assert.equal(flags[0].code, "url_contains_credentials");
  assert.equal(flags[0].effect, "security_review_required");
});

test("DNS failure codes all map to the single url_dns_failure flag", () => {
  for (const code of ["dns_not_found", "dns_timeout", "dns_temporary_failure", "dns_invalid_response"]) {
    const flags = detectPreflightRisk({ results: [result({ status: "unreachable", errors: [{ code, message: "x" }] })] });
    assert.equal(flags[0].code, "url_dns_failure");
    assert.equal(flags[0].effect, "needs_information", `${code} must be a low-key data-quality signal, not a security escalation`);
  }
});

test("a timeout status yields url_timeout with a low-severity effect (not security_review_required)", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "timeout" })] });
  assert.ok(flags.some((f) => f.code === "url_timeout"));
  assert.notEqual(flags.find((f) => f.code === "url_timeout").effect, "security_review_required");
});

test("a body_truncated warning yields url_response_too_large", () => {
  const flags = detectPreflightRisk({ results: [result({ warnings: [{ code: "body_truncated", message: "x" }] })] });
  assert.equal(flags[0].code, "url_response_too_large");
});

test("redirect loop and transport downgrade map to their own distinct codes", () => {
  const loop = detectPreflightRisk({ results: [result({ status: "blocked", errors: [{ code: "redirect_loop", message: "x" }] })] });
  assert.equal(loop[0].code, "url_redirect_loop");
  const downgrade = detectPreflightRisk({ results: [result({ status: "blocked", errors: [{ code: "redirect_transport_downgrade", message: "x" }] })] });
  assert.equal(downgrade[0].code, "url_redirect_transport_downgrade");
});

test("a TLS error code maps to url_tls_error regardless of the specific TLS error", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "blocked", errors: [{ code: "tls_expired_certificate", message: "x" }] })] });
  assert.equal(flags[0].code, "url_tls_error");
});

test("a clean, fully reachable result produces no flags at all", () => {
  const flags = detectPreflightRisk({ results: [result({})] });
  assert.deepEqual(flags, []);
});

test("an ordinary unreachable-with-no-specific-error result falls back to url_preflight_failed", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "unreachable", errors: [] })] });
  assert.equal(flags[0].code, "url_preflight_failed");
});

test("no flag here ever asserts editorial trust — HTTP success is never conflated with source credibility (§1.1)", () => {
  const flags = detectPreflightRisk({ results: [result({ status: "blocked", errors: [{ code: "url_private_destination", message: "x" }] })] });
  for (const flag of flags) assert.doesNotMatch(flag.explanation.toLowerCase(), /důvěryhodn|nezávisl|pravdiv/);
});
