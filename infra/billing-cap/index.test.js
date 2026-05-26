import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldDisableBilling, parseBudgetMessage } from './index.js';

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
