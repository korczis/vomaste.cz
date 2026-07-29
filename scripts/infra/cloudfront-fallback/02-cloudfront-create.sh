#!/usr/bin/env bash
# Step 2 — create the CloudFront distribution in front of GitHub Pages.
# Creating it changes nothing for visitors: nothing points at it until step 3.
# Idempotent: reuses the distribution recorded in the state dir.
cd "$(dirname "$0")"
source ./env.sh

ARN="$(state_get cert-arn || true)"
[[ -n "$ARN" ]] || { echo "no cert ARN in $STATE_DIR — run ./01-acm-request.sh first" >&2; exit 1; }

if ID="$(state_get distribution-id)" && [[ -n "$ID" ]]; then
  log "distribution already created: $ID"
else
  case "$CF_ORIGIN_MODE" in
    host-override)
      # Forward the viewer Host (vomaste.cz) to github.io, so Pages serves the
      # custom-domain site directly instead of redirecting to it. Keeps the Pages
      # custom domain and static/CNAME exactly as they are.
      ORIGIN_PATH=""
      ORIGIN_REQUEST_POLICY="$CF_ORIGIN_REQUEST_POLICY_ID"          # Managed-AllViewer (forwards Host)
      ;;
    origin-path)
      # Ask github.io for <repo-path> with its own Host. Requires the Pages custom
      # domain to be DETACHED and static/CNAME removed from the repo, otherwise
      # Pages 301s back to the apex and the request loops through CloudFront.
      ORIGIN_PATH="$GH_PAGES_PATH"
      ORIGIN_REQUEST_POLICY="b689b0a8-53d0-40ab-baf2-68738e2966ac"  # Managed-AllViewerExceptHostHeader
      ;;
    *) echo "unknown CF_ORIGIN_MODE: $CF_ORIGIN_MODE" >&2; exit 1 ;;
  esac

  CONFIG="$(jq -n \
    --arg ref "$(date -u +%Y%m%d%H%M%S)-${DOMAIN}" \
    --arg domain "$DOMAIN" --arg www "$WWW_DOMAIN" \
    --arg originHost "$GH_PAGES_HOST" --arg originPath "$ORIGIN_PATH" \
    --arg comment "$CF_COMMENT" --arg price "$CF_PRICE_CLASS" \
    --arg cachePolicy "$CF_CACHE_POLICY_ID" --arg orpPolicy "$ORIGIN_REQUEST_POLICY" \
    --arg cert "$ARN" '{
    CallerReference: $ref,
    Comment: $comment,
    Enabled: true,
    HttpVersion: "http2and3",
    IsIPV6Enabled: true,
    PriceClass: $price,
    DefaultRootObject: "index.html",
    Aliases: {Quantity: 2, Items: [$domain, $www]},
    Origins: {Quantity: 1, Items: [{
      Id: "github-pages",
      DomainName: $originHost,
      OriginPath: $originPath,
      CustomOriginConfig: {
        HTTPPort: 80, HTTPSPort: 443,
        OriginProtocolPolicy: "https-only",
        OriginSslProtocols: {Quantity: 1, Items: ["TLSv1.2"]},
        OriginReadTimeout: 30, OriginKeepaliveTimeout: 5
      }
    }]},
    DefaultCacheBehavior: {
      TargetOriginId: "github-pages",
      ViewerProtocolPolicy: "redirect-to-https",
      AllowedMethods: {Quantity: 2, Items: ["GET","HEAD"],
                       CachedMethods: {Quantity: 2, Items: ["GET","HEAD"]}},
      Compress: true,
      CachePolicyId: $cachePolicy,
      OriginRequestPolicyId: $orpPolicy
    },
    CustomErrorResponses: {Quantity: 1, Items: [
      {ErrorCode: 404, ResponsePagePath: "/404.html", ResponseCode: "404", ErrorCachingMinTTL: 300}
    ]},
    ViewerCertificate: {
      ACMCertificateArn: $cert,
      SSLSupportMethod: "sni-only",
      MinimumProtocolVersion: "TLSv1.2_2021",
      CertificateSource: "acm"
    }
  }')"

  log "creating distribution (origin mode: $CF_ORIGIN_MODE)"
  OUT="$(aws cloudfront create-distribution --distribution-config "$CONFIG" \
         --query '{id: Distribution.Id, domain: Distribution.DomainName}' --output json)"
  ID="$(jq -r .id <<<"$OUT")"
  state_put distribution-id "$ID"
  state_put distribution-domain "$(jq -r .domain <<<"$OUT")"
fi

DIST_DOMAIN="$(state_get distribution-domain)"
log "distribution $ID -> $DIST_DOMAIN"
log "waiting for it to finish deploying (usually 3-8 minutes)"
aws cloudfront wait distribution-deployed --id "$ID"

# Smoke-test through the distribution's own hostname BEFORE moving any DNS.
log "smoke test via $DIST_DOMAIN (Host: $DOMAIN)"
curl -sS -o /dev/null -m 20 -w 'status=%{http_code}\n' \
  --resolve "${DOMAIN}:443:$(dig +short "$DIST_DOMAIN" A | head -1)" "https://${DOMAIN}/" \
  || echo "smoke test failed — do NOT run step 3 until this returns 200"

log "next: ./03-route53-switch.sh"
