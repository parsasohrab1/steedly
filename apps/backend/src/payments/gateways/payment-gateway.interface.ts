export interface PaymentRequestParams {
  amountRial: number;
  description: string;
  callbackUrl: string;
}

export interface PaymentRequestResult {
  /** Gateway-issued transaction reference; needed again at verify time. */
  authority: string;
  /** URL the client should be redirected to in order to pay. */
  paymentUrl: string;
}

export interface PaymentVerifyParams {
  authority: string;
  amountRial: number;
}

export interface PaymentVerifyResult {
  success: boolean;
  /** Gateway-issued settlement reference, only present on success. */
  refId?: string;
  errorMessage?: string;
}

/** Implemented by each payment gateway adapter (ZarinPal, the local dev mock, …). */
export interface PaymentGateway {
  readonly id: 'zarinpal' | 'mock';
  request(params: PaymentRequestParams): Promise<PaymentRequestResult>;
  verify(params: PaymentVerifyParams): Promise<PaymentVerifyResult>;
}
