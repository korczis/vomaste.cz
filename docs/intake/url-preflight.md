# URL preflight (Phase 4)

Reference for `scripts/intake/preflight/*`. See
`docs/intake/security-boundary.md` for the SSRF threat model this
implements, `docs/adr/ADR-public-dossier-intake.md` for the architecture
decision, and `docs/intake/local-processor.md` for the `--preflight` CLI
flag this plugs into.

## Purpose

A small, bounded technical probe of one URL a submitter listed: is it
syntactically supported, can a request be made to it safely, where does
it redirect, what HTTP status/content-type did the server declare, and
what limited `<title>`/`<meta>` values did the page itself declare.
Nothing more.

## Non-goals

Source trust scoring, source-family classification, article body
extraction or archiving, screenshots, PDF parsing/OCR, browser
automation or JavaScript rendering, paywall bypass, a `robots.txt`
crawler, recursive link discovery, AI summarization, claim extraction,
or editorial verification of any kind. `editorial_verification` in every
result is the literal string `"not_performed"` — structurally, not by
convention (the manifest schema uses `const`).

## The four inequalities (§1.1)

Written into code, tests, docs, and the report, always together:

```text
HTTP 200 ≠ trusted source
reachable ≠ independent source
metadata extracted ≠ article read
URL submitted ≠ claim verified
```

## Protocol policy

Allowlist, not blacklist (`scripts/intake/preflight/constants.mjs`
`ALLOWED_PROTOCOLS`): only `https:` and `http:`. `http:` is not
auto-blocked but is flagged `insecure_transport`; there is no automatic
upgrade to `https:` unless the server itself redirects.

## Port policy

`ALLOWED_PORTS = [80, 443]` — everything else is rejected
(`url_nonstandard_port`), including an explicit list of common
internal/administrative ports (22, 3306, 6379, 8080, …) called out for
clarity even though the allowlist alone already excludes them.

## Hostname policy

`scripts/intake/preflight/classify-hostname.mjs` blocks: empty hostname,
control characters/whitespace, over-length hostname/label, single-label
hostnames, and a fixed suffix list (`.local`, `.localhost`, `.internal`,
`.home`, `.lan`, `.test`, `.invalid`, `.example`). An IP-literal hostname
(any syntax — see below) routes straight to IP classification instead.

