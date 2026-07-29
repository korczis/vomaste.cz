#!/usr/bin/env bash
# Co-op helper pro více instancí Claude Code — viz docs/coop/PROTOCOL.md
# Sběrnice: append-only NDJSON ve sdíleném git adresáři (společný všem
# worktrees, neverzovaný). Jedna zpráva = jeden řádek < 4 kB (atomický append).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
BUS_DIR="$(git rev-parse --git-common-dir)/coop-bus"
BUS="$BUS_DIR/bus.ndjson"
WT_ROOT="$(cd "$ROOT/.." && pwd)/vomaste-worktrees"
AGENT="${COOP_AGENT_ID:-$(git rev-parse --abbrev-ref HEAD)}"
mkdir -p "$BUS_DIR"

usage() {
  cat <<'EOF'
usage: coop.sh <cmd>
  status                     board + worktrees + poslední zprávy
  send <to> <type> <task> [json-payload]
                             zapiš zprávu na sběrnici (payload musí být validní JSON objekt)
  inbox [n]                  zprávy adresované mně (COOP_AGENT_ID) a broadcasty (to:"*")
  log [n]                    posledních n zpráv celé sběrnice (default 20)
  wt-add <T-###>             založ worktree + větev task/T-### z masteru
  wt-done <T-###>            po mergi odstraň worktree i větev
EOF
}

cmd="${1:-status}"; shift || true
case "$cmd" in
  send)
    to="${1:?send: chybi <to>}"; type="${2:?send: chybi <type>}"
    task="${3:-}"; payload="${4:-{\}}"
    case "$type" in
      claim|progress|blocked|review-request|done|merged|deploy|note|ping) ;;
      *) echo "coop.sh: neznamy type '$type'" >&2; exit 1 ;;
    esac
    node -e 'JSON.parse(process.argv[1])' "$payload" \
      || { echo "coop.sh: payload neni validni JSON" >&2; exit 1; }
    printf '{"v":1,"ts":"%s","from":"%s","to":"%s","type":"%s","task":"%s","payload":%s}\n' \
      "$(date -u +%FT%TZ)" "$AGENT" "$to" "$type" "$task" "$payload" >> "$BUS"
    ;;
  inbox)
    grep -E "\"to\":\"($AGENT|\\*)\"" "$BUS" 2>/dev/null | tail -n "${1:-20}" \
      || echo "(zadne zpravy pro $AGENT)"
    ;;
  log)
    tail -n "${1:-20}" "$BUS" 2>/dev/null || echo "(sbernice prazdna)"
    ;;
  status)
    echo "== co-op status (agent: $AGENT) =="
    echo "-- worktrees --"; git worktree list
    echo "-- otevrene tasky (docs/coop/TASKS.md) --"
    grep -E '^\| T-' "$ROOT/docs/coop/TASKS.md" 2>/dev/null | grep -viE '\| *merged *\|' \
      || echo "(zadne)"
    echo "-- poslednich 10 zprav --"
    tail -n 10 "$BUS" 2>/dev/null || echo "(sbernice prazdna)"
    ;;
  wt-add)
    t="${1:?wt-add: chybi <T-###>}"
    mkdir -p "$WT_ROOT"
    git worktree add "$WT_ROOT/$t" -b "task/$t" master
    echo "worktree: $WT_ROOT/$t (branch task/$t) — nezapomen 'npm ci' a COOP_AGENT_ID"
    ;;
  wt-done)
    t="${1:?wt-done: chybi <T-###>}"
    git worktree remove "$WT_ROOT/$t"
    git branch -d "task/$t"
    ;;
  -h|--help|help) usage ;;
  *) usage; exit 1 ;;
esac
