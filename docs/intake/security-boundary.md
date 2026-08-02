# Intake security boundary (Phase 4)

What actually enforces the network-safety guarantees this whole intake
mission depends on, and why. See `docs/intake/url-preflight.md` for the
feature-level reference and `docs/adr/ADR-public-dossier-intake.md` for
the architecture decision.

## Why a DNS precheck alone doesn't stop SSRF

A naive implementation resolves a hostname, checks the address is public,
then opens a normal HTTP request to the *hostname* — which triggers a
**second**, independent DNS lookup inside the HTTP client. An attacker
who controls DNS for that hostname (or races a short TTL) can answer the
first lookup with a public address and the second with `127.0.0.1` or a
cloud metadata address. The check passes; the connection doesn't go where
it was validated to go. This is DNS rebinding, and it defeats "resolve,
check, then fetch(hostname)" every time.

**How pinning closes it**: `scripts/intake/preflight/request-once.mjs`
never lets the HTTP client resolve DNS a second time. It passes a custom
`lookup(hostname, options, callback)` function to Node's `http`/`https`
request options that unconditionally returns the *exact* address
`validate-destination.mjs` already validated — there is no second
resolution for an attacker to race or redirect. The socket connects to
that literal IP. The original hostname is still handed to the HTTP client
for the `Host` header and to the TLS layer for SNI/certificate hostname
verification, so none of that breaks.

## How the remote address is verified

Belt-and-suspenders, on top of pinning: once the TCP socket actually
connects, `request-once.mjs` reads `socket.remoteAddress` and compares it
against the pinned address again. A mismatch is a hard block
(`remote_address_mismatch`), not a warning. This check is deliberately
redundant with pinning — if a future refactor ever changed how the
`lookup` override is wired and accidentally let Node's own resolver back
in, this second check still catches an unexpected destination before any
response data is processed.

## Why the build never uses the network

`npm run build`/`npm test` must be deterministic, offline-reproducible,
and safe to run in any CI environment without an internet-egress
allowlist. `process-issue.mjs` enforces this structurally, not by
convention: the production DNS adapter
(`resolve-hostname.mjs`'s `createProductionDnsAdapter`) is only ever
constructed **inside** the `if (preflight)` branch of `processIssueEvent`
— a caller that never passes `preflight: true` never reaches the line
that would construct it, so there is no code path from `npm run
intake:fixture` (which never passes it) to any network primitive.
`preflight-security-gates.test.mjs` pins this down statically.

## GitHub Actions will need its own threat model

This phase's preflight runs from a developer's or CI's own machine
against a fixture or, with `--preflight`, real URLs a human explicitly
asked it to check. A **future** GitHub Actions workflow (Phase 6, not yet
implemented) that runs preflight automatically against attacker-influenced
issue content is a materially different threat model: it would need its
own review of egress restrictions, secrets exposure, log redaction, and
resource limits appropriate to an automated, internet-facing trigger —
this phase's SSRF hardening is necessary for that future work but not by
itself sufficient to declare it safe. That review is explicitly out of
scope here (§30) and must happen before any such workflow ships.

## How URL secrets are redacted

Two independent redaction points, for two different audiences:

- **The manifest** (`source_preflight` and the untouched
  `submission.submitted_source_urls_raw`) keeps the submitter's raw text
  exactly as typed — Phase 2's raw-preservation rule applies here too.
  Embedded credentials in a URL are never sent (`parse-url.mjs` blocks
  them outright, `blocked_url_credentials`), so they never reach the
  network layer at all.
- **The Markdown report** (`render-intake-report.mjs`'s
  `redactUrlForDisplay`) additionally strips any embedded
  username/password from displayed URLs and replaces known-sensitive
  query parameters (`token`, `access_token`, `auth`, `key`, `apikey`,
  `api_key`, `signature`, `sig`, `password`, `session`) with
  `[redacted]` before a URL is ever shown — defense in depth for the
  document a human will actually read, even though policy already
  prevents the credentialed case from ever being requested.

## Test-only bypasses: what exists, and why it's safe

Three parameters exist ONLY for test files to call the underlying
functions directly with — none is reachable from `process-issue.mjs`,
none is a CLI flag, none is an environment variable:

| Parameter | Where | What it allows |
|---|---|---|
| `testAllowedPrivateAddresses` | `validate-destination.mjs` | The *exact* address(es) named are treated as public-equivalent — never a whole private range. A redirect to a different private address is still blocked. |
| `testAllowedSuffixes` | `classify-hostname.mjs` | A specific hostname suffix (e.g. `.example`) is exempted from the blocked-suffix list. |
| `testExtraAllowedPorts` | `parse-url.mjs` | A specific port (the local mock server's ephemeral port) is exempted from the port allowlist. |

`preflight-security-gates.test.mjs` statically confirms `process-issue.mjs`
never references any of these three identifiers — the only way to use
them is to import the module directly from a `*.test.mjs` file, which is
precisely how every test in `scripts/intake/preflight/*.test.mjs` uses
them. This mirrors PHASE_004.md §19.3's own instruction: "Test harness
smí použít explicitní interní adapter dostupný pouze z test kódu. Žádný
env bypass použitelný v GitHub workflow."

## What this phase does NOT claim

Passing preflight (`status: "reachable"`, `policy_decision: "allowed"`)
is a technical fact about one HTTP response at one point in time. It is
not, and this documentation set never claims it is:

```text
HTTP 200 ≠ trusted source
reachable ≠ independent source
metadata extracted ≠ article read
URL submitted ≠ claim verified
```

`editorial_verification` is `"not_performed"` in every single result,
structurally (a JSON Schema `const`, not just a default value) —
Phase 4 cannot express any other value.
