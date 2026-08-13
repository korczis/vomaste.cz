---
name: commit
description: Make a well-formed commit in vomaste.cz — conventional message, correct build gate for the situation (pre-commit fast subset vs. full npm run build before merge/push), the right coop-bus report for your role, and awareness that on master a commit auto-pushes/deploys via .githooks/post-commit.
argument-hint: [optional: short description of the change]
disable-model-invocation: true
---

## Before committing

If you haven't run the `bootstrap` skill yet this session, do that
first — this skill assumes you already know your role (ORCH direct vs.
worker-in-worktree) and have confirmed any content change is inside
authorized scope (see `dossier-entry` for content changes specifically).

For content changes: the edit lives in canonical JSON
(`data/dossiers/**`); run `npm run data:build` before committing and
include the regenerated adapters (`content/dossiers/**`,
`content/entities/*.md`; other generated outputs are gitignored) in the
same commit — the pre-commit hook's `data:validate` + generated-content
parity gate will otherwise catch the drift.

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
- **On `master` specifically, right after that**: `.githooks/post-commit`
  automatically does fetch → rebase → the **full** `npm run build` →
  `git push origin master` (= deploy) → a `deploy` message on the coop
  bus. This is real automation, not just the fast pre-commit subset —
  see `docs/coop/PROTOCOL.md`, "Automatický push po commitu" for exactly
  what it does and does not do (it aborts cleanly on a rebase conflict
  or a red full build; it never pushes broken state). Consequence: on
  `master`, `git commit` is no longer a safe, reversible-until-you-push
  step — it typically pushes and deploys within seconds. Run the full
  `npm run build` yourself first if you want to know ahead of time
  whether the auto-push will succeed, rather than finding out from the
  hook's stderr after the fact.
- **In a worker worktree (`task/T-###`)**: the hook is a no-op (it only
  fires on `master`), so the old manual sequence still applies — run the
  full `npm run build` yourself before a `review-request`, and ORCH
  still explicitly merges into `master` (where the hook then takes over
  and pushes that merge commit).
- **If you're running `git commit` on `master` via the Bash tool**: the
  hook's full build takes ~2–4 minutes, run synchronously inside
  `git commit` itself — a default ~2-minute Bash-tool timeout can kill
  it mid-build before the push happens (seen firsthand: 2026-08-05,
  build was still green, just never got to push). The commit itself is
  never lost when this happens (`git log`/`git status` will show it sitting
  locally, ahead of `origin/master`) — but check `git status` after any
  `master` commit that might have hit a timeout, and if it's still
  unpushed, finish the job yourself: `npm run build && git push origin
  master` (with a generous timeout or `run_in_background`), same as the
  hook would have done.
- **`--no-verify`**: a real git escape hatch, not forbidden outright, but
  never use it silently — if you ever need it, say so explicitly (to the
  user, and on the coop bus if you're in a worktree). `--no-verify`
  skips pre-commit but **not** post-commit (git doesn't gate post-commit
  on it) — if you need to stop the auto-push too, use
  `COOP_NO_AUTOPUSH=1 git commit …` instead, or both together.

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
Pages) for a public site about real, identifiable people — and since
`.githooks/post-commit` automates fetch → rebase → full build → push
on every `master` commit, **the confirmation now has to happen before
you commit on `master`, not after**: by the time `git commit` returns,
the push has typically already gone out. Confirm with whoever you're
working with before committing directly on `master` unless you've been
given standing authorization to do so (as with any hard-to-reverse,
externally-visible action) — don't rely on a chance to bail out between
commit and push, because for practical purposes there isn't one.
`COOP_NO_AUTOPUSH=1 git commit …` restores that gap deliberately (e.g.
composing several related commits before one review/push).

In a worker worktree this doesn't apply directly — `task/T-###`
branches are never auto-pushed — but the same logic lands one step
later: get confirmation before ORCH merges into `master`, since that
merge commit is what the hook picks up and pushes.

## When NOT to use this skill

- **When `npm run build` is red.** A commit on `master` triggers the
  full build and an automatic push; a red build either blocks it or,
  worse, gets fixed by someone else under time pressure. Fix first.
- **On `master`, for anything that should be reviewed first.** There is
  no pause between the commit and the live deploy. Work on a
  `task/T-###` branch, or use `COOP_NO_AUTOPUSH=1`.
- **To sidestep a validator.** `--no-verify` exists for a genuine
  emergency, not for a gate that is inconveniently right. A blocked
  commit is information.
