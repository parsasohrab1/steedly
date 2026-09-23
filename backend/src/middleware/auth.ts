import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(createError('Authentication required', 401));
  }

  let decoded: { id: number | string; email: string; role: string };
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as { id: number | string; email: string; role: string };
  } catch (error) {
    // Expired, malformed or wrongly-signed tokens are all authentication failures
    return next(createError('Invalid token', 401));
  }

  // Normalise the id so controllers can pass it straight to SQL/number APIs
  req.user = { id: Number(decoded.id), email: decoded.email, role: decoded.role };
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
};

