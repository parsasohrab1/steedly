import { randomUUID } from 'crypto';
import {
  PaymentGateway,
  PaymentRequestParams,
  PaymentRequestResult,
  PaymentVerifyParams,
  PaymentVerifyResult,
} from './payment-gateway.interface';

/**
 * Local dev / demo gateway — no network call, no real money ever moves. Used
 * automatically whenever ZARINPAL_MERCHANT_ID is not configured, so the payment
 * flow (create -> redirect -> callback -> verify) can be built and tested end to
 * end without a real merchant account.
 */
export class MockGateway implements PaymentGateway {
  readonly id = 'mock' as const;

  async request(params: PaymentRequestParams): Promise<PaymentRequestResult> {
    const authority = `MOCK-${randomUUID()}`;
    return {
      authority,
      paymentUrl: `${params.callbackUrl}?Authority=${authority}&Status=OK&mock=true`,
    };
  }

  async verify(_params: PaymentVerifyParams): Promise<PaymentVerifyResult> {
    return { success: true, refId: `MOCK-REF-${Date.now()}` };
  }
}
