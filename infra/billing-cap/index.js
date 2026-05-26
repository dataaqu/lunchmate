import functions from '@google-cloud/functions-framework';
import { CloudBillingClient } from '@google-cloud/billing';

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
