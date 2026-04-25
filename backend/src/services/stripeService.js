/**
 * Stripe is allowed to be mocked for this MVP.
 * This service keeps payment concerns isolated.
 */
async function createPaymentIntentMock({ amount, currency }) {
  const id = `pi_mock_${Math.random().toString(36).slice(2)}`;
  return { id, amount, currency, status: 'requires_capture' };
}

module.exports = { createPaymentIntentMock };

