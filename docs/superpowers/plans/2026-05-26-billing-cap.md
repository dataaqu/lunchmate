# Billing Cap (T1.5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hard Google Cloud spend safety net for project `lunchmate-496819` — a budget that emails at $150 and a Cloud Function that detaches billing at $200.

**Architecture:** A Cloud Billing budget ($200) publishes threshold-crossing messages to a Pub/Sub topic `billing-cap`. A gen2 Node 20 Cloud Function `capBilling` is triggered by that topic; when `costAmount >= budgetAmount` and billing is still enabled, it calls the Cloud Billing API to detach the billing account, stopping all spend. The function lives in `infra/billing-cap/`, outside the pnpm workspace. The budget/topic/function are provisioned by the operator via a committed runbook (gcloud isn't installed in dev).

**Tech Stack:** Node.js 20 (ESM), `@google-cloud/billing`, `@google-cloud/functions-framework`, `node:test`, gcloud CLI (Cloud Functions gen2, Pub/Sub, Cloud Billing Budgets API).

**Working directory:** This worktree — `/Users/data/Desktop/lunchmate-T1.5` (branch `task/T1.5-budget-alert-billing-cap`). All paths below are relative to the repo root.

---

## File structure

- `infra/billing-cap/package.json` — isolated package (ESM, Node 20, two deps, test + start scripts).
- `infra/billing-cap/.gitignore` — ignores `node_modules`.
- `infra/billing-cap/.gcloudignore` — keeps `node_modules`, tests, and docs out of the deployed bundle.
- `infra/billing-cap/index.js` — the function: `shouldDisableBilling` (pure), `parseBudgetMessage` (pure), `capBillingHandler` (injectable), and the `capBilling` CloudEvent registration.
- `infra/billing-cap/index.test.js` — `node:test` unit tests for all three exports.
- `infra/billing-cap/README.md` — operator runbook (gcloud commands + quota bookmark).
- `PROJECT_PLAN.md` — flip T1.5 checkbox/status (Task 6).

---

## Task 1: Scaffold the isolated package

**Files:**
- Create: `infra/billing-cap/package.json`
- Create: `infra/billing-cap/.gitignore`
- Create: `infra/billing-cap/.gcloudignore`

- [ ] **Step 1: Create `infra/billing-cap/package.json`**

```json
{
  "name": "billing-cap",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "test": "node --test",
    "start": "functions-framework --target=capBilling --signature-type=cloudevent"
  },
  "dependencies": {
    "@google-cloud/billing": "^4.0.0",
    "@google-cloud/functions-framework": "^3.4.0"
  }
}
```

- [ ] **Step 2: Create `infra/billing-cap/.gitignore`**

```gitignore
node_modules/
```

- [ ] **Step 3: Create `infra/billing-cap/.gcloudignore`**

```gcloudignore
node_modules/
index.test.js
README.md
.gitignore
```

- [ ] **Step 4: Install dependencies**

Run: `cd infra/billing-cap && npm install`
Expected: creates `node_modules/` and `package-lock.json`, exits 0. (`npm`, not `pnpm` — this package is deliberately outside the pnpm workspace.)

- [ ] **Step 5: Commit**

```bash
git add infra/billing-cap/package.json infra/billing-cap/.gitignore infra/billing-cap/.gcloudignore infra/billing-cap/package-lock.json
git commit -m "chore(billing-cap): scaffold isolated Cloud Function package"
```

---

## Task 2: `shouldDisableBilling` decision logic (TDD)

**Files:**
- Create: `infra/billing-cap/index.test.js`
- Create: `infra/billing-cap/index.js`

- [ ] **Step 1: Write the failing test** — create `infra/billing-cap/index.test.js`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldDisableBilling } from './index.js';

test('shouldDisableBilling: under budget -> false', () => {
  assert.equal(shouldDisableBilling({ costAmount: 150, budgetAmount: 200 }), false);
});

test('shouldDisableBilling: at budget -> true', () => {
  assert.equal(shouldDisableBilling({ costAmount: 200, budgetAmount: 200 }), true);
});

test('shouldDisableBilling: over budget -> true', () => {
  assert.equal(shouldDisableBilling({ costAmount: 250, budgetAmount: 200 }), true);
});

