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
