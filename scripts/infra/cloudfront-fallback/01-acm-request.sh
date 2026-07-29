#!/usr/bin/env bash
# Step 1 — request an ACM certificate (us-east-1) for the apex + www and validate
# it via DNS in Route 53. Safe to run while the site still runs on GitHub Pages:
# it touches only _acme-challenge-style validation CNAMEs, never the A/AAAA records.
# Idempotent: reuses an already-issued certificate for the same domain set.
cd "$(dirname "$0")"
source ./env.sh

ZONE="$(hosted_zone_id)"
log "hosted zone: $ZONE"

ARN="$(state_get cert-arn || true)"
if [[ -z "$ARN" ]]; then
  ARN="$(aws acm list-certificates --region "$ACM_REGION" \
        --query "CertificateSummaryList[?DomainName=='${DOMAIN}'].CertificateArn | [0]" \
        --output text)"
  [[ "$ARN" == "None" ]] && ARN=""
fi

if [[ -z "$ARN" ]]; then
  log "requesting certificate for $DOMAIN + $WWW_DOMAIN"
  ARN="$(aws acm request-certificate --region "$ACM_REGION" \
    --domain-name "$DOMAIN" \
    --subject-alternative-names "$WWW_DOMAIN" \
    --validation-method DNS \
    --key-algorithm RSA_2048 \
    --query CertificateArn --output text)"
fi
state_put cert-arn "$ARN"
log "certificate: $ARN"

status() { aws acm describe-certificate --region "$ACM_REGION" --certificate-arn "$ARN" \
             --query 'Certificate.Status' --output text; }

if [[ "$(status)" != "ISSUED" ]]; then
  # ACM populates ResourceRecord a few seconds after the request.
  for _ in $(seq 1 20); do
    RECORDS="$(aws acm describe-certificate --region "$ACM_REGION" --certificate-arn "$ARN" \
      --query 'Certificate.DomainValidationOptions[?ResourceRecord!=null].ResourceRecord' --output json)"
    [[ "$(jq 'length' <<<"$RECORDS")" -gt 0 ]] && break
    sleep 5
  done
  [[ "$(jq 'length' <<<"$RECORDS")" -gt 0 ]] || { echo "ACM never published validation records" >&2; exit 1; }

  # Both names often share one validation record — dedupe before UPSERTing.
  BATCH="$(jq -c '{Comment: "ACM DNS validation", Changes: (unique_by(.Name) | map({
      Action: "UPSERT",
      ResourceRecordSet: {Name: .Name, Type: .Type, TTL: 300, ResourceRecords: [{Value: .Value}]}
    }))}' <<<"$RECORDS")"
  log "writing $(jq '.Changes | length' <<<"$BATCH") validation record(s) to Route 53"
  aws route53 change-resource-record-sets --hosted-zone-id "$ZONE" \
    --change-batch "$BATCH" --query 'ChangeInfo.Id' --output text

  log "waiting for ACM to validate (this usually takes 2-5 minutes)"
  aws acm wait certificate-validated --region "$ACM_REGION" --certificate-arn "$ARN"
fi

log "certificate status: $(status)"
log "next: ./02-cloudfront-create.sh"
