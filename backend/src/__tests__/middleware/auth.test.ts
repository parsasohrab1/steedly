import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate user with valid token', async () => {
    const token = 'valid_token';
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (jwt.verify as jest.Mock).mockReturnValueOnce({ id: '1', email: 'test@example.com', role: 'user' });

    await authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest.user).toEqual({ id: 1, email: 'test@example.com', role: 'user' });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 if no token provided', async () => {
    mockRequest.headers = {};

    await authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('should return 401 if token is invalid', async () => {
    const token = 'invalid_token';
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await authenticate(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
    expect(mockRequest.user).toBeUndefined();
  });
});

