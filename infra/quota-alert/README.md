# quota-alert

Google Cloud **quota-monitoring alert** for project `lunchmate-496819` (T4.6).

A Cloud Monitoring alert policy emails an operator when Maps/Places API request
volume approaches the daily budget, or when any quota-exceeded errors occur.
This is the **early-warning** layer — it fires well before the **hard** spend
stop in [`../billing-cap`](../billing-cap/README.md) (the $200 billing
kill-switch) ever detaches billing.

| Layer | What it does | When it fires |
|-------|--------------|---------------|
| `quota-alert` (this) | Emails a warning | Request volume high / quota errors seen |
| `billing-cap` | **Detaches billing** (project offline) | Spend hits the $200 cap |

## What gets created

- An **email notification channel** (`lunchmate quota email`).
- An **alert policy** (`quota-alert-policy.json`) with two conditions (OR):
  1. Combined `places.googleapis.com` + `maps-backend.googleapis.com`
     `request_count` summed over a day exceeds the threshold (default **40k/day**).
  2. Any `serviceruntime.googleapis.com/quota/exceeded` events (hard quota hit).

> The gcloud CLI is **not** installed in the dev container — provisioning is run
> by the operator with their own auth. This folder is also outside the pnpm
> workspace (no Node code to install).

## Provision

```bash
# One-time, by hand:
gcloud auth login
gcloud auth application-default login

# Then:
ALERT_EMAIL=you@example.com bash infra/quota-alert/setup.sh
```

`setup.sh` is idempotent — it reuses an existing channel/policy by display name.

## Tuning

Edit `quota-alert-policy.json` to change the daily request threshold (`thresholdValue`,
default `40000`) to match expected traffic, then re-run `setup.sh` (delete the old
policy first, or edit it in the console). Adjust the `alignmentPeriod` to alert on
a shorter window if traffic is spiky.

## Dashboards (bookmark these)

- Quotas: https://console.cloud.google.com/iam-admin/quotas?project=lunchmate-496819
- Maps/Places metrics: https://console.cloud.google.com/google/maps-apis/metrics?project=lunchmate-496819
- Alerting: https://console.cloud.google.com/monitoring/alerting?project=lunchmate-496819
