#!/usr/bin/env bash
# Step 3 — THE CUTOVER. Repoints apex + www from the GitHub Pages IPs to the
# CloudFront distribution. This is the only step visitors notice.
# It first backs up the current apex/www record sets into the state dir, so
# ./99-rollback.sh can restore them byte-for-byte.
cd "$(dirname "$0")"
source ./env.sh

ZONE="$(hosted_zone_id)"
ID="$(state_get distribution-id || true)"
DIST_DOMAIN="$(state_get distribution-domain || true)"
[[ -n "$ID" && -n "$DIST_DOMAIN" ]] || { echo "no distribution in $STATE_DIR — run ./02-cloudfront-create.sh first" >&2; exit 1; }

log "backing up current apex/www records"
aws route53 list-resource-record-sets --hosted-zone-id "$ZONE" --output json \
  | jq --arg apex "${DOMAIN}." --arg www "${WWW_DOMAIN}." '
      [.ResourceRecordSets[]
       | select((.Name == $apex and (.Type == "A" or .Type == "AAAA"))
                or (.Name == $www and (.Type == "A" or .Type == "AAAA" or .Type == "CNAME")))]' \
  > "$STATE_DIR/route53-before.json"
jq -r '.[] | "  \(.Name) \(.Type)"' "$STATE_DIR/route53-before.json"

# Alias A/AAAA on both names: no extra lookup, and an alias works at the apex
# where a CNAME is not allowed.
BATCH="$(jq -n --arg apex "${DOMAIN}." --arg www "${WWW_DOMAIN}." \
  --arg target "${DIST_DOMAIN}." --arg zone "$CF_ALIAS_HOSTED_ZONE_ID" '{
  Comment: "Cut over to CloudFront",
  Changes: [$apex, $www] | map(. as $name | ["A","AAAA"] | map({
    Action: "UPSERT",
    ResourceRecordSet: {
      Name: $name, Type: .,
      AliasTarget: {HostedZoneId: $zone, DNSName: $target, EvaluateTargetHealth: false}
    }
  })) | add
}')"

log "switching $DOMAIN + $WWW_DOMAIN to $DIST_DOMAIN"
# A www CNAME and a www alias A cannot coexist, and Route 53 rejects an UPSERT
# that would change a name's type — so delete any existing CNAME in the same batch.
WWW_CNAME="$(jq -c --arg www "${WWW_DOMAIN}." '[.[] | select(.Name == $www and .Type == "CNAME")]' "$STATE_DIR/route53-before.json")"
if [[ "$(jq 'length' <<<"$WWW_CNAME")" -gt 0 ]]; then
  log "www is a CNAME today — deleting it as part of the same change"
  BATCH="$(jq -c --argjson del "$WWW_CNAME" \
    '.Changes = ($del | map({Action: "DELETE", ResourceRecordSet: .})) + .Changes' <<<"$BATCH")"
fi

if ! CHANGE="$(aws route53 change-resource-record-sets --hosted-zone-id "$ZONE" \
  --change-batch "$BATCH" --query 'ChangeInfo.Id' --output text)"; then
  echo "cutover failed — nothing was changed; DNS still points at GitHub Pages" >&2
  echo "the change batch that was rejected is in $STATE_DIR/route53-cutover.json" >&2
  printf '%s\n' "$BATCH" > "$STATE_DIR/route53-cutover.json"
  exit 1
fi
printf '%s\n' "$BATCH" > "$STATE_DIR/route53-cutover.json"

log "waiting for the change to propagate"
aws route53 wait resource-record-sets-changed --id "$CHANGE"
log "done — run ./04-verify.sh (public resolvers may need a few minutes for the old TTL to expire)"
