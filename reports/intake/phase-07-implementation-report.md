# Phase 7 — web CTA, landing explanation, contribution UX

No `PHASE_007.md` mission document exists — Phase 7 was defined only as
the closing contract in `docs/missions/intake/PHASE_006.md` §42. This
report is scoped to that contract rather than a full phase-report
template, matching what was actually specified.

## Contract received (§42)

A functional Issue Form, a production GitHub intake workflow, a
canonical template URL, public safety wording, and a status model — no
authorization or dossier-generation capability. All present and verified
by Phases 5-6.

## What was implemented, against each contract item

| Contract item | Implementation |
|---|---|
| CTA on landing page | New section on `templates/index.html`, right before the FAQ (a natural "how do I get involved → here are the questions" flow) |
| CTA on dossier index | `templates/dossiers-index.html`, after the directory's own explanatory paragraphs |
| Contribution page | `content/dokumentace/verejny-podnet.md` — renders the existing `docs/intake/public-submission.md` on-site via the repo's established `docs-viewer.html` mechanism (same pattern as `CONTRIBUTING.md`/`SECURITY.md`), zero content duplication |
| Public-intake explanation | The rendered page above, plus a short, hand-written intro summary orienting the reader before the full text |
| Warning before navigating to GitHub | Inline text under every CTA: "Otevře veřejnou GitHub issue — dlouhodobě dohledatelnou, ne důvěrný kanál. Neposílejte tam neveřejné dokumenty ani citlivé podklady." |
| External-link semantics | `rel="external"` + the site's existing ↗ marker convention (matches footer/other off-site links; no `target="_blank"`, matching the site's existing convention of never opening new tabs) |
| Mobile-first UI, accessibility | Reuses existing button/focus-visible/spacing classes already used elsewhere on the same pages; `min-h-11` touch target verified ≥44px by a real Playwright mobile-viewport test; full `a11y-sweep.spec.mjs` (axe-core, WCAG 2.1 AA) re-run, 27/27 passing, no regression |
| Data-driven URL | `config.toml`'s new `extra.intake_issue_form_url` — the single canonical value every CTA reads; never a second hardcoded copy of the template query string |
| No hardcoded duplicate text | One shared Tera macro, `ui::intake_cta(heading, lead)` (`templates/macros/ui.html`) — the URL and the safety-warning paragraph exist in exactly one place in the codebase, rendered twice, not authored twice. A dedicated Playwright test (`tests/e2e/intake-cta.spec.mjs`) asserts the warning text is byte-identical across both pages |
| E2E link validation | `tests/e2e/intake-cta.spec.mjs` (10 tests × 2 Playwright projects = 19 executed, 1 correctly skipped) — asserts the exact href, `rel="external"`, presence of the safety warning, absence of any secure/anonymous/whistleblower-channel claim, the explanation link resolving to a live page, and byte-identical warning text between both CTA instances |

## Deliberate deviation: no tracking

§42 lists "tracking bez osobních dat" (tracking without personal data) as
a Phase 7 requirement. **Not implemented, on purpose.** This site's own
FAQ already makes an unconditional promise: *"Sledujete návštěvníky? Ne.
Web je statický, bez analytiky, bez cookies a bez přihlašování."* Adding
any tracking mechanism — even one that collects no personal data — would
contradict a commitment already made directly to every visitor, and
would be exactly the kind of "claimed one thing, built another" the
constitution's §8 forbids (applied here in reverse: a promise the site
makes that a feature would then quietly violate). If click-level
visibility into CTA usage is ever genuinely needed, it requires its own
explicit, separate decision to change that FAQ answer first — not a
silent addition during an unrelated phase.

## Verification

`npm run build` (38/38 steps, includes `lint:component-reuse` — both
templates already imported `macros/ui.html`, so the new macro added no
new import surface — and `verify:full-pages`/`verify:jsonld`, neither of
which flagged anything). `npx playwright test tests/e2e/intake-cta.spec.mjs`
(19 passed, 1 skipped by design) and `npx playwright test
tests/e2e/a11y-sweep.spec.mjs --project=desktop` (27/27 passed) — both
run against a real Chrome instance via Playwright (the interactive
claude-in-chrome browser tool was unavailable in this environment: the
extension reported not connected).

## Files changed

`config.toml` (new canonical URL); `templates/macros/ui.html` (new
`intake_cta` macro); `templates/index.html`, `templates/dossiers-index.html`
(CTA wired in); `content/dokumentace/verejny-podnet.md` (new — renders
`docs/intake/public-submission.md` on-site); `content/dokumentace/*.md`
(8 files, `weight` renumbered by +1 to make room for the new page at
weight 3, right after "Jak přispívat"); `tests/e2e/intake-cta.spec.mjs`
(new).

## Known limitations

- No live-browser interactive verification (claude-in-chrome extension
  not connected in this environment) — verification relied on rendered
  HTML inspection plus real Playwright browser runs, which do exercise
  actual page rendering, layout, and axe-core accessibility scanning,
  just not an interactive click-through.
- The base GitHub org/repo URL (`https://github.com/korczis/vomaste.cz`)
  remains hardcoded in multiple places across the codebase (footer, hero
  fork corner, this phase's own macro) — an existing, pre-Phase-7
  convention this phase did not attempt to centralize; only the
  intake-specific template query string got a canonical single source,
  per the contract's actual scope.
