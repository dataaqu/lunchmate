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
