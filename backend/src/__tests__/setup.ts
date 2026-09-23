import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/steedly_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

