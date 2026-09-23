/**
 * Zarinpal payment gateway (REST v4).
 *
 * Modes (PAYMENT_GATEWAY):
 *  - "zarinpal": real gateway, needs ZARINPAL_MERCHANT_ID.
 *    Set ZARINPAL_SANDBOX=true to use sandbox.zarinpal.com.
 *  - "mock": no external calls. The "gateway" URL points straight back to our
 *    callback with Status=OK, so the full flow can be exercised in development.
 *
 * Amounts are sent in Toman (currency IRT), matching the prices stored in the DB.
 */

export type PaymentGatewayMode = 'zarinpal' | 'mock';

export interface PaymentRequestInput {
  amount: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

export interface PaymentRequestResult {
  authority: string;
  paymentUrl: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  refId?: string;
  cardPan?: string;
  code: number;
  message?: string;
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) =>
  Promise<{ json: () => Promise<any> }>;

export const getGatewayMode = (): PaymentGatewayMode =>
  process.env.PAYMENT_GATEWAY === 'zarinpal' ? 'zarinpal' : 'mock';

const zarinpalBase = () =>
  process.env.ZARINPAL_SANDBOX === 'true'
    ? 'https://sandbox.zarinpal.com'
    : 'https://payment.zarinpal.com';

const merchantId = () => {
  const id = process.env.ZARINPAL_MERCHANT_ID;
  if (!id) {
    throw new Error('ZARINPAL_MERCHANT_ID is not configured');
  }
  return id;
};

const postJson = async (fetchImpl: FetchLike, url: string, body: object) => {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
};

// Zarinpal returns `errors` as [] on success and as an object on failure
const zarinpalError = (json: any): string | undefined => {
  const errors = json?.errors;
  if (errors && !Array.isArray(errors) && errors.message) {
    return `${errors.message} (code ${errors.code})`;
  }
  return undefined;
};

export const requestPayment = async (
  input: PaymentRequestInput,
  fetchImpl: FetchLike = fetch as unknown as FetchLike
): Promise<PaymentRequestResult> => {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  if (getGatewayMode() === 'mock') {
    const authority = `MOCK${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const separator = input.callbackUrl.includes('?') ? '&' : '?';
    return {
      authority,
      paymentUrl: `${input.callbackUrl}${separator}Authority=${authority}&Status=OK`,
    };
  }

  const json = await postJson(fetchImpl, `${zarinpalBase()}/pg/v4/payment/request.json`, {
    merchant_id: merchantId(),
    amount: Math.round(input.amount),
    currency: 'IRT',
    callback_url: input.callbackUrl,
    description: input.description,
    metadata: {
      ...(input.mobile ? { mobile: input.mobile } : {}),
      ...(input.email ? { email: input.email } : {}),
    },
  });

  if (json?.data?.code !== 100 || !json.data.authority) {
    throw new Error(zarinpalError(json) || 'Payment request was rejected by the gateway');
  }

  return {
    authority: json.data.authority,
    paymentUrl: `${zarinpalBase()}/pg/StartPay/${json.data.authority}`,
  };
};

export const verifyPayment = async (
  authority: string,
  amount: number,
  fetchImpl: FetchLike = fetch as unknown as FetchLike
): Promise<PaymentVerifyResult> => {
  if (getGatewayMode() === 'mock') {
    return { success: true, code: 100, refId: `MOCK-${authority.slice(-8)}`, cardPan: '6037****0000' };
  }

  const json = await postJson(fetchImpl, `${zarinpalBase()}/pg/v4/payment/verify.json`, {
    merchant_id: merchantId(),
    amount: Math.round(amount),
    authority,
  });

  const code = json?.data?.code;
  // 100 = verified now, 101 = already verified earlier (safe to treat as paid)
  if (code === 100 || code === 101) {
    return {
      success: true,
      code,
      refId: json.data.ref_id !== undefined ? String(json.data.ref_id) : undefined,
      cardPan: json.data.card_pan,
    };
  }

  return {
    success: false,
    code: typeof code === 'number' ? code : json?.errors?.code ?? -1,
    message: zarinpalError(json) || 'Payment verification failed',
  };
};
