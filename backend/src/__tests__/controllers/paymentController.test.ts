import { Request, Response, NextFunction } from 'express';
import { paymentCallback, startOrderPayment, buildResultRedirect } from '../../controllers/paymentController';
import { query } from '../../database/connection';
import { verifyPayment, requestPayment } from '../../services/paymentService';
import { AuthRequest } from '../../middleware/auth';

jest.mock('../../database/connection');
jest.mock('../../services/notificationService', () => ({ createNotification: jest.fn() }));
jest.mock('../../services/paymentService', () => ({
  verifyPayment: jest.fn(),
  requestPayment: jest.fn(),
  getGatewayMode: () => 'mock',
}));

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockVerify = verifyPayment as jest.MockedFunction<typeof verifyPayment>;
const mockRequest = requestPayment as jest.MockedFunction<typeof requestPayment>;

describe('Payment Controller', () => {
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    process.env.FRONTEND_URL = 'http://web';
    res = { redirect: jest.fn(), json: jest.fn(), status: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  it('builds web and android result redirects', () => {
    expect(buildResultRedirect('web', 7, 'success', 'R1')).toBe(
      'http://web/orders/7/success?payment=success&ref_id=R1'
    );
    expect(buildResultRedirect('android', 7, 'failed')).toBe(
      'steedly://payment/result?payment=failed&order_id=7'
    );
  });

  it('marks the order paid after a verified callback', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1, order_id: 7, amount: '5000.00', status: 'pending', client: 'android' }] })
      .mockResolvedValueOnce({ rows: [] }) // update payment
      .mockResolvedValueOnce({ rows: [{ order_number: 'ORD-1', user_id: 3 }] }); // update order
    mockVerify.mockResolvedValueOnce({ success: true, code: 100, refId: 'R99' });

    const req = { query: { Authority: 'A1', Status: 'OK' } } as unknown as Request;
    await paymentCallback(req, res as Response, next);

    expect(mockVerify).toHaveBeenCalledWith('A1', 5000);
    expect(mockQuery.mock.calls[2][0]).toContain("payment_status = 'paid'");
    expect(res.redirect).toHaveBeenCalledWith('steedly://payment/result?payment=success&ref_id=R99&order_id=7');
  });

  it('does not verify when the user cancelled at the gateway', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1, order_id: 7, amount: '5000', status: 'pending', client: 'web' }] })
      .mockResolvedValue({ rows: [] });

    const req = { query: { Authority: 'A1', Status: 'NOK' } } as unknown as Request;
    await paymentCallback(req, res as Response, next);

    expect(mockVerify).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('http://web/orders/7/success?payment=failed');
  });

  it('is idempotent for already-paid payments', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, order_id: 7, amount: '5000', status: 'paid', ref_id: 'R5', client: 'web' }],
    });

    const req = { query: { Authority: 'A1', Status: 'OK' } } as unknown as Request;
    await paymentCallback(req, res as Response, next);

    expect(mockVerify).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('http://web/orders/7/success?payment=success&ref_id=R5');
  });

  it('refuses to pay for an already paid order', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 7, payment_status: 'paid', status: 'processing' }] });

    const req = { params: { orderId: '7' }, body: {}, user: { id: 3, email: 'a@b.c', role: 'user' } } as unknown as AuthRequest;
    await startOrderPayment(req, res as Response, next);

    expect(mockRequest).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });
});
