#!/usr/bin/env bash
# Rollback — put apex + www back on GitHub Pages exactly as they were before the
# cutover, using the backup written by 03-route53-switch.sh. The distribution is
# left in place (disabled only with --disable-distribution) so a second attempt
# needs no new certificate or distribution.
cd "$(dirname "$0")"
source ./env.sh

ZONE="$(hosted_zone_id)"
BEFORE="$STATE_DIR/route53-before.json"
[[ -s "$BEFORE" ]] || { echo "no DNS backup at $BEFORE — nothing to restore from" >&2; exit 1; }

log "current apex/www records"
CURRENT="$(aws route53 list-resource-record-sets --hosted-zone-id "$ZONE" --output json \
  | jq --arg apex "${DOMAIN}." --arg www "${WWW_DOMAIN}." '
      [.ResourceRecordSets[]
       | select((.Name == $apex or .Name == $www)
                and (.Type == "A" or .Type == "AAAA" or .Type == "CNAME"))]')"
jq -r '.[] | "  \(.Name) \(.Type) \(if .AliasTarget then "ALIAS " + .AliasTarget.DNSName else ([.ResourceRecords[].Value] | join(",")) end)"' <<<"$CURRENT"

# DELETE everything currently on those names, then CREATE the backed-up records.
# One batch, so there is no window where the names resolve to nothing.
BATCH="$(jq -n --argjson cur "$CURRENT" --slurpfile before "$BEFORE" '{
  Comment: "Rollback to GitHub Pages",
  Changes: ($cur | map({Action: "DELETE", ResourceRecordSet: .}))
         + ($before[0] | map({Action: "CREATE", ResourceRecordSet: .}))
}')"

log "restoring $(jq '[.[] | .Name] | length' "$BEFORE") record(s) from backup"
CHANGE="$(aws route53 change-resource-record-sets --hosted-zone-id "$ZONE" \
  --change-batch "$BATCH" --query 'ChangeInfo.Id' --output text)"
aws route53 wait resource-record-sets-changed --id "$CHANGE"
log "DNS restored"

# If the cutover used CF_ORIGIN_MODE=origin-path, the Pages custom domain was
# detached — put it back, and restore static/CNAME in the repo (a commit, so it
# is left to you: git revert the commit that removed it, then deploy).
if [[ "$CF_ORIGIN_MODE" == "origin-path" ]]; then
  log "re-attaching the Pages custom domain"
  echo "{\"cname\": \"${DOMAIN}\"}" | gh api -X PUT "repos/${GH_REPO}/pages" --input - || true
  echo "  NOTE: also restore static/CNAME in the repo and deploy (git revert + /commit + /deploy)"
fi

if [[ "${1:-}" == "--disable-distribution" ]]; then
  ID="$(state_get distribution-id || true)"
  if [[ -n "$ID" ]]; then
    log "disabling distribution $ID"
    ETAG="$(aws cloudfront get-distribution-config --id "$ID" --query ETag --output text)"
    aws cloudfront get-distribution-config --id "$ID" --query 'DistributionConfig' --output json \
      | jq '.Enabled = false' > "$STATE_DIR/disable.json"
    aws cloudfront update-distribution --id "$ID" --if-match "$ETAG" \
      --distribution-config "file://$STATE_DIR/disable.json" --query 'Distribution.Status' --output text
    echo "  a disabled distribution can be deleted once its status is Deployed:"
    echo "    aws cloudfront delete-distribution --id $ID --if-match <new-etag>"
  fi
fi

log "verify with ./04-verify.sh — TLS subject should be CN=${DOMAIN} issued to GitHub's Let's Encrypt cert again"
