---
name: commit
description: Make a well-formed commit in vomaste.cz — conventional message, correct build gate for the situation (pre-commit fast subset vs. full npm run build before merge/push), and the right coop-bus report for your role.
argument-hint: [optional: short description of the change]
---

## Before committing

If you haven't run the `bootstrap` skill yet this session, do that
first — this skill assumes you already know your role (ORCH direct vs.
worker-in-worktree) and have confirmed any content change is inside
authorized scope (see `dossier-entry` for content changes specifically).

## Message format

This repo's history is conventional-commit-style (not strictly
enforced, but consistent — match it):

```
<type>(<scope>): <short summary, imperative, no trailing period>

<optional body — why, not what; the diff already shows what>

Co-authored-by: Claude Sonnet 5 <noreply@anthropic.com>
```

Common `type`s seen in this repo's history: `feat`, `fix`, `docs`,
`chore`, `refactor`. `scope` is whatever's most specific and useful —
`hero`, `shell`, `coop`, `tooling`, `dossier`, `policy`, `seo`, a
dossier slug, etc. Keep the summary line short; put reasoning in the
body if it's non-obvious (why this approach, not a restatement of the
diff).

## What actually gates the commit

- **`git commit` itself**: runs `.githooks/pre-commit` automatically
  (installed via `npm ci`/`hooks:install`) — the fast, pure-data
  validator subset. This is real but partial: it does not build CSS/JS,
  does not run `zola build`, and does not include
  `lint:historical-coupling` (intentionally, while the de-specialization
  migration is in progress). A hook failure means a real, cheap-to-find
  defect — fix it, don't fight it.
- **Before a review-request (worker) or a merge/push (ORCH)**: run the
  full `npm run build` yourself and confirm it exits clean. The
  pre-commit hook passing is not evidence of this — they check different
  things. Never claim "build is green" from the hook output alone.
- **`--no-verify`**: a real git escape hatch, not forbidden outright, but
  never use it silently — if you ever need it, say so explicitly (to the
  user, and on the coop bus if you're in a worktree), and still run
  `npm run build` before anything gets merged or pushed.

## Reporting the commit (role-dependent)

- **Worker in a task worktree**: after committing, send `progress` (or
  `review-request` once `npm run build` is green and you're ready to
  hand off) on the coop bus — see `docs/coop/PROTOCOL.md`. Never edit
  `docs/coop/TASKS.md` yourself; that's ORCH's job.
- **ORCH doing direct infra/docs work on `master`** (the precedent for
  small, non-content changes — see recent history: domain setup,
  license, this bootstrap tooling): send a `note` before starting
  anything that touches a file another active task might also touch
  (check `scripts/coop/coop.sh status` first), and a `done`/`deploy`
  message after committing/pushing, so concurrent instances aren't
  surprised by a diff they didn't expect.
- **Anything touching content about a real person**: the commit message
  doesn't need to restate the authorization, but the change itself must
  already be scope-checked per `dossier-entry`'s step 0 — a well-formed
  commit message on out-of-scope content is still out-of-scope content.

## Pushing

Pushing `master` is the deploy (`.github/workflows/deploy.yml` → GitHub
Pages) for a public site about real, identifiable people. Confirm with
whoever you're working with before pushing unless you've been given
standing authorization to do so — this mirrors the general rule that
hard-to-reverse, externally-visible actions get a check-in, not just a
green build.
