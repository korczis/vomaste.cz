# Phase 4 — Implementation report

**Datum**: 2026-08-02 · **Stav**: VERIFIED
**Mise**: [docs/missions/intake/PHASE_004.md](../../docs/missions/intake/PHASE_004.md) · **ADR**: [docs/adr/ADR-public-dossier-intake.md](../../docs/adr/ADR-public-dossier-intake.md)
**Base commit**: `2d3b02de` (master, Phase 3 merged)

## Phase 3 baseline

```text
PHASE_03_BASELINE = PASS
INTAKE_FIXTURE    = PASS (npm run intake:fixture)
INTAKE_TESTS      = PASS (244/244, pre-Phase-4)
FULL_BUILD        = PASS
```

Working tree was clean at the start of this phase (`task/INTAKE`
worktree, continued from Phase 3).

## Transport decision

Node's built-in `http`/`https` modules with a custom `lookup` function,
not `fetch()` — `fetch()` provides no way to pin a connection to a
pre-validated IP address independent of a second internal DNS lookup, so
it cannot close the DNS-rebinding window by itself (§4.2's own warning:
"nepředstírej, že DNS precheck sám řeší DNS rebinding"). No new
dependency added — `undici`/a custom dispatcher was evaluated and
rejected as unnecessary; Node core's `lookup` option on `http.request`
already provides exactly the control needed (pin the connect address,
keep the original hostname for `Host`/SNI).

## DNS strategy

`resolve-hostname.mjs` resolves both A and AAAA via `node:dns/promises`,
each with its own timeout via `Promise.race`, and reports 4 distinct
failure classes (`dns_not_found`, `dns_timeout`, `dns_temporary_failure`,
`dns_invalid_response`). `validate-destination.mjs` requires **every**
resolved address to be public; a single non-public answer, or a mix,
blocks the whole destination.

## Rebinding defense

See `docs/intake/security-boundary.md` in full. Summary: `request-once.mjs`'s
custom `lookup` callback always returns the exact address
`validate-destination.mjs` validated — no second DNS resolution for the
connection to rebind through — plus an independent
`socket.remoteAddress` check after connect as a second, redundant gate.

## IP policy

Full §6.1/§6.2 range tables in `classify-ip.mjs`, plus:

- Alternative IPv4 representations (`127.1`, `2130706433`, `0x7f000001`,
  `0177.0.0.1`) parsed with historical `inet_aton` semantics.
- IPv4-mapped IPv6 classified by its embedded IPv4.
- Explicit metadata-endpoint blocks (169.254.169.254, fd00:ec2::254,
  metadata.google.internal, metadata.azure.internal) beyond the
  range-based ones.
- Ranges checked **most-specific-prefix-first** (bug found and fixed —
  see "Bugs found" below).
- An unparseable address returns `null`; every caller treats that as
  BLOCK.

## Redirect policy

Max 3 hops. Every hop re-runs parse → hostname policy → DNS →
destination validation → pinned request from scratch
(`follow-redirects.mjs`'s injected `validateOneHop`, shared with the
initial-URL code path in `preflight-url.mjs` — one implementation, not
two). Scheme downgrade (`https→http`) blocked. Loop detection via a
visited-URL set. A hop failure still reports the chain accumulated up to
that point (fixed during implementation — see "Bugs found").

## Response limits

256 KiB body cap enforced on actual bytes read from the stream, never on
the declared `Content-Length` (a server can lie about it — verified by
`request-once.test.mjs`'s wrong-content-length test, which found that
Node's own HTTP/1.1 client parser rejects such malformed framing as a
protocol error before this module's logic even runs — an additional,
independent layer of the same "don't trust Content-Length" property).
Five separate timeouts (dns/connect/headers/body/total).

## Metadata extraction

Fixed 8-field allowlist (`title`, `canonical_url`, `og_title`,
`og_site_name`, `og_type`, `description`, `article_published_time`,
`article_modified_time`), bounded-regex extraction (every pattern
length-capped), only for `text/html`/`application/xhtml+xml`. No real
HTML parser dependency added — evaluated and rejected as unnecessary for
an already-256KiB-capped input.

## Schema changes

`schema_version` `0.2.0` → `0.3.0`. New required top-level
`source_preflight` (version, checked_at, results[]) — each result's
shape matches §14 closely, with `editorial_verification` as a schema
`const` (`"not_performed"`) so no other value is even expressible.

## Test matrix

