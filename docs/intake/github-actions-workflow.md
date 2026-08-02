# GitHub Actions intake workflow (Phase 6)

`.github/workflows/dossier-intake.yml` — the first production GitHub
orchestration layer over the local intake pipeline built in Phase 2-5.
See `docs/adr/ADR-public-dossier-intake.md` for the architecture
decision, `reports/intake/phase-06-workflow-audit.md` for how this
workflow's conventions were derived from the repo's existing
`deploy.yml`, and `reports/intake/phase-06-implementation-report.md` for
the full phase report.

## Triggers

`issues: [opened, edited, reopened, labeled, unlabeled, closed]` — the
full action set (not just the MVP `opened/edited/reopened/labeled`
subset), since `unlabeled` and `closed` are needed for label-drift
correction (§13.5) and closed-issue behavior (§29). Every event is
processed idempotently — see "Idempotence" below.

## Permissions

```yaml
permissions:
  contents: read
  issues: write
```

Nothing else. No `pull-requests`, `deployments`, `pages`, `id-token`,
`packages`, or `actions` write permission — enforced both by this literal
YAML and mechanically by `scripts/ci/validate-intake-workflow.mjs`
(`npm run intake:validate-workflow`, part of `npm run build`). An issue
event can never trigger a deploy, a branch, a commit, or a pull request —
this workflow has no permission to do any of them.

## Steps

1. **Checkout** — `persist-credentials: false` (no accidental Git write
   capability), default branch's own commit (never a ref derived from
   issue content).
2. **Setup Node** — `node-version: 24`, matching `deploy.yml`'s existing
   (unversioned-file) convention; no new `.nvmrc` introduced for one
   workflow.
3. **`npm ci`**.
4. **Verify checkout is clean** (pre-processing sanity check).
5. **Process intake event** — `scripts/intake/process-github-event.mjs`.
   **No `GITHUB_TOKEN` in this step's environment.** Reads only
   `$GITHUB_EVENT_PATH` (the raw payload, adapted through
   `scripts/intake/adapters/github-event.mjs`'s allowlist — see
   `docs/intake/issue-form-contract.md` for the local parser this feeds
   into). Runs `--preflight` (real, SSRF-hardened URL checks — see
   `docs/intake/url-preflight.md`/`security-boundary.md`). Always writes
   `$RUNNER_TEMP/vomaste-intake/_status.json` with a classified outcome,
   even on failure — the publishing step reads only this file, never the
   raw event again.
6. **Ensure no repository writes** (`git status --porcelain` must be
   empty) — `if: always()`, so this still runs and is still checked even
   after an earlier failure.
7. **Validate artifact safety** —
   `scripts/intake/validate-artifact-safety.mjs`, `if: always()`. Scans
   for token patterns, `Authorization:` headers, URL credentials, private
   keys, unexpected files.
8. **Upload workflow artifact** — gated specifically on step 7's own
   success (`if: always() && steps.safety.outcome == 'success'`), **not**
   a bare `always()` — an artifact that failed safety validation, or was
   never validated at all, is never uploaded. Named
   `dossier-intake-issue-<number>-run-<run id>` (never issue title/body),
   `retention-days: 14`.
9. **Publish result** — `scripts/intake/publish-github-result.mjs`,
   `if: always()`. **This is the only step with `GITHUB_TOKEN`.** Reads
   exclusively the already-sanitized `_status.json`/`manifest.json` the
   processing step wrote — never the raw payload. Creates/updates the
   managed comment, syncs labels, decides whether to ping the owner.

## Token isolation

`GITHUB_TOKEN` exists in exactly one step's environment (step 9). Step 5
(the one step that ever handles arbitrary, untrusted issue content) has
no network capability and no credential at all —
`scripts/intake/network-guard.test.mjs` mechanically confirms neither
`process-github-event.mjs` nor any module it imports (other than the
three designated transport adapters, none of which it touches with
`--preflight` off... and even with `--preflight` on, only the
already-hardened Phase 4 preflight transport, never the GitHub API) can
reach the network with a credential.

## Comment idempotence

One managed comment per issue, identified by `<!-- vomaste-intake-report:v1 -->`
as the literal first line **and** authored by the trusted
`github-actions[bot]` account — both conditions required
(`scripts/intake/github/find-managed-comment.mjs`). A marker pasted into
a comment by anyone else is never trusted. Two managed comments (should
never happen, but handled): the oldest is kept up to date, the rest are
left alone and surfaced as a `duplicateBotComments` diagnostic — never
auto-deleted. An oversized report (> 50 KiB) is replaced with a condensed
version linking to the workflow run/artifact, never silently truncated.

## Label state projection

See `docs/intake/github-labels.md` for the full label table. Labels are
computed fresh from the current `intake_status` every run
(`scripts/intake/github/sync-labels.mjs`) — never treated as
authoritative state, never manually promoted to imply authorization. A
missing repository label degrades that one label application to
`partial` with a diagnostic; it never blocks the rest of the run.

## Owner notification

`scripts/intake/github/determine-notification.mjs`. The "previous state"
needed for anti-spam is read from the issue's own current labels before
this run's sync — no separate persistence layer. Pings only on a genuine
transition into `triage` or `security_review_required` from a different
prior state (or none at all); never repeats on a rerun that stays in the
same state. The only live `@mention` this workflow ever writes is the
canonical owner (`data/maintainers.toml`); every mention appearing in
submitted text stays inside a fenced code block (Phase 2's own
mention-neutralization, unchanged).

## Failure behavior

| Outcome | Comment | Labels | Ping |
|---|---|---|---|
| Valid submission | full or (if security-review) reduced report | `intake:<status>` + `authorization:pending-owner` + `publication:blocked` | per policy above |
| Invalid submission | safe explanation, no stack trace | `intake:invalid` only | never |
| Ignored (unsupported action) | none | none | never |
| Internal error | safe "processing failed" message + run ID | unchanged | never |
| Comment publish itself fails | — | — | workflow step fails visibly (§15.4), never a silent success |

## Stale-event guard

Before publishing, the publishing step re-fetches the issue's current
`updated_at` and compares it to the event that triggered this run
(`scripts/intake/github/publish-intake-result.mjs`). If the issue has
been updated again since, this run is `stale_event_skipped` — it never
overwrites a newer report with an older one. `cancel-in-progress: true`
on the issue-scoped concurrency group already cancels most stale runs
before they even reach this point; the guard covers the remaining
race where an older run finishes just before cancellation takes effect.

## Closed-issue behavior

Closing an issue is a human, out-of-band act, never interpreted as
rejection or authorization (`scripts/intake/github/handle-closed-issue.mjs`,
§29). The report is updated (never deleted) with a note; the active
`intake:*` state label is removed (closed isn't itself one of the
tracked states); `authorization:pending-owner` and `publication:blocked`
are left exactly as they were.
