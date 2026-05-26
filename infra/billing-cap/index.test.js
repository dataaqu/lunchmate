import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldDisableBilling, parseBudgetMessage, capBillingHandler } from './index.js';

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

test('parseBudgetMessage: decodes base64 JSON payload', () => {
  const payload = { costAmount: 10, budgetAmount: 200 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const event = { data: { message: { data } } };
  assert.deepEqual(parseBudgetMessage(event), payload);
});

test('parseBudgetMessage: throws when message has no data', () => {
  assert.throws(() => parseBudgetMessage({ data: { message: {} } }), /no data/);
});

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