| Area (PHASE_004.md §19-§21) | File(s) | Count |
|---|---|---|
| IP classification (SSRF cases + alternative representations) | `classify-ip.test.mjs` | 25 |
| URL syntax policy | `parse-url.test.mjs` | 13 |
| Hostname policy | `classify-hostname.test.mjs` | 12 |
| Destination validation (mixed/private/metadata/unclassifiable) | `validate-destination.test.mjs` | 10 |
| Redirect orchestration | `follow-redirects.test.mjs` | 11 |
| HTML metadata extraction | `extract-html-metadata.test.mjs` | 12 |
| HTTP transport robustness (real mock server) | `request-once.test.mjs` | 11 |
| Full-pipeline integration + SSRF matrix (real mock server + mock DNS) | `preflight-url.test.mjs` | 43 |
| List-level orchestration (cap/concurrency/per-host) | `preflight-urls.test.mjs` | 6 |
| Static security gates | `preflight-security-gates.test.mjs` | 13 |
| Risk-flag mapping | `risk/detect-preflight-risk.test.mjs` | 11 |
| **Phase 4 total** | 11 files | **167** |
| Phase 2+3 (network-guard.test.mjs updated for the preflight exception) | — | 258 |
| **Combined `npm run test:intake`** | 38 files | **425** |

All network-touching tests run against a real local loopback mock HTTP
server (`testing/mock-http-server.mjs`) and a fixture-driven mock DNS
adapter (`testing/mock-dns-adapter.mjs`) — never the public internet.

## Performance

```text
Mock request round-trip:            single-digit ms
20 URLs, concurrency 3:              bounded by per-URL timeout, not serial
Oversized-response abort:            immediate on exceeding 256 KiB
Redirect chain (3 hops):             each hop re-validated, still fast (ms-scale against mock server)
```

Not a scraping throughput target — the mission's own framing (§29:
"Cílem není scraping throughput. Cílem je bounded, předvídatelné
chování.").

## Security guarantees (explicit confirmation)

- **Fail-closed SSRF policy**: confirmed for every §20 case (IPv4/IPv6
  literals including alternative representations, DNS-resolved
  private/mixed/metadata, blocked hostname suffixes, defense-in-depth IP
  classification for a hostname not in the suffix list, and every
  redirect variant) via `preflight-url.test.mjs`.
- **No credentials sent, logged, or reported unredacted**: blocked
  outright at the URL-policy layer; the Markdown report additionally
  redacts embedded credentials and known-sensitive query parameters for
  defense in depth.
- **No cookies/session state**: verified directly (`request-once.test.mjs`'s
  header-inspection test).
- **TLS never weakened**: `rejectUnauthorized: true` explicit, statically
  gated against ever being set to `false` anywhere.
- **Build/tests never touch the network**: `preflight-security-gates.test.mjs`
  plus the updated `network-guard.test.mjs`.
- **Test-only bypasses are structurally unreachable from production**:
  `testAllowedPrivateAddresses`/`testAllowedSuffixes`/`testExtraAllowedPorts`
  confirmed absent from `process-issue.mjs` by static scan, and even
  where used in tests, `testAllowedPrivateAddresses` only ever allow-lists
  the exact mock-server address, never a whole private range.

## Bugs found and fixed during implementation

Both would have been real security defects in production, not cosmetic
issues — found by the test suite itself, not by manual review:

1. **`validate-destination.mjs` blocked every public address.**
   `result?.category ?? "unclassifiable"` treated the legitimate `null`
   category a public address carries the same as "couldn't classify at
   all," so every public IP was misclassified as unclassifiable and
   therefore blocked. Fixed by checking `result === null` explicitly
   instead of relying on `??` across a field that is legitimately
   nullable. Caught by `validate-destination.test.mjs`'s first test.
2. **IP-range checks used declaration order instead of prefix
   specificity.** `255.255.255.255/32` (broadcast) is also covered by
   the broader `240.0.0.0/4` (reserved) — checking ranges in the order
   §6.1 lists them means the broad range matches first and the address
   gets mislabeled (still blocked, but with the wrong category, which
   would mislabel it in reports/telemetry). Fixed by sorting ranges by
   prefix length descending before checking. Caught by
   `classify-ip.test.mjs`.

## Commands run

