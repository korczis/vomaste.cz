#!/usr/bin/env bash
# Shared configuration for the CloudFront-in-front-of-GitHub-Pages fallback.
# Sourced by every script here; every value is overridable from the environment,
# so a fork can run this against its own domain/repo without editing anything.
set -euo pipefail

DOMAIN="${DOMAIN:-vomaste.cz}"
WWW_DOMAIN="${WWW_DOMAIN:-www.${DOMAIN}}"
GH_REPO="${GH_REPO:-korczis/vomaste.cz}"

# GitHub Pages origin. Two modes, see README:
#   host-override — forward the viewer Host to korczis.github.io (default; needs
#                   the Pages custom domain to STAY attached, causes no outage)
#   origin-path   — request <host><path> directly (needs the Pages custom domain
#                   DETACHED and static/CNAME removed, or you get a redirect loop)
CF_ORIGIN_MODE="${CF_ORIGIN_MODE:-host-override}"
GH_PAGES_HOST="${GH_PAGES_HOST:-korczis.github.io}"
GH_PAGES_PATH="${GH_PAGES_PATH:-/vomaste.cz}"   # "" for a user/organization site

# CloudFront only reads certificates from us-east-1, regardless of your CLI region.
ACM_REGION="${ACM_REGION:-us-east-1}"
# Fixed, AWS-documented hosted zone ID that every CloudFront distribution alias
# target uses. Not account-specific, not a secret.
# shellcheck disable=SC2034  # used by 03-route53-switch.sh after sourcing
CF_ALIAS_HOSTED_ZONE_ID="Z2FDTNDATAQYW2"

CF_PRICE_CLASS="${CF_PRICE_CLASS:-PriceClass_100}"       # NA + EU is enough for .cz
CF_CACHE_POLICY_ID="${CF_CACHE_POLICY_ID:-658327ea-f89d-4fab-a63d-7e88639e58f6}"        # Managed-CachingOptimized
CF_ORIGIN_REQUEST_POLICY_ID="${CF_ORIGIN_REQUEST_POLICY_ID:-216adef6-36ed-42ae-9dc7-e60d4c1cb0ff}" # Managed-AllViewer
CF_COMMENT="${CF_COMMENT:-${DOMAIN} fallback in front of GitHub Pages}"

# State (cert ARN, distribution id, pre-change DNS backup) lives OUTSIDE the repo
# by default — these are account-specific ids that have no business in git.
STATE_DIR="${STATE_DIR:-${TMPDIR:-/tmp}/${DOMAIN}-cf-fallback}"
mkdir -p "$STATE_DIR"

need() { command -v "$1" >/dev/null 2>&1 || { echo "missing required tool: $1" >&2; exit 1; }; }
need aws
need jq

hosted_zone_id() {
  if [[ -n "${HOSTED_ZONE_ID:-}" ]]; then printf '%s' "$HOSTED_ZONE_ID"; return; fi
  aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN" \
    --query "HostedZones[?Name=='${DOMAIN}.'].Id | [0]" --output text | sed 's|/hostedzone/||'
}

state_get() { [[ -f "$STATE_DIR/$1" ]] && cat "$STATE_DIR/$1"; }
state_put() { printf '%s\n' "$2" > "$STATE_DIR/$1"; }

log() { printf '\033[1m==>\033[0m %s\n' "$*"; }
