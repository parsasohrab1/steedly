import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requestPayment, verifyPayment, getGatewayMode } from '../services/paymentService';
import { createNotification } from '../services/notificationService';

type PaymentClient = 'web' | 'android';

const apiBaseUrl = () => process.env.API_URL || 'http://localhost:3000/api';
const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3001';
const androidScheme = () => process.env.ANDROID_PAYMENT_SCHEME || 'asbban';

// Where the user's browser is sent once the gateway returns
export const buildResultRedirect = (
  client: PaymentClient,
  orderId: number,
  status: 'success' | 'failed',
  refId?: string
): string => {
  const params = new URLSearchParams({ payment: status });
  if (refId) params.set('ref_id', refId);

  if (client === 'android') {
    params.set('order_id', String(orderId));
    return `${androidScheme()}://payment/result?${params.toString()}`;
  }
  return `${frontendUrl()}/orders/${orderId}/success?${params.toString()}`;
};

/**
 * POST /api/payments/orders/:orderId/request
 * Starts an online payment for one of the current user's unpaid orders.
 */
export const startOrderPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user!.id;
    const client: PaymentClient = req.body?.client === 'android' ? 'android' : 'web';

    if (!Number.isInteger(orderId)) {
      return next(createError('Invalid order id', 400));
    }

    const orderResult = await query(
      `SELECT o.*, u.email, u.phone
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );
    if (orderResult.rows.length === 0) {
      return next(createError('Order not found', 404));
    }
    const order = orderResult.rows[0];

    if (order.payment_status === 'paid') {
      return next(createError('Order is already paid', 400));
    }
    if (order.status === 'cancelled') {
      return next(createError('Order is cancelled', 400));
    }

    const amount = parseFloat(order.total_amount);
    const { authority, paymentUrl } = await requestPayment({
      amount,
      description: `پرداخت سفارش ${order.order_number}`,
      callbackUrl: `${apiBaseUrl()}/payments/callback`,
      mobile: order.phone || undefined,
      email: order.email || undefined,
    });

    await query(
      `INSERT INTO payments (order_id, user_id, amount, gateway, authority, status, client)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
      [orderId, userId, amount, getGatewayMode(), authority, client]
    );

    // Online payment chosen after the fact (e.g. retrying a cash order online)
    if (order.payment_method !== 'online') {
      await query(
        `UPDATE orders SET payment_method = 'online', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [orderId]
      );
    }

    res.json({
      success: true,
      data: {
        payment_url: paymentUrl,
        authority,
        gateway: getGatewayMode(),
      },
    });
  } catch (error: any) {
    if (error?.message && !error.statusCode) {
      return next(createError(`Payment gateway error: ${error.message}`, 502));
    }
    next(error);
  }
};

/**
 * GET /api/payments/callback?Authority=...&Status=OK|NOK
 * Called by the user's browser when Zarinpal redirects back. Verifies the
 * payment and redirects to the web app or the Android deep link.
 */
export const paymentCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authority = String(req.query.Authority || '');
    const status = String(req.query.Status || '');

    if (!authority) {
      return next(createError('Missing authority', 400));
    }

    const paymentResult = await query(
      'SELECT * FROM payments WHERE authority = $1',
      [authority]
    );
    if (paymentResult.rows.length === 0) {
      return next(createError('Payment not found', 404));
    }
    const payment = paymentResult.rows[0];
    const client: PaymentClient = payment.client === 'android' ? 'android' : 'web';

    // Reloading the callback page must not re-verify or double-notify
    if (payment.status === 'paid') {
      return res.redirect(buildResultRedirect(client, payment.order_id, 'success', payment.ref_id));
    }
    if (payment.status === 'failed') {
      return res.redirect(buildResultRedirect(client, payment.order_id, 'failed'));
    }

    const markFailed = async () => {
      await query(
        `UPDATE payments SET status = 'failed', verified_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [payment.id]
      );
      await query(
        `UPDATE orders SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND payment_status <> 'paid'`,
        [payment.order_id]
      );
    };

    if (status !== 'OK') {
      await markFailed();
      return res.redirect(buildResultRedirect(client, payment.order_id, 'failed'));
    }

    const verification = await verifyPayment(authority, parseFloat(payment.amount));
    if (!verification.success) {
      await markFailed();
      return res.redirect(buildResultRedirect(client, payment.order_id, 'failed'));
    }

    await query(
      `UPDATE payments
       SET status = 'paid', ref_id = $1, card_pan = $2, verified_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [verification.refId || null, verification.cardPan || null, payment.id]
    );
    const orderResult = await query(
      `UPDATE orders
       SET payment_status = 'paid',
           status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING order_number, user_id`,
      [payment.order_id]
    );

    try {
      const order = orderResult.rows[0];
      await createNotification(
        order.user_id,
        'order',
        'پرداخت موفق',
        `پرداخت سفارش ${order.order_number} با موفقیت انجام شد. کد پیگیری: ${verification.refId || '-'}`,
        `/profile/orders/${payment.order_id}`
      );
    } catch (notifError) {
      console.error('Error creating payment notification:', notifError);
    }

    res.redirect(buildResultRedirect(client, payment.order_id, 'success', verification.refId));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/orders/:orderId
 * Payment attempts for one of the current user's orders.
 */
export const getOrderPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      `SELECT p.id, p.amount, p.gateway, p.status, p.ref_id, p.card_pan, p.created_at, p.verified_at
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE p.order_id = $1 AND o.user_id = $2
       ORDER BY p.created_at DESC`,
      [req.params.orderId, req.user!.id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
