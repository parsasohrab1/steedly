# Testing Guide

## Installing Dependencies

### Backend
```bash
cd backend
npm install --save-dev jest @types/jest ts-jest @testing-library/jest-dom
```

### Frontend
```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

## Running tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Testing with Coverage
```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

## Test structure

### Backend
```
backend/
  src/
    __tests__/
      controllers/
        authController.test.ts
        blogController.test.ts
      middleware/
        auth.test.ts
      setup.ts
```

### Frontend
```
frontend/
  src/
    __tests__/
      components/
        Header.test.tsx
      lib/
        api.test.ts
```

## Writing a new test

### Backend test example

```typescript
import { Request, Response } from 'express';
import { myFunction } from '../controllers/myController';

describe('My Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = { body: {} };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should do something', async () => {
    // Arrange
    mockRequest.body = { key: 'value' };

    // Act
    await myFunction(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

### Frontend test example

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Coverage Goals

- **Backend**: At least 70% coverage
- **Frontend**: At least 60% coverage

## CI/CD Integration

Tests run automatically in GitHub Actions. For more details see `.github/workflows/ci.yml`.

