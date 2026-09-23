import { requestPayment, verifyPayment } from '../../services/paymentService';

const jsonFetch = (payload: any) =>
  jest.fn().mockResolvedValue({ json: () => Promise.resolve(payload) });

describe('paymentService', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  describe('mock gateway', () => {
    beforeEach(() => {
      delete process.env.PAYMENT_GATEWAY;
    });

    it('returns a URL that points straight back to the callback', async () => {
      const fetchImpl = jsonFetch({});
      const result = await requestPayment(
        { amount: 1000, description: 'test', callbackUrl: 'http://api/payments/callback' },
        fetchImpl
      );

      expect(result.authority).toMatch(/^MOCK/);
      expect(result.paymentUrl).toBe(
        `http://api/payments/callback?Authority=${result.authority}&Status=OK`
      );
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('rejects non-positive amounts', async () => {
      await expect(
        requestPayment({ amount: 0, description: 'x', callbackUrl: 'http://cb' })
      ).rejects.toThrow('Invalid payment amount');
    });
  });

  describe('zarinpal gateway', () => {
    beforeEach(() => {
      process.env.PAYMENT_GATEWAY = 'zarinpal';
      process.env.ZARINPAL_MERCHANT_ID = 'merchant-123';
      process.env.ZARINPAL_SANDBOX = 'true';
    });

    it('requests a payment in Toman and builds the StartPay URL', async () => {
      const fetchImpl = jsonFetch({ data: { code: 100, authority: 'A0000123' }, errors: [] });

      const result = await requestPayment(
        { amount: 250000.4, description: 'order', callbackUrl: 'http://cb', mobile: '0912' },
        fetchImpl
      );

      expect(result).toEqual({
        authority: 'A0000123',
        paymentUrl: 'https://sandbox.zarinpal.com/pg/StartPay/A0000123',
      });
      const [url, init] = fetchImpl.mock.calls[0];
      expect(url).toBe('https://sandbox.zarinpal.com/pg/v4/payment/request.json');
      expect(JSON.parse(init.body)).toMatchObject({
        merchant_id: 'merchant-123',
        amount: 250000,
        currency: 'IRT',
        callback_url: 'http://cb',
        metadata: { mobile: '0912' },
      });
    });

    it('surfaces gateway errors', async () => {
      const fetchImpl = jsonFetch({ data: [], errors: { code: -9, message: 'Validation error' } });

      await expect(
        requestPayment({ amount: 1000, description: 'x', callbackUrl: 'http://cb' }, fetchImpl)
      ).rejects.toThrow('Validation error (code -9)');
    });

    it('fails fast without a merchant id', async () => {
      delete process.env.ZARINPAL_MERCHANT_ID;
      await expect(
        requestPayment({ amount: 1000, description: 'x', callbackUrl: 'http://cb' }, jsonFetch({}))
      ).rejects.toThrow('ZARINPAL_MERCHANT_ID');
    });

    it.each([100, 101])('treats verify code %i as paid', async (code) => {
      const fetchImpl = jsonFetch({ data: { code, ref_id: 987654, card_pan: '6219****1234' }, errors: [] });

      const result = await verifyPayment('A0000123', 1000, fetchImpl);

      expect(result).toEqual({ success: true, code, refId: '987654', cardPan: '6219****1234' });
    });

    it('reports failed verification', async () => {
      const fetchImpl = jsonFetch({ data: [], errors: { code: -51, message: 'Session is not valid' } });

      const result = await verifyPayment('A0000123', 1000, fetchImpl);

      expect(result.success).toBe(false);
      expect(result.code).toBe(-51);
    });
  });
});
