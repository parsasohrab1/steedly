import {
  PaymentGateway,
  PaymentRequestParams,
  PaymentRequestResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
} from './payment-gateway.interface';

/**
 * Real ZarinPal v4 REST contract (Iran's most widely used payment gateway — Stripe/
 * PayPal aren't reachable from Iran, which is why this is the gateway implemented
 * here rather than a generic international processor). Needs a real merchant_id in
 * ZARINPAL_MERCHANT_ID to actually move money; PaymentsService falls back to
 * MockGateway when that env var isn't set, so local dev never needs real credentials.
 *
 * Docs: https://www.zarinpal.com/docs/paymentGateway/connectToGateway
 */
export class ZarinpalGateway implements PaymentGateway {
  readonly id = 'zarinpal' as const;

  private readonly merchantId: string;
  private readonly sandbox: boolean;
  private readonly apiBase: string;
  private readonly startPayBase: string;

  constructor(merchantId: string, sandbox = false) {
    this.merchantId = merchantId;
    this.sandbox = sandbox;
    this.apiBase = sandbox ? 'https://sandbox.zarinpal.com/pg/v4/payment' : 'https://payment.zarinpal.com/pg/v4/payment';
    this.startPayBase = sandbox ? 'https://sandbox.zarinpal.com/pg/StartPay' : 'https://payment.zarinpal.com/pg/StartPay';
  }

  async request(params: PaymentRequestParams): Promise<PaymentRequestResult> {
    const res = await fetch(`${this.apiBase}/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount: params.amountRial,
        callback_url: params.callbackUrl,
        description: params.description,
      }),
    });
    const body = await res.json();

    if (body?.data?.code !== 100 || !body?.data?.authority) {
      const message = body?.errors?.message ?? 'ZarinPal payment request failed';
      throw new Error(message);
    }

    return {
      authority: body.data.authority,
      paymentUrl: `${this.startPayBase}/${body.data.authority}`,
    };
  }

  async verify(params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    const res = await fetch(`${this.apiBase}/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount: params.amountRial,
        authority: params.authority,
      }),
    });
    const body = await res.json();

    // 100 = freshly verified, 101 = already verified earlier — both are success.
    if (body?.data?.code === 100 || body?.data?.code === 101) {
      return { success: true, refId: String(body.data.ref_id) };
    }
    return { success: false, errorMessage: body?.errors?.message ?? `ZarinPal verify failed (code ${body?.data?.code})` };
  }
}
