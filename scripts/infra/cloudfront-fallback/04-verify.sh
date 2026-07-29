#!/usr/bin/env bash
# Step 4 — verify the cutover: DNS, TLS subject, redirects, and a route spot-check.
# Read-only. For a visual check, run the Playwright pass described in the README.
cd "$(dirname "$0")"
source ./env.sh

DIST_DOMAIN="$(state_get distribution-domain || true)"

log "DNS"
for r in 8.8.8.8 1.1.1.1 9.9.9.9; do
  printf '  %-8s A    %s\n' "$r" "$(dig +short "@$r" "$DOMAIN" A | tr '\n' ' ')"
done
printf '  expected: the CloudFront IPs behind %s\n' "${DIST_DOMAIN:-<unknown>}"

log "TLS"
curl -sSv -o /dev/null -m 20 "https://${DOMAIN}/" 2>&1 \
  | grep -E 'subject:|issuer:|expire date:|subjectAltName:|SSL connection' | sed 's/^\*/ /'

log "HTTP behaviour"
for u in "https://${DOMAIN}/" "http://${DOMAIN}/" "https://${WWW_DOMAIN}/"; do
  printf '  %-32s %s\n' "$u" \
    "$(curl -sS -o /dev/null -m 20 -w '%{http_code} %{redirect_url}' "$u")"
done

log "route spot-check"
for p in / /dossiers/ /sitemap.xml /robots.txt /404.html /this-should-404; do
  printf '  %-24s %s\n' "$p" "$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "https://${DOMAIN}${p}")"
done

log "served asset base (must be https://${DOMAIN}/...)"
curl -sS -m 20 "https://${DOMAIN}/" | grep -o 'href=[^ >]*main.css[^ >]*' | head -1 | sed 's/^/  /'
