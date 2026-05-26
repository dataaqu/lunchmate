# billing-cap

Hard Google Cloud spend safety net for project `lunchmate-496819` (T1.5).

A Cloud Billing **budget** ($200) publishes threshold-crossing messages to the
Pub/Sub topic `billing-cap`. The gen2 Cloud Function `capBilling` (this folder)
is triggered by that topic and, when spend reaches the budget, **detaches the
billing account** so all spend stops. Email alerts fire at 75% ($150), 90%
($180), and 100% ($200).

> ⚠️ Disabling billing takes the whole project offline (Maps + Places included)
> until you manually re-link a billing account. This is intentional — it's a
> last-resort cap, not graceful degradation.

## Prerequisites

```bash
# gcloud is NOT installed in the dev container — install + auth locally:
gcloud auth login
gcloud config set project lunchmate-496819

# Convenience vars used below:
export PROJECT_ID=lunchmate-496819
export REGION=us-central1
export TOPIC=billing-cap
export FN_SA=billing-cap-fn@${PROJECT_ID}.iam.gserviceaccount.com
```

## 1. Enable APIs

```bash
gcloud services enable \
  cloudbilling.googleapis.com \
  billingbudgets.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  pubsub.googleapis.com \
  eventarc.googleapis.com
```

## 2. Create the Pub/Sub topic

```bash
gcloud pubsub topics create ${TOPIC}
```

## 3. Service account + billing permission

```bash
gcloud iam service-accounts create billing-cap-fn \
  --display-name="Billing cap kill-switch"

# Find the billing account the project is linked to:
gcloud billing accounts list
export BILLING_ACCOUNT_ID=XXXXXX-XXXXXX-XXXXXX   # paste from output

# Detaching billing requires billing.admin ON THE BILLING ACCOUNT (not the project):
gcloud billing accounts add-iam-policy-binding ${BILLING_ACCOUNT_ID} \
  --member="serviceAccount:${FN_SA}" \
  --role="roles/billing.admin"
```

## 4. Deploy the function (gen2)

```bash
cd infra/billing-cap
gcloud functions deploy capBilling \
  --gen2 \
  --runtime=nodejs20 \
  --region=${REGION} \
  --source=. \
  --entry-point=capBilling \
  --trigger-topic=${TOPIC} \
  --service-account=${FN_SA} \
  --set-env-vars=GCP_PROJECT=${PROJECT_ID}
```

If the first deploy fails on Eventarc/Pub/Sub permissions, grant the service
agents gcloud names in the error and redeploy (gen2 Pub/Sub triggers need the
Pub/Sub service agent to have `roles/iam.serviceAccountTokenCreator`, and the
trigger SA to have `roles/run.invoker` + `roles/eventarc.eventReceiver`).

## 5. Create the budget ($200, alerts at 75/90/100%)

```bash
gcloud billing budgets create \
  --billing-account=${BILLING_ACCOUNT_ID} \
  --display-name="lunchmate cap" \
  --filter-projects="projects/${PROJECT_ID}" \
  --budget-amount=200USD \
  --threshold-rule=percent=0.75 \
  --threshold-rule=percent=0.90 \
  --threshold-rule=percent=1.00 \
  --all-updates-rule-pubsub-topic="projects/${PROJECT_ID}/topics/${TOPIC}"
```

Threshold emails go to the billing account's Billing Admins/Users by default,
which satisfies the $150 alert. To send to a specific inbox instead, create a
Monitoring channel and attach it:

```bash
gcloud beta monitoring channels create \
  --display-name="Budget email" \
  --type=email \
  --channel-labels=email_address=you@example.com
# Note the returned channel ID, then add to the budget:
#   --all-updates-rule-monitoring-notification-channels=projects/${PROJECT_ID}/notificationChannels/CHANNEL_ID
#   --disable-default-iam-recipients   # optional: stop emailing all billing admins
```

## 6. Quota monitoring dashboard (bookmark these)

- Quotas: https://console.cloud.google.com/iam-admin/quotas?project=lunchmate-496819
- Maps/Places metrics: https://console.cloud.google.com/google/maps-apis/metrics?project=lunchmate-496819

## Local testing (safe)

```bash
cd infra/billing-cap
npm install
npm test          # mocked client — never touches real billing
```

> Do **not** run `npm start` and POST a synthetic over-budget event while
> authenticated to `lunchmate-496819`: the disable path would call the real
> billing API and detach billing. The mocked `npm test` covers that path.
