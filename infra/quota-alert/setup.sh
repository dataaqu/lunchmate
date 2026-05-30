#!/usr/bin/env bash
#
# T4.6 — Google Cloud quota-monitoring alert for lunchmate-496819.
#
# Creates a Cloud Monitoring email notification channel + an alert policy that
# fires when Maps/Places API request volume approaches the daily budget, or when
# any quota-exceeded errors occur. This is the EARLY-warning layer; the hard
# spend stop lives in infra/billing-cap (the $200 billing kill-switch).
#
# Prerequisites (do these ONCE, by hand):
#   1. Install the gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. gcloud auth login
#   3. gcloud auth application-default login
#
# Usage (the alert email is required):
#   ALERT_EMAIL=you@example.com bash infra/quota-alert/setup.sh
#
# Safe to re-run: the notification channel and policy are guarded by display
# name so a second run won't create duplicates.

set -euo pipefail

PROJECT_ID=lunchmate-496819
CHANNEL_NAME="lunchmate quota email"
POLICY_NAME="lunchmate — Maps/Places quota usage warning"

if [ -z "${ALERT_EMAIL:-}" ]; then
  echo "ERROR: set ALERT_EMAIL, e.g. ALERT_EMAIL=you@example.com bash infra/quota-alert/setup.sh" >&2
  exit 1
fi

# Run from this script's own folder so --policy-from-file finds the JSON.
cd "$(dirname "$0")"

echo "==> [1/4] Setting active project"
gcloud config set project "$PROJECT_ID"

echo "==> [2/4] Enabling the Monitoring API"
gcloud services enable monitoring.googleapis.com

echo "==> [3/4] Ensuring an email notification channel exists"
CHANNEL_ID="$(gcloud beta monitoring channels list \
  --filter="displayName=\"${CHANNEL_NAME}\"" \
  --format='value(name)' 2>/dev/null | head -1)"

if [ -z "$CHANNEL_ID" ]; then
  CHANNEL_ID="$(gcloud beta monitoring channels create \
    --display-name="$CHANNEL_NAME" \
    --type=email \
    --channel-labels="email_address=${ALERT_EMAIL}" \
    --format='value(name)')"
  echo "    created channel: ${CHANNEL_ID}"
else
  echo "    reusing channel: ${CHANNEL_ID}"
fi

echo "==> [4/4] Creating the quota alert policy"
if gcloud alpha monitoring policies list \
     --filter="displayName=\"${POLICY_NAME}\"" \
     --format='value(name)' 2>/dev/null | grep -q .; then
  echo "    (policy '${POLICY_NAME}' already exists — skipping)"
else
  gcloud alpha monitoring policies create \
    --policy-from-file=quota-alert-policy.json \
    --notification-channels="$CHANNEL_ID"
fi

echo ""
echo "✅ Quota alert provisioned. Email warnings go to ${ALERT_EMAIL}."
echo ""
echo "📌 Tune the request threshold in quota-alert-policy.json (default 40k/day)"
echo "   to match expected traffic. Hard spend cap: see infra/billing-cap/."