```text
npm run intake:fixture             → OK (offline)
npm run intake:preflight-fixture   → OK (mock DNS, all 4 fixture URLs correctly blocked as private_destination)
npm run test:intake                → 425/425 pass
npm run build                      → OK (107s)
git diff --check                   → clean
git diff -- AGENTS.md data/authorizations.toml .github/workflows → empty
Manual: node scripts/intake/process-issue.mjs ... --preflight against a real (nonexistent) fixture
  domain → real node:dns correctly returned dns_not_found, proving the
  production DNS adapter itself works end to end.
```

## Files changed

Created: `scripts/intake/preflight/*.mjs` (13 production modules),
`scripts/intake/preflight/testing/*.mjs` (2 test-infra modules),
`scripts/intake/preflight/*.test.mjs` (11 test files),
`scripts/intake/risk/detect-preflight-risk.mjs` (+test),
`scripts/intake/run-preflight-fixture.mjs`, `docs/intake/url-preflight.md`,
`docs/intake/security-boundary.md`, this report.

Modified: `schemas/intake/intake-manifest.schema.json` (`source_preflight`,
schema version bump), `scripts/intake/constants.mjs` (version bump),
`scripts/intake/build-intake-manifest.mjs` (`sourcePreflight` param),
`scripts/intake/process-issue.mjs` (async conversion, `--preflight` flag,
preflight wiring — the production DNS adapter is constructed only inside
the `preflight` branch), `scripts/intake/run-fixture.mjs` (async),
`scripts/intake/render-intake-report.mjs` (§26 report section, URL
redaction), `scripts/intake/risk/constants.mjs` (17 new flag codes),
`scripts/intake/risk/classify-intake-risk.mjs` (`sourcePreflight` param),
`scripts/intake/network-guard.test.mjs` (preflight exception, precisely
scoped), `scripts/intake/process-issue.test.mjs` /
`negative-authorization.test.mjs` / `build-intake-manifest.test.mjs` /
`render-intake-report.test.mjs` (updated for the new async signature and
`sourcePreflight` parameter), `docs/intake/intake-manifest.md` /
`local-processor.md` (Phase 4 updates), `package.json` (2 new scripts, 2
new test globs), `docs/adr/ADR-public-dossier-intake.md` (decision-log
entry, status stays PROPOSED).

No change to `AGENTS.md`, `data/authorizations.toml`,
`.github/workflows/`, `scripts/data/validate.mjs`, `scripts/dossier/*`,
or any file under `data/dossiers/**`/`content/**`.

## Deviations from Phase 1-3

See the ADR's 2026-08-02 Phase 4 decision-log entry for the three
documented deviations (no separate `limit-response.mjs` module; the
test-only private-destination bypass is address-exact rather than
range-wide; `intake:preflight-fixture` demonstrates the SSRF block path
rather than a real happy path, to stay offline and deterministic).

## Known limitations

- No `robots.txt` handling (deliberately, §18).
- No automated test against a real expired/self-signed TLS certificate
  (would need a generated local CA); `rejectUnauthorized: true` is
  pinned statically instead.
- No IPv6 loopback socket test in the automated suite (sandbox-dependent);
  IPv6 address classification itself is fully unit tested.
- HTML entity decoding covers common named/numeric entities, not the
  full HTML5 table.
- A future GitHub Actions integration (Phase 6) that runs preflight
  automatically against issue-submitted content is a different threat
  model (attacker-influenced trigger vs. today's human-invoked
  `--preflight`) and needs its own review before it ships — flagged
  explicitly in `docs/intake/security-boundary.md`, not addressed here.

## Phase 5 contract

Phase 5 (GitHub Issue Form + local end-to-end fixture, no GitHub write
operations) receives, unchanged from what Phase 2-4 already provide:

- A versioned form parser (`vomaste-intake-form:v1`), intake schema
  (`0.3.0`), matching, risk classification, and now safe URL preflight —
  all offline by default, `--preflight` opt-in for the last one.
- The exact `FORM_V1` heading/label/acknowledgement contract
  (`scripts/intake/constants.mjs`) that a real GitHub Issue Form YAML
  must render byte-for-byte to be parseable — this was Phase 2's own
  invented contract (no real Issue Form existed yet); Phase 5's job is to
  design the actual form and confirm it produces exactly this shape, or
  to update `FORM_V1` deliberately (never silently) if the real form
  needs to differ.
- Every existing invariant unchanged: still no GitHub API calls, still no
  authorization, still `publication_status: "blocked"` always, still
  `editorial_verification: "not_performed"` always.

Phase 5 should NOT touch `scripts/intake/preflight/**` at all — the URL
preflight contract is stable and complete for this mission's scope.
