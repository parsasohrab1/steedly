import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CreatePaymentInput } from '@asbaan/shared';
import { PaymentsService } from './payments.service';

@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  async create(@Body() body: CreatePaymentInput) {
    const base = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    const callbackUrl = `${base}/v1/payments/callback`;
    const { payment, paymentUrl } = await this.payments.createPayment(body, callbackUrl);
    return { payment, paymentUrl };
  }

  /**
   * ZarinPal (and the mock gateway) redirect the payer's browser here with
   * ?Authority=...&Status=OK|NOK after they complete or cancel payment.
   */
  @Get('callback')
  async callback(@Query('Authority') authority: string, @Query('Status') status: string, @Res() res: Response) {
    const payment = await this.payments.handleCallback(authority, status);
    // A real deployment redirects back into the app (deep link); returning JSON
    // here keeps this endpoint testable without a mobile/web client attached.
    res.json(payment);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.payments.getPayment(id);
  }
}
