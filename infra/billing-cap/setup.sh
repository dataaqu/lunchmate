#!/usr/bin/env bash
#
# T1.5 — one-shot provisioning of the billing safety net for lunchmate-496819.
#
# Prerequisites (do these ONCE, by hand):
#   1. Install the gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. gcloud auth login
#   3. gcloud auth application-default login
#
# Then just run this script from anywhere:
#   bash infra/billing-cap/setup.sh
#
# It is safe to re-run: API enables, topic, service account, and budget are
# all guarded so a second run won't create duplicates.

set -euo pipefail

PROJECT_ID=lunchmate-496819
REGION=us-central1
TOPIC=billing-cap
FN_SA="billing-cap-fn@${PROJECT_ID}.iam.gserviceaccount.com"

# Run from this script's own folder so `--source=.` picks up the function code.
cd "$(dirname "$0")"

echo "==> [1/6] Setting active project"
gcloud config set project "$PROJECT_ID"

echo "==> [2/6] Enabling required APIs"
gcloud services enable \
  cloudbilling.googleapis.com \
  billingbudgets.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  pubsub.googleapis.com \
  eventarc.googleapis.com

echo "==> [3/6] Creating Pub/Sub topic '${TOPIC}'"
gcloud pubsub topics create "$TOPIC" 2>/dev/null || echo "    (topic already exists — skipping)"

echo "==> [4/6] Creating function service account"
gcloud iam service-accounts create billing-cap-fn \
  --display-name="Billing cap kill-switch" 2>/dev/null || echo "    (service account already exists — skipping)"

echo "==> Detecting linked billing account"
BILLING_ACCOUNT_ID="$(gcloud billing accounts list --format='value(name)' | head -1)"
if [ -z "$BILLING_ACCOUNT_ID" ]; then
  echo "ERROR: no billing account found. Link a billing account to the project first." >&2
  exit 1
fi
echo "    using billing account: ${BILLING_ACCOUNT_ID}"

echo "==> Granting billing.admin to the function service account"
gcloud billing accounts add-iam-policy-binding "$BILLING_ACCOUNT_ID" \
  --member="serviceAccount:${FN_SA}" \
  --role="roles/billing.admin"

echo "==> [5/6] Deploying the capBilling Cloud Function (gen2)"
gcloud functions deploy capBilling \
  --gen2 \
  --runtime=nodejs20 \
  --region="$REGION" \
  --source=. \
  --entry-point=capBilling \
  --trigger-topic="$TOPIC" \
  --service-account="$FN_SA" \
  --set-env-vars="GCP_PROJECT=${PROJECT_ID}"

echo "==> [6/6] Creating the \$200 budget (alerts at 75% / 90% / 100%)"
# Guard: don't create a duplicate "lunchmate cap" budget on re-run.
if gcloud billing budgets list --billing-account="$BILLING_ACCOUNT_ID" \
     --format='value(displayName)' 2>/dev/null | grep -qx "lunchmate cap"; then
  echo "    (budget 'lunchmate cap' already exists — skipping)"
else
  gcloud billing budgets create \
    --billing-account="$BILLING_ACCOUNT_ID" \
    --display-name="lunchmate cap" \
    --filter-projects="projects/${PROJECT_ID}" \
    --budget-amount=200USD \
    --threshold-rule=percent=0.75 \
    --threshold-rule=percent=0.90 \
    --threshold-rule=percent=1.00 \
    --all-updates-rule-pubsub-topic="projects/${PROJECT_ID}/topics/${TOPIC}"
fi

echo ""
echo "✅ Billing safety net provisioned."
echo "   The \$150 email alert goes to your billing admins automatically."
echo ""
echo "📌 Bookmark your quota dashboards:"
echo "   Quotas:        https://console.cloud.google.com/iam-admin/quotas?project=${PROJECT_ID}"
echo "   Maps/Places:   https://console.cloud.google.com/google/maps-apis/metrics?project=${PROJECT_ID}"
