# T1.5 — Budget Alert + Billing Cap

**Date:** 2026-05-26
**Task:** T1.5 (Phase 1) — depends on T1.4 (GCP project + billing linked)
**GCP project:** `lunchmate-496819`
**Status:** Design approved

## Goal

Put a hard safety net on Google Cloud spend for the lunchmate project so a
runaway Maps/Places bill can't accumulate:

1. **Budget alert at $150** — email notification.
2. **Billing cap at $200** — a Cloud Function detaches the billing account
   from the project, stopping all spend.
3. **Quota monitoring dashboard** — a bookmarked URL.

## Approach

Single Cloud Billing **budget** sized at the $200 cap, with notification
threshold rules at:

- **75% ($150)** → email alert (the "$150 alert")
- **90% ($180)** → early-warning email
- **100% ($200)** → publishes to Pub/Sub, which triggers the kill-switch
  Cloud Function

This is Google's canonical "cap costs" pattern. The $150 alert falls out
naturally as 75% of the $200 budget, so a single budget resource covers both
requirements.

Alternatives considered and rejected:
- **Two budgets** ($150 alert-only + $200 cap): cleaner absolute numbers, but
  double the resources to manage for no real benefit.
- **Cloud Monitoring alert policies** on billing metrics: more moving parts,
  overkill for a fixed threshold.

## Architecture / data flow

```
Budget ($200, scoped to lunchmate-496819)
   │  on every threshold crossing → publishes JSON message
   ▼
Pub/Sub topic  "billing-cap"
   │  Eventarc push
   ▼
Cloud Function (gen2, Node 20)  "capBilling"
   │  if costAmount >= budgetAmount AND billing currently enabled:
   │     CloudBillingClient.updateProjectBillingInfo({ billingAccountName: "" })
   ▼
Billing detached → all project spend stops
```

The budget message schema (base64 in `event.data.message.data`) includes
`costAmount`, `budgetAmount`, `budgetDisplayName`, `alertThresholdExceeded`,
and `currencyCode`. The function only needs `costAmount` and `budgetAmount`.

## Components (committed to repo)

A GCP Cloud Function is **infrastructure**, not a product app. The pnpm
workspace globs are `apps/*` and `packages/*`; this code lives in a new
top-level `infra/billing-cap/` directory that is intentionally **outside**
the workspace so `pnpm -r dev/build/lint` never touches it and it keeps its
own isolated dependencies.

- **`infra/billing-cap/index.js`** — the `capBilling` CloudEvent handler.
  - Decodes the base64 Pub/Sub payload to JSON.
  - Compares `costAmount` vs `budgetAmount`.
  - If under budget → log and return (no-op).
  - If at/over budget → look up current billing info; if billing is already
    disabled, log and return (idempotent); otherwise call
    `updateProjectBillingInfo` with an empty `billingAccountName` to detach
    billing.
- **`infra/billing-cap/package.json`** — isolated package, `"type": "module"`,
  Node 20 engine, deps `@google-cloud/billing` and
  `@google-cloud/functions-framework` (the latter for local testing only).
- **`infra/billing-cap/.gitignore`** — ignores `node_modules`.
- **`infra/billing-cap/README.md`** — the operator runbook (see below).

## Runbook (executed by the user with their own GCP auth)

`gcloud` is not installed in the dev environment and these commands touch a
live billing account, so the README documents the exact steps for the user to
run. Outline:

1. Install + authenticate gcloud (`gcloud auth login`,
   `gcloud config set project lunchmate-496819`).
2. Enable required APIs: `cloudbilling`, `cloudfunctions`, `run`,
   `cloudbuild`, `pubsub`, `eventarc`.
3. Create the Pub/Sub topic `billing-cap`.
4. Create a dedicated service account for the function and grant it
   `roles/billing.admin` **on the billing account** (needed to detach billing).
5. Deploy `capBilling` (gen2, Node 20, `--trigger-topic=billing-cap`, region
   `us-central1`, running as the dedicated SA).
6. Find the billing account ID (`gcloud billing accounts list`) and create the
   budget: amount $200, scoped to project `lunchmate-496819`, threshold rules
   0.75 / 0.9 / 1.0, wired to the `billing-cap` topic for notifications.
7. (Optional) Create a Cloud Monitoring email notification channel so alert
   emails go to a chosen address rather than only billing admins.
8. Bookmark the quota dashboard:
   `https://console.cloud.google.com/iam-admin/quotas?project=lunchmate-496819`
   and the Maps/Places metrics pages.

## Error handling / safety

- The function is **idempotent**: it checks `billingEnabled` before acting, so
  repeated threshold messages at 100% don't error.
- A live end-to-end test is **destructive** — it really detaches billing and
  takes the app offline until billing is manually re-linked. The runbook
  therefore recommends testing the function logic locally via
  functions-framework with a synthetic over-budget payload, not against the
  real project.

## Out of scope

- Re-enabling billing automatically (must be a deliberate manual action).
- Per-API granular disabling (rejected during design in favor of the hard cap).
- Terraform/IaC (rejected; plain function + runbook chosen).
