import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreatePaymentInput, Payment } from '@asbaan/shared';
import { PaymentGateway } from './gateways/payment-gateway.interface';
import { ZarinpalGateway } from './gateways/zarinpal.gateway';
import { MockGateway } from './gateways/mock.gateway';

@Injectable()
export class PaymentsService {
  private readonly gateway: PaymentGateway;
  private payments = new Map<string, Payment>();
  private byAuthority = new Map<string, string>(); // authority -> payment id

  constructor() {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    this.gateway = merchantId
      ? new ZarinpalGateway(merchantId, process.env.ZARINPAL_SANDBOX !== 'false')
      : new MockGateway();
  }

  async createPayment(input: CreatePaymentInput, callbackUrl: string): Promise<{ payment: Payment; paymentUrl: string }> {
    const { authority, paymentUrl } = await this.gateway.request({
      amountRial: input.amountRial,
      description: input.description,
      callbackUrl,
    });

    const now = new Date().toISOString();
    const payment: Payment = {
      id: randomUUID(),
      ...input,
      status: 'pending',
      gateway: this.gateway.id,
      authority,
      createdAtIso: now,
      updatedAtIso: now,
    };
    this.payments.set(payment.id, payment);
    this.byAuthority.set(authority, payment.id);

    return { payment, paymentUrl };
  }

  async handleCallback(authority: string, gatewayStatus: string): Promise<Payment> {
    const paymentId = this.byAuthority.get(authority);
    if (!paymentId) throw new NotFoundException(`No payment found for authority ${authority}`);
    const payment = this.payments.get(paymentId)!;

    if (gatewayStatus !== 'OK') {
      payment.status = 'canceled';
      payment.updatedAtIso = new Date().toISOString();
      return payment;
    }

    const result = await this.gateway.verify({ authority, amountRial: payment.amountRial });
    payment.status = result.success ? 'paid' : 'failed';
    payment.refId = result.refId;
    payment.updatedAtIso = new Date().toISOString();
    return payment;
  }

  getPayment(id: string): Payment {
    const payment = this.payments.get(id);
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }
}