test('shouldDisableBilling: missing or zero amounts -> false', () => {
  assert.equal(shouldDisableBilling({}), false);
  assert.equal(shouldDisableBilling({ costAmount: 10, budgetAmount: 0 }), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd infra/billing-cap && node --test`
Expected: FAIL — cannot resolve `./index.js` (file does not exist yet).

- [ ] **Step 3: Write minimal implementation** — create `infra/billing-cap/index.js`

```js
const PROJECT_ID =
  process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || '';

/**
 * Pure decision: should we detach billing given the budget figures?
 */
export function shouldDisableBilling({ costAmount, budgetAmount } = {}) {
  return (
    typeof costAmount === 'number' &&
    typeof budgetAmount === 'number' &&
    budgetAmount > 0 &&
    costAmount >= budgetAmount
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd infra/billing-cap && node --test`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add infra/billing-cap/index.js infra/billing-cap/index.test.js
git commit -m "feat(billing-cap): shouldDisableBilling decision logic"
```

---

## Task 3: `parseBudgetMessage` decoder (TDD)

**Files:**
- Modify: `infra/billing-cap/index.test.js`
- Modify: `infra/billing-cap/index.js`

- [ ] **Step 1: Write the failing test** — append to `infra/billing-cap/index.test.js`

Add `parseBudgetMessage` to the existing import line so it reads:

```js
import { shouldDisableBilling, parseBudgetMessage } from './index.js';
```

Then append these tests:

```js
test('parseBudgetMessage: decodes base64 JSON payload', () => {
  const payload = { costAmount: 10, budgetAmount: 200 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const event = { data: { message: { data } } };
  assert.deepEqual(parseBudgetMessage(event), payload);
});

test('parseBudgetMessage: throws when message has no data', () => {
  assert.throws(() => parseBudgetMessage({ data: { message: {} } }), /no data/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd infra/billing-cap && node --test`
Expected: FAIL — `parseBudgetMessage` is not exported / not a function.

- [ ] **Step 3: Write minimal implementation** — append to `infra/billing-cap/index.js`

```js
/**
 * Decode the base64 Pub/Sub payload published by a Cloud Billing budget.
 */
export function parseBudgetMessage(cloudEvent) {
  const encoded = cloudEvent?.data?.message?.data;
  if (!encoded) {
    throw new Error('Pub/Sub message contained no data');
  }
  return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd infra/billing-cap && node --test`
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add infra/billing-cap/index.js infra/billing-cap/index.test.js
git commit -m "feat(billing-cap): parseBudgetMessage Pub/Sub decoder"
```

---

## Task 4: `capBillingHandler` + CloudEvent entry point (TDD)

**Files:**
- Modify: `infra/billing-cap/index.test.js`
- Modify: `infra/billing-cap/index.js`

- [ ] **Step 1: Write the failing test** — append to `infra/billing-cap/index.test.js`

Update the import line to include `capBillingHandler`:

```js
import { shouldDisableBilling, parseBudgetMessage, capBillingHandler } from './index.js';
```

Then append the helpers and tests:

```js
function makeEvent(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  return { data: { message: { data } } };
}

function makeClient(billingEnabled) {
  const calls = { update: [] };
  return {
    calls,
    async getProjectBillingInfo({ name }) {
      return [{ name: `${name}/billingInfo`, billingEnabled }];
    },
    async updateProjectBillingInfo(req) {
      calls.update.push(req);
      return [{}];
    },
  };
}

test('capBillingHandler: under budget does not disable billing', async () => {
  const client = makeClient(true);
  await capBillingHandler(makeEvent({ costAmount: 150, budgetAmount: 200 }), {
    client,
    projectId: 'lunchmate-496819',
  });
  assert.equal(client.calls.update.length, 0);
});

test('capBillingHandler: over budget disables billing', async () => {
  const client = makeClient(true);
  await capBillingHandler(makeEvent({ costAmount: 200, budgetAmount: 200 }), {
    client,
    projectId: 'lunchmate-496819',
  });
  assert.equal(client.calls.update.length, 1);
  assert.equal(client.calls.update[0].name, 'projects/lunchmate-496819');
  assert.equal(client.calls.update[0].projectBillingInfo.billingAccountName, '');
});

test('capBillingHandler: idempotent when billing already disabled', async () => {
  const client = makeClient(false);
  await capBillingHandler(makeEvent({ costAmount: 300, budgetAmount: 200 }), {
    client,
    projectId: 'lunchmate-496819',
  });
  assert.equal(client.calls.update.length, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd infra/billing-cap && node --test`
Expected: FAIL — `capBillingHandler` is not exported / not a function.

- [ ] **Step 3: Write minimal implementation** — add imports at the TOP of `infra/billing-cap/index.js` (above the existing `PROJECT_ID` line)

```js
import functions from '@google-cloud/functions-framework';
import { CloudBillingClient } from '@google-cloud/billing';
```

Then append the handler and registration at the BOTTOM of `infra/billing-cap/index.js`:

```js
/**
 * Core handler. `deps.client` is injectable so tests never touch real GCP;
 * in production it defaults to a real CloudBillingClient.
 */
export async function capBillingHandler(
  cloudEvent,
  { client, projectId = PROJECT_ID } = {},
) {
  const billing = client ?? new CloudBillingClient();
  const budget = parseBudgetMessage(cloudEvent);
  const { costAmount, budgetAmount } = budget;
  console.log(
    `Budget update: cost=${costAmount} budget=${budgetAmount} ` +
      `(${budget.budgetDisplayName ?? 'budget'})`,
  );

  if (!shouldDisableBilling({ costAmount, budgetAmount })) {
    console.log('Spend under budget — no action taken.');
    return;
  }

  const name = `projects/${projectId}`;
  const [info] = await billing.getProjectBillingInfo({ name });
  if (!info.billingEnabled) {
    console.log('Billing already disabled — no action taken.');
    return;
  }

  await billing.updateProjectBillingInfo({
    name,
    projectBillingInfo: { billingAccountName: '' },
  });
  console.log(`!! Billing DISABLED for ${name} — spend cap reached.`);
}

// gen2 CloudEvent entry point (deployed with --entry-point=capBilling).
functions.cloudEvent('capBilling', (cloudEvent) =>
  capBillingHandler(cloudEvent),
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd infra/billing-cap && node --test`
Expected: PASS — 9 tests pass. (Importing `@google-cloud/functions-framework` only registers the handler; no server starts during tests. The real `CloudBillingClient` is never constructed because every test injects a mock `client`.)

- [ ] **Step 5: Commit**

```bash
git add infra/billing-cap/index.js infra/billing-cap/index.test.js
git commit -m "feat(billing-cap): capBilling handler that detaches billing at cap"
```

---

## Task 5: Operator runbook README

**Files:**
- Create: `infra/billing-cap/README.md`

- [ ] **Step 1: Create `infra/billing-cap/README.md`**

````markdown
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
````

- [ ] **Step 2: Commit**

```bash
git add infra/billing-cap/README.md
git commit -m "docs(billing-cap): operator runbook for budget + deploy"
```

---

## Task 6: Mark T1.5 in the project plan

**Files:**
- Modify: `PROJECT_PLAN.md` (T1.5 block, around line 118-125)

- [ ] **Step 1: Update the T1.5 status line and add an operator note**

Change the status checkbox from unchecked to checked and note that GCP resource creation is operator-run. Find:

```markdown
#### T1.5: Budget Alert + Billing Cap კონფიგურაცია
- [ ] **Status**: TODO
```

Replace with:

```markdown
#### T1.5: Budget Alert + Billing Cap კონფიგურაცია
- [x] **Status**: DONE (code + runbook; GCP resources provisioned via `infra/billing-cap/README.md`)
```

- [ ] **Step 2: Commit**

```bash
git add PROJECT_PLAN.md
git commit -m "chore: mark T1.5 done (billing cap code + runbook)"
```

---

## Notes for the executor

- This package uses **npm**, not pnpm, and is intentionally outside `pnpm-workspace.yaml` globs (`apps/*`, `packages/*`). Don't add it to the workspace.
- Tasks 2–4 build `index.js` and `index.test.js` incrementally; run `node --test` from inside `infra/billing-cap/` each time.
- The actual GCP provisioning (Tasks in the README) is performed by the operator with their own auth — it is **not** part of the automated code execution and is not verifiable from this environment.
- After all tasks: update the `gcp-setup` memory to record the budget/cap exists once the operator confirms it's live.
