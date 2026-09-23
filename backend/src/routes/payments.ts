import express from 'express';
import { startOrderPayment, paymentCallback, getOrderPayments } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /payments/orders/{orderId}/request:
 *   post:
 *     summary: Start an online (Zarinpal) payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client:
 *                 type: string
 *                 enum: [web, android]
 *     responses:
 *       200:
 *         description: Gateway URL to open in the browser
 */
router.post('/orders/:orderId/request', authenticate, startOrderPayment);

/**
 * @swagger
 * /payments/orders/{orderId}:
 *   get:
 *     summary: List payment attempts for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders/:orderId', authenticate, getOrderPayments);

/**
 * @swagger
 * /payments/callback:
 *   get:
 *     summary: Gateway return URL (redirects to the web app or Android deep link)
 *     tags: [Payments]
 */
router.get('/callback', paymentCallback);

export default router;
