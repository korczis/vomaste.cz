---
name: bootstrap
description: Onboard a new Claude Code (or human) session into vomaste.cz — read the binding rules, check the co-op board/bus, verify local prerequisites, pick a persona, and land in the right role (ORCH direct work vs. a worker worktree) before touching anything. Use at the start of every session, or when someone says "I'm new here", "where do I start", "how do I contribute".
argument-hint: "[persona: reader | verifier | source-contributor | researcher | editor | developer | reviewer | maintainer | orchestrator] [or a task id T-###]"
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

## Argument: persona, task id, or nothing

The argument decides how much of this skill applies.

| Argument | Meaning |
|---|---|
| *(none)* | Ask what the person wants to do, then infer the persona from the answer — don't make them pick from a list of nine roles they've never seen. |
| a persona name | Skip step 5's role question; go straight to that persona's path. |
| `T-###` | You are a worker on that co-op task. Persona follows from the task. |

The nine personas, what each may do, and the five risk levels are in
`.claude/rules/personas.md`, which is loaded in every session. Don't
restate the table here — point at it.

**A persona is not a permission.** It describes what someone is doing
right now, and one person passes through three of them in a session.
What no persona may do is widen the coverage scope — that is governed by
`AGENTS.md` and by nothing else.

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
   zola --version   # expect 0.23.x (CI pins zola@0.23.3; 0.22 will not build this repo)
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

## Finish: three next steps and one safe first task

Do not end a bootstrap with "you're ready." End it with something to do.

1. **Name the persona** you landed on and where its limits are written.
2. **Recommend exactly three capabilities**, read from the generated
   catalogue (`data/generated/tooling-catalog.json`), filtered by
   `personas` containing that persona and sorted so that a `read-only`
   one comes first. Never invent a name — if the catalogue has fewer
   than three for that persona, offer fewer and say so.
3. **Offer one concrete first task** that is safe for that persona.
   For a reader or verifier that is always read-only; for an editor or
   developer it may write, and then you say what will have to pass
   before it counts as done (`npm run build`, exit 0).

Format:

```
ROLE:        <ORCH direct | worker in worktree T-###>
PERSONA:     <role> — limits: .claude/rules/personas.md
NEXT:        <three capabilities from the catalogue, with risk levels>
FIRST TASK:  <one concrete, safe thing>
GATE:        <what must pass before it counts as done>
```

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
- **When the environment itself is broken.** If commands fail, if
  `node_modules` is missing, if you are not sure which worktree you are
  in — that is `/diagnose`, and bootstrapping on top of a broken
  environment produces confident nonsense.
- **To decide whether a subject may be covered.** That is a scope
  question — see the authorization rules, not this.
