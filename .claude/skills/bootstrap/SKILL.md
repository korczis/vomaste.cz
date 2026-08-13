---
name: bootstrap
description: Onboard a new Claude Code (or human) session into vomaste.cz — read the binding rules, check the co-op board/bus, verify local prerequisites, and land in the right role (ORCH direct work vs. a worker worktree) before touching anything.
argument-hint: [task-id]
---

## What this is for

vomaste.cz is a small repo with strict, load-bearing rules (source
discipline, an append-only authorization log for content about real
people, a multi-instance co-op protocol). A fresh session that starts
editing before reading them will either duplicate work another instance
is mid-way through, or — worse — add unauthorized/unsourced content about
a real person. This skill is the fast, repeatable path to being safely
up to speed, so "anyone, anytime" can start contributing without
re-deriving the rules from scratch.

Read this whole skill before acting. It does not replace the source
documents below — it tells you which ones to read, in what order, and
what to check before your first edit.

## Steps

1. **Confirm the working directory and branch.**
   ```bash
   cd ~/dev/vomaste.cz   # or the worktree you were handed, if any
   git status --short --branch
   git rev-parse --abbrev-ref HEAD
   ```
   Main checkout on `master` = you are (or are about to act as) **ORCH**.
   A checkout under `~/dev/vomaste-worktrees/T-###` on `task/T-###` =
   you are a **worker** for that specific task — see step 5.

2. **Read the binding rules, in this order** (don't skip — each one is
   short and each is referenced by the others):
   - `AGENTS.md` — the dossier data model, editorial rules, and the
     append-only "Content about real parties" authorization log. This is
     the actual constitution for content; skim it in full even if you
     think you already know it, since the log only ever grows.
   - `docs/constitution/OPEN_INTELLIGENCE_COMMONS.md` — platform-level
     invariants (two-zone security model, no trust scores, honesty about
     unimplemented capabilities). Never overrides AGENTS.md's scope
     limits.
   - `docs/coop/PROTOCOL.md` — the multi-instance operating protocol
     (roles, task board, message bus, worktrees). Read this fully if
     `git worktree list` (below) shows more than just your own checkout.
   - `CLAUDE.md` — Claude-Code-specific operating notes on top of the
     above.

3. **Check prerequisites are actually met** — don't assume:
   ```bash
   node -v          # expect the version in .tool-versions (nodejs)
   zola --version   # expect 0.22.x (CI pins 0.22.1)
   git config --get core.hooksPath   # expect ".githooks"; if empty, run:
   npm run hooks:install
   npm ci           # if you haven't already — also (re)installs the git hook
   ```
   If `zola` is missing: see the install link in README.md's "Rychlý
   start". Don't try to work around a missing prerequisite by skipping
   the checks it enables — fix the prerequisite.

4. **Check what else is happening right now** — you are very likely not
   the only session in this repo:
   ```bash
   scripts/coop/coop.sh status   # board + worktrees + last 10 bus messages
   scripts/coop/coop.sh log 30   # more bus history if status isn't enough
   ```
   Look specifically for: open (`todo`/`claimed`/`in-progress`) rows in
   `docs/coop/TASKS.md` that touch files you're about to touch, and any
   `blocked` note explaining why. If your intended change overlaps an
   in-progress task's scope, don't proceed silently — send a bus note
   (`scripts/coop/coop.sh send ORCH note '' '{"note":"..."}'`) flagging
   the overlap before you start, the same way ORCH/workers do for each
   other.

5. **Pick your role and act accordingly:**
   - **You were handed a specific task ID** (`T-###`, e.g. via this
     skill's `argument-hint`) and a worktree already exists at
     `~/dev/vomaste-worktrees/T-###`: `cd` there, `export
     COOP_AGENT_ID=W-<n>` (pick an unused suffix from `coop.sh status`),
     `npm ci`, then `scripts/coop/coop.sh send ORCH claim T-### '{"note":"starting"}'`
     before your first edit.
   - **You're picking up open work from the board** (`todo` row, no
     owner): claim it on the bus first, then create your own worktree —
     `scripts/coop/coop.sh wt-add T-###` — and proceed as above. Do not
     start editing in the main checkout for a task-board item; that's
     what worktrees are for.
   - **You're doing small, non-content infra work** (tooling, docs,
     deploy config — nothing under `content/`, `templates/`, or
     `scripts/dossier/`) **and** the main checkout is clean of unrelated
     work: direct commits on `master` as ORCH are an established
     precedent here (see recent infra commits — domain setup, license,
     this very skill). Still: send a bus note before and after, and
     never touch a file another active task already claims.
   - **Anything else, or genuinely unsure which of the above applies**:
     stop and ask the site owner rather than guessing — this mirrors the
     dossier's own "stop and ask" rule for scope questions.

6. **Before your first edit touching content about a real person**,
   re-read the specific authorization subsection in `AGENTS.md` that
   covers it. Silence, "it's already public elsewhere", or "this seems
   like the natural next topic" are never authorization. If in doubt,
   don't write the content — ask.

7. **Know where content is edited**: all dossier/entity content is
   canonical JSON under `data/dossiers/**` (see AGENTS.md "Canonical
   data model" and `docs/contributing/add-dossier-data.md`).
   `content/dossiers/**` and `content/entities/*.md` are generated
   adapters — never edit them; `npm run data:build` regenerates them
   from the canonical records (there are no migrate scripts anymore).

8. **Before calling anything done**: run the relevant validators (fast
   subset: `git commit` now runs `.githooks/pre-commit` automatically,
   which starts with the canonical `data:validate` gate; full gate
   before a review-request/merge/push: `npm run build`). A green
   pre-commit hook is not the same thing as a green `npm run build` —
   don't conflate them.

## What this skill deliberately does not do

It does not write content, claim a task, or run `npm run build` for you
— those are separate, explicit actions once you know your role. It also
does not replace `docs/coop/PROTOCOL.md` for the full mechanics of the
bus/board/worktree lifecycle; read that document for anything this
summary doesn't cover.

## When NOT to use this skill

- **Mid-session, when you are already oriented.** Re-running it costs
  context and tells you what you already know. If you only need one
  fact, read that one file.
- **As a substitute for reading `AGENTS.md`.** This skill tells you what
  to read and in what order; it does not contain the rules, and a
  summary of an authorization log is not an authorization log.
- **To decide whether a subject may be covered.** That is a scope
  question — see the authorization rules, not this.
