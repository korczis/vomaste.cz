#!/usr/bin/env bash
# Shared "commit = push = deploy" logic for master, sourced by BOTH
# .githooks/post-commit and .githooks/post-merge.
#
# WHY SHARED, NOT JUST post-commit: found 2026-08-06 while merging a
# worker branch into master the normal coop way
# (`git merge --no-ff task/T-###`) — that merge commit never triggered
# post-commit at all. Git fires a DIFFERENT pair of hooks for `git merge`
# (and for `git pull`, which is fetch+merge): pre-merge-commit and
# post-merge, not pre-commit/post-commit. Every ORCH merge this session
# had to be pushed by hand as a result — exactly the manual step this
# whole mechanism exists to remove. See docs/coop/PROTOCOL.md,
# "Automatický push po commitu" for the full writeup.
#
# Callers source this file, then call `auto_push_master "<hook-name>"`
# (e.g. "post-commit" or "post-merge") — the label only affects log
# prefixes, so failures are traceable to which hook actually ran.
#
# Same safety pojistky as before, now shared instead of duplicated:
#   1. Never mid-rebase/merge/cherry-pick/bisect (post-commit fires for
#      every "git rebase --continue" step; post-merge could in principle
#      run again mid another operation too — same guard, belt and
#      suspenders).
#   2. Only on branch `master`.
#   3. COOP_NO_AUTOPUSH=1 escape hatch.
#   4. Rebase conflict → abort, leave local state alone, no auto-resolve.
#   5. Full `npm run build` must pass before push — never push red.
#   6. Bounded retries against a lost push race.

auto_push_master() {
  local hook_name="${1:?auto_push_master: chybí <hook-name> pro log prefix}"

  cd "$(git rev-parse --show-toplevel)"
  local GIT_DIR
  GIT_DIR="$(git rev-parse --git-dir)"

  if [ -d "$GIT_DIR/rebase-merge" ] || [ -d "$GIT_DIR/rebase-apply" ] \
     || [ -f "$GIT_DIR/MERGE_HEAD" ] || [ -f "$GIT_DIR/CHERRY_PICK_HEAD" ] \
     || [ -f "$GIT_DIR/BISECT_LOG" ]; then
    return 0
  fi

  local branch
  branch="$(git symbolic-ref --quiet --short HEAD || true)"
  if [ "$branch" != "master" ]; then
    return 0
  fi

  if [ "${COOP_NO_AUTOPUSH:-}" = "1" ]; then
    echo "$hook_name: COOP_NO_AUTOPUSH=1 — auto-push přeskočen (commit zůstává lokální)." >&2
    return 0
  fi

  echo "$hook_name: commit = push = deploy — fetch + rebase + npm run build + push origin/master…" >&2

  if ! git fetch origin master --quiet 2>"/tmp/coop-$hook_name.$$"; then
    echo "$hook_name: 'git fetch origin master' selhal — pushni ručně, až bude síť/origin dostupný:" >&2
    cat "/tmp/coop-$hook_name.$$" >&2 2>/dev/null || true
    rm -f "/tmp/coop-$hook_name.$$"
    return 0
  fi
  rm -f "/tmp/coop-$hook_name.$$"

  local max_attempts=3 attempt=0
  while [ "$attempt" -lt "$max_attempts" ]; do
    attempt=$((attempt + 1))

    if ! git merge-base --is-ancestor origin/master HEAD 2>/dev/null; then
      if ! GIT_EDITOR=true git rebase origin/master --quiet 2>"/tmp/coop-$hook_name.$$"; then
        git rebase --abort >/dev/null 2>&1 || true
        echo "$hook_name: rebase na origin/master narazil na konflikt — commit zůstává lokální." >&2
        echo "  Vyřeš ručně (viz docs/coop/PROTOCOL.md, sekce Konflikty na generovaných souborech):" >&2
        echo "    git fetch origin master && git rebase origin/master" >&2
        cat "/tmp/coop-$hook_name.$$" >&2 2>/dev/null || true
        rm -f "/tmp/coop-$hook_name.$$"
        return 0
      fi
      rm -f "/tmp/coop-$hook_name.$$"
    fi

    echo "$hook_name: npm run build (plná brána, ne jen pre-commit podmnožina)…" >&2
    npm run build 2>&1 | tee "/tmp/coop-$hook_name-build.$$" >&2
    local build_status="${PIPESTATUS[0]}"
    if [ "$build_status" != "0" ]; then
      echo "$hook_name: 'npm run build' selhal PO rebase na aktuální origin/master." >&2
      echo "  Push se NEPROVEDE — commit na masteru je červený a nesmí jít na deploy." >&2
      echo "  Detail (znovu): tail -80 /tmp/coop-$hook_name-build.$$" >&2
      return 0
    fi
    rm -f "/tmp/coop-$hook_name-build.$$"

    if git push origin master --quiet 2>"/tmp/coop-$hook_name-push.$$"; then
      rm -f "/tmp/coop-$hook_name-push.$$"
      echo "$hook_name: pushnuto na origin/master — GitHub Pages CI (deploy.yml) se spouští automaticky." >&2
      bash scripts/coop/coop.sh send "*" deploy "auto-push" \
        "{\"note\":\"$hook_name auto-push\",\"commit\":\"$(git rev-parse --short HEAD)\"}" \
        2>/dev/null || true
      return 0
    fi

    echo "$hook_name: push odmítnut (někdo mezitím pushnul) — pokus $attempt/$max_attempts, zkouším znovu…" >&2
    cat "/tmp/coop-$hook_name-push.$$" >&2 2>/dev/null || true
    rm -f "/tmp/coop-$hook_name-push.$$"
    git fetch origin master --quiet || true
  done

  echo "$hook_name: push se nepodařil po $max_attempts pokusech (souběžné pushe) — pushni ručně:" >&2
  echo "  git fetch origin master && git rebase origin/master && npm run build && git push origin master" >&2
  return 0
}
