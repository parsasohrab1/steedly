import { AuthRequest } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import { register, login, getProfile } from '../../controllers/authController';
import { query } from '../../database/connection';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../database/connection');
jest.mock('bcryptjs');

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Auth Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      user: { id: 1, email: 'test@example.com', role: 'user' },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      mockQuery.mockResolvedValueOnce({ rows: [] }); // No existing user
      mockBcrypt.hash.mockResolvedValueOnce('hashed_password' as never);
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'test@example.com', full_name: 'Test User' }],
      });

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should return error if user already exists', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Test User',
      };

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'existing@example.com' }],
      });

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('already exists'),
        })
      );
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            password_hash: hashedPassword,
            is_active: true,
            full_name: 'Test User',
          },
        ],
      });
      mockBcrypt.compare.mockResolvedValueOnce(true as never);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            token: expect.any(String),
          }),
        })
      );
    });

    it('should return error with incorrect password', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            password_hash: hashedPassword,
            is_active: true,
          },
        ],
      });
      mockBcrypt.compare.mockResolvedValueOnce(false as never);

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid'),
        })
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
          },
        ],
      });

      await getProfile(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      );
    });
  });
});

