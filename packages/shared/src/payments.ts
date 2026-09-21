export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'canceled';

export type PayableType = 'booking' | 'marketplace_order' | 'subscription';

export type PaymentGatewayId = 'zarinpal' | 'mock';

export interface Payment {
  id: string;
  payableType: PayableType;
  payableId: string;
  /** Always Iranian Rial — the unit ZarinPal's API expects. */
  amountRial: number;
  description: string;
  status: PaymentStatus;
  gateway: PaymentGatewayId;
  authority?: string;
  refId?: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface CreatePaymentInput {
  payableType: PayableType;
  payableId: string;
  amountRial: number;
  description: string;
}