**This layer is not the real defense** — §6.3's own words: "Nespoléhej
pouze na hostname blacklist. IP classification musí stačit." A hostname
like `localhost.localdomain` isn't in the suffix list at all; it's
blocked because it *resolves* to a loopback address, which the next
layer catches regardless of what the name looks like
(`preflight-url.test.mjs`'s dedicated test for exactly this case).

## IP classification (`classify-ip.mjs`) — the real gate

Every IPv4/IPv6 range from PHASE_004.md §6.1/§6.2, plus:

- **Alternative IPv4 representations** (`127.1`, `2130706433`,
  `0x7f000001`, `0177.0.0.1`) are parsed with the historical
  `inet_aton`-style rules and classified by their canonical value — never
  slip past as "not a recognized IP". WHATWG `URL` itself already
  canonicalizes most of these during parsing (verified directly against
  V8's implementation); `classify-ip.mjs`'s own parser is defense in
  depth for any value reaching it by another path.
- **IPv4-mapped IPv6** (`::ffff:127.0.0.1`) is classified by its embedded
  IPv4, not treated as a distinct/unknown address family.
- **Metadata endpoints** (`169.254.169.254`, `fd00:ec2::254`,
  `metadata.google.internal`, `metadata.azure.internal`) are blocked
  explicitly, on top of the range-based block that would already catch
  the IP literals.
- **An address this module cannot parse returns `null`** — every caller
  treats `null` as BLOCK, never "assume public" (§1.2).

Ranges are checked **most-specific-prefix-first** — `255.255.255.255/32`
(broadcast) must win over the broader `240.0.0.0/4` (reserved) it also
falls inside; naive declaration-order checking gives the wrong category
for any address covered by more than one range (a real bug caught by
`classify-ip.test.mjs` during implementation, fixed before this shipped).

## DNS resolution and rebinding defense (§7)

`resolve-hostname.mjs`'s production adapter resolves both A and AAAA.
`validate-destination.mjs` then requires **every** resolved address to be
public — a single private/loopback/metadata answer blocks the whole
destination (`private_destination`), and a **mix** of public and
non-public answers blocks too (`mixed_public_private_dns`) — never "pick
the public one and proceed."

**Why a DNS precheck alone is not enough**: a second, independent DNS
lookup at connection time could return a different address than the one
just validated (DNS rebinding). `request-once.mjs` never lets that
happen — it passes a custom `lookup` function to Node's `http`/`https`
client that **always returns the exact address `validate-destination.mjs`
already classified as public**, so there is no second resolution for the
connection to rebind through. The original hostname is still used for
the `Host` header and TLS SNI, so certificate validation is unaffected.
After the socket connects, `socket.remoteAddress` is compared against the
pinned address again — a second, independent check (§11): if the
`lookup` override were ever bypassed by a future refactor, this one still
blocks.

## Redirect policy (§9)

Maximum 3 redirects. **Every hop re-runs the entire pipeline from
scratch** — protocol/port/credentials/hostname policy, DNS resolution, IP
classification, pinned request — via the same `validateOneHop` function
the initial URL uses (`preflight-url.mjs`), never inheriting trust from
the host that issued the redirect. An `https:` → `http:` transport
downgrade is blocked (`redirect_transport_downgrade`); an `http:` →
`https:` upgrade is fine. A redirect loop (revisiting a URL already seen
in this chain) is detected and blocked.

## HTTP request policy (§8)

GET only. Fixed, minimal headers (`User-Agent:
vomaste.cz-source-preflight/1.0 (+https://vomaste.cz/)`, `Accept`,
`Accept-Encoding: identity`) — never cookies, referer, authorization, or
any user-identifying data. Five separate timeouts (DNS 3s, connect 5s,
headers 8s, body 5s, total 12s) rather than one blanket timeout. Response
body capped at 256 KiB, enforced by counting actual bytes read from the
stream — **never trusting the declared `Content-Length`** (§8.5): a
server can declare 5 bytes and send 50MB, and the cap still holds because
truncation happens on real bytes seen, not the header.

## Metadata extraction (§12)

A fixed allowlist, nothing else, ever: `title`, `canonical_url` (from
`<link rel="canonical">`), `og_title`, `og_site_name`, `og_type`,
`description`, `article_published_time`, `article_modified_time`. Only
for `text/html`/`application/xhtml+xml`; everything else (PDF, JSON,
binary) is recorded by content-type/status only, body untouched beyond
the 256 KiB cap already in place. The extractor
(`extract-html-metadata.mjs`) is a small bounded-regex parser (every
pattern length-capped, `{0,N}` not `*`) — not a real HTML parser, and
deliberately never executes `<script>` content or resolves anything
against a `<base>` tag (the raw `href` attribute is returned as-is).
Duplicate `<link rel="canonical">` tags: the first one wins,
deterministically.

## Concurrency and limits (§16)

At most `MAX_URLS_PREFLIGHTED = 20` of the (already-capped-at-100 from
Phase 2) submitted URLs are actually attempted; the rest are marked
`not_attempted` with a `not_attempted_limit` warning — never silently
dropped. Concurrency 3, at most 1 in-flight request per hostname, no
automatic retry.

## Result model (§14)

`source_preflight.results[]`, one entry per submitted URL, always
present (even fully offline — see below) with `status` (`reachable` /
`unreachable` / `blocked` / `timeout` / `invalid` / `unsupported` /
`partial` / `not_attempted`) kept **separate** from `policy_decision`
(`allowed` / `blocked` / `not_attempted`) — a safe destination whose
server happens to be down is `unreachable`+`allowed`, never confused with
an unsafe destination that was `blocked`.

## Risk-flag integration (§15)

`scripts/intake/risk/detect-preflight-risk.mjs` translates every result
into the same risk-flag vocabulary Phase 3 established — see
`docs/intake/risk-classification.md`'s table for the 17 preflight-specific
codes and their severities/effects. A genuine safety block (private
destination, mixed DNS, credentials, metadata endpoint, redirect-to-private,
TLS error) is `security_review_required`; an ordinary "article
temporarily unreachable" (timeout, DNS failure, unsupported content
type) stays a low-key `needs_information`/`audit_only` observation — §15.1's
own distinction between "unsafe URL" and "safe destination, server
unavailable."

## Offline by default (§23.1)

`process-issue.mjs` never touches the network unless `--preflight` is
passed explicitly. Without it, every submitted URL gets a
`not_attempted`/`not_attempted` result (`offlinePreflightResult` in
`preflight-urls.mjs`) — the manifest shape is identical either way, only
the content differs. `npm run build`/`npm test` never pass `--preflight`,
so neither ever touches the network (confirmed by
`preflight-security-gates.test.mjs`).

## Test adapter vs. production adapter

- **DNS**: `resolve-hostname.mjs`'s `createProductionDnsAdapter` (real
  `node:dns`) vs. `testing/mock-dns-adapter.mjs`'s fixture-driven adapter
  — same `resolveHostname(hostname) => {addresses, resolvedAt}` shape.
- **HTTP**: `request-once.mjs` is the one real transport; tests point it
  at `testing/mock-http-server.mjs`, a local loopback-only server, never
  the public internet.
- **Destination policy in tests**: `validate-destination.mjs`'s
  `testAllowedPrivateAddresses` parameter (only settable by a test file
  calling the function directly) allow-lists the *exact* mock server
  address — never a whole private range — so a redirect to a genuinely
  different private address (the actual SSRF case under test) is still
  blocked even inside a test that's talking to a loopback server. See
  `docs/intake/security-boundary.md` for why this is safe.

## Error codes

`scripts/intake/preflight/errors.mjs`'s `PREFLIGHT_ERROR_CODES` — one
stable code per failure mode, across eight error classes
(`UrlPolicyError`, `DnsResolutionError`, `DestinationBlockedError`,
`NetworkTimeoutError`, `TlsError`, `RedirectPolicyError`,
`ResponseLimitError`, `MetadataExtractionError`). Report and workflow
logic branch on these codes, never on error message text (§22.4).

## Known limitations

- No `robots.txt` handling — deliberately out of scope; this fetches
  exactly one submitter-specified URL and a small HTML prefix, never
  crawls further (§18).
- No TLS certificate integration test against a real expired/self-signed
  certificate in the automated suite (would need a locally-generated test
  certificate authority) — `rejectUnauthorized: true` is asserted
  statically instead (`preflight-security-gates.test.mjs`).
- No IPv6 connectivity test against a real loopback IPv6 socket in CI
  (environment-dependent) — IPv6 classification itself is fully unit
  tested (`classify-ip.test.mjs`).
- HTML entity decoding covers a fixed set of common entities, not the
  full HTML5 named-character-reference table.
