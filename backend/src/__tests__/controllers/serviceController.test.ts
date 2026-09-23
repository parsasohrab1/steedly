import { Response, NextFunction } from 'express';
import { createReview, updateBookingStatus } from '../../controllers/serviceController';
import { query } from '../../database/connection';
import { AuthRequest } from '../../middleware/auth';

jest.mock('../../database/connection');
jest.mock('../../services/notificationService', () => ({ createNotification: jest.fn() }));
jest.mock('../../services/emailService', () => ({ sendBookingReminderEmail: jest.fn() }));

const mockQuery = query as jest.MockedFunction<typeof query>;

const makeReq = (body: any, params: any = {}, user = { id: 5, email: 'u@x.com', role: 'user' }) =>
  ({ body, params, user } as unknown as AuthRequest);

describe('Service Controller', () => {
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  describe('createReview', () => {
    it('rejects reviews for bookings that are not completed', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, status: 'pending', service_type: 'veterinarian', service_provider_id: 2 }] });

      await createReview(makeReq({ booking_id: 1, rating: 5 }), res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('rejects a second review for the same booking', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'completed', service_type: 'veterinarian', service_provider_id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ id: 9 }] });

      await createReview(makeReq({ booking_id: 1, rating: 4 }), res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('already been reviewed') }));
    });

    it('uses the provider from the booking, not the request body', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'completed', service_type: 'transporter', service_provider_id: 2 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        .mockResolvedValueOnce({ rows: [] });

      await createReview(
        makeReq({ booking_id: 1, rating: 4, service_provider_id: 99, service_type: 'veterinarian' }),
        res as Response,
        next
      );

      expect(mockQuery.mock.calls[2][1]).toEqual([1, 5, 2, 'transporter', 4, undefined]);
      expect(mockQuery.mock.calls[3][0]).toContain('horse_transporters');
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateBookingStatus', () => {
    it("forbids confirming someone else's booking", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 7, status: 'pending', service_type: 'veterinarian', service_provider_id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ user_id: 8 }] });

      await updateBookingStatus(makeReq({ status: 'confirmed' }, { id: '1' }), res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('lets the customer cancel their own booking', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 5, status: 'pending', service_type: 'veterinarian', service_provider_id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ user_id: 8 }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'cancelled' }] });

      await updateBookingStatus(makeReq({ status: 'cancelled' }, { id: '1' }), res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('does not let the customer mark their booking completed', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 5, status: 'confirmed', service_type: 'veterinarian', service_provider_id: 2 }] })
        .mockResolvedValueOnce({ rows: [{ user_id: 8 }] });

      await updateBookingStatus(makeReq({ status: 'completed' }, { id: '1' }), res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });
});
