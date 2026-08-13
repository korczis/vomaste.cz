#!/usr/bin/env bash
# Guard v .githooks/lib/auto-push-master.sh rozhoduje, jestli se commit na
# master sám nasadí. Chybné rozhodnutí má dva různě zlé směry: přísné navíc
# znamená, že si někdo myslí, že nasadil, a nenasadil; volné navíc znamená,
# že se zveřejní něco, co nikdo zveřejnit nechtěl. Ani jeden se nesmí
# rozhodovat odvozením z kódu — proto tenhle test.
#
# Historie, kterou hlídá: guard zaměňoval „merge právě probíhá“ za „merge
# právě doběhl“ a umlčoval hook přesně pro `git merge --no-ff` na master,
# tedy pro jediný případ, kvůli kterému post-merge vůbec existuje.
#
# Trik, na kterém test stojí: auto_push_master by jinak sáhl na síť a pustil
# plný build. COOP_NO_AUTOPUSH=1 ho zastaví hned ZA guardem a s vlastní
# hláškou — takže podle toho, která hláška padne, poznáme, jestli guard
# rozhodl „stop“, nebo „pokračuj“, aniž bychom cokoli pushovali.
#
# Spouští se ručně i z `npm run test:hooks`. Nedotýká se ničeho mimo mktemp.
set -uo pipefail

LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.githooks/lib/auto-push-master.sh"
[ -f "$LIB" ] || { echo "FAIL: nenalezen $LIB"; exit 1; }

fails=0
ok()   { echo "  ✔ $1"; }
fail() { echo "  ✘ $1"; echo "      $2"; fails=$((fails + 1)); }

new_repo() {
  local d; d="$(mktemp -d)"
  git init -q -b master "$d"
  git -C "$d" config user.email probe@example.invalid
  git -C "$d" config user.name Probe
  git -C "$d" config commit.gpgsign false
  echo base > "$d/f.txt"
  git -C "$d" add -A
  git -C "$d" -c core.hooksPath=/dev/null commit -qm base
  echo "$d"
}

# --- 1) Skutečné chování gitu: je MERGE_HEAD při běhu post-merge? ---------
# Tohle je fakt o gitu, ne o našem kódu, a celý guard na něm stojí.
R="$(new_repo)"
mkdir -p "$R/.githooks"
cat > "$R/.githooks/post-merge" <<'HOOK'
#!/usr/bin/env bash
GD="$(git rev-parse --git-dir)"
[ -f "$GD/MERGE_HEAD" ] && echo ano > "$GD/../merge-head-videt.txt" || echo ne > "$GD/../merge-head-videt.txt"
HOOK
chmod +x "$R/.githooks/post-merge"
git -C "$R" config core.hooksPath .githooks
git -C "$R" checkout -q -b task/T-999
echo vetev >> "$R/f.txt"
git -C "$R" commit -qam vetev
git -C "$R" checkout -q master
git -C "$R" merge --no-ff -q -m "merge: T-999" task/T-999
if [ "$(cat "$R/merge-head-videt.txt" 2>/dev/null)" = "ano" ]; then
  ok "git nechává MERGE_HEAD po celou dobu běhu post-merge"
else
  fail "git nechává MERGE_HEAD po celou dobu běhu post-merge" \
       "MERGE_HEAD nebyl vidět — guard by pak byl neškodný a tenhle test je zbytečný"
fi
rm -rf "$R"

# --- 2) post-merge s MERGE_HEAD guardem PROJDE ----------------------------
R="$(new_repo)"
: > "$R/.git/MERGE_HEAD"
out="$(cd "$R" && COOP_NO_AUTOPUSH=1 bash -c "source '$LIB'; auto_push_master post-merge" 2>&1)"
if grep -q COOP_NO_AUTOPUSH <<<"$out"; then
  ok "post-merge: MERGE_HEAD guard nezastaví (dojde se až za něj)"
else
  fail "post-merge: MERGE_HEAD guard nezastaví" "dostal jsem: ${out:-<ticho>}"
fi
rm -rf "$R"

# --- 3) post-commit s MERGE_HEAD guard ZASTAVÍ, a nahlas ------------------
R="$(new_repo)"
: > "$R/.git/MERGE_HEAD"
out="$(cd "$R" && COOP_NO_AUTOPUSH=1 bash -c "source '$LIB'; auto_push_master post-commit" 2>&1)"
if grep -q "probíhá merge" <<<"$out"; then
  ok "post-commit: MERGE_HEAD zastaví a řekne to"
else
  fail "post-commit: MERGE_HEAD zastaví a řekne to" "dostal jsem: ${out:-<ticho>}"
fi
rm -rf "$R"

# --- 4) rozdělaný rebase zastaví oba hooky, a nahlas ---------------------
for hook in post-commit post-merge; do
  R="$(new_repo)"
  mkdir -p "$R/.git/rebase-merge"
  out="$(cd "$R" && COOP_NO_AUTOPUSH=1 bash -c "source '$LIB'; auto_push_master $hook" 2>&1)"
  if grep -q "probíhá rebase-merge" <<<"$out"; then
    ok "$hook: rozdělaný rebase zastaví a řekne to"
  else
    fail "$hook: rozdělaný rebase zastaví a řekne to" "dostal jsem: ${out:-<ticho>}"
  fi
  rm -rf "$R"
done

# --- 5) mimo master je no-op, a to potichu -------------------------------
# Tady je ticho správně: worker ve worktree commituje pořád a hláška při
# každém commitu by se naučila přehlížet — a s ní i ty ostatní.
R="$(new_repo)"
git -C "$R" checkout -q -b task/T-001
out="$(cd "$R" && bash -c "source '$LIB'; auto_push_master post-commit" 2>&1)"
if [ -z "$out" ]; then
  ok "mimo master: no-op bez hlášky"
else
  fail "mimo master: no-op bez hlášky" "dostal jsem: $out"
fi
rm -rf "$R"

echo
if [ "$fails" -eq 0 ]; then
  echo "auto-push guard OK — 6 kontrol."
else
  echo "auto-push guard: $fails selhání."
  exit 1
fi
