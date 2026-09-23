import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendRegistrationEmail, sendPasswordResetEmail } from '../services/emailService';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, full_name, phone } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return next(createError('User already exists', 400));
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES ($1, $2, $3, $4, 'user')
       RETURNING id, email, full_name, phone, role, created_at`,
      [email, passwordHash, full_name, phone]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    );

    // Send registration email
    try {
      await sendRegistrationEmail(user.email, user.full_name);
    } catch (emailError) {
      console.error('Error sending registration email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, full_name, phone, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return next(createError('Invalid credentials', 401));
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return next(createError('Account is deactivated', 403));
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return next(createError('Invalid credentials', 401));
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, phone, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return next(createError('User not found', 404));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { full_name, phone, avatar_url } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(avatar_url);
    }

    if (updates.length === 0) {
      return next(createError('No fields to update', 400));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user!.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, phone, role, avatar_url, updated_at`,
      values
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    const user = result.rows[0];

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    // Store reset token in database (optional - you can create a password_resets table)
    // For now, we'll just send the email with the token

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.full_name, resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return next(createError('Failed to send reset email', 500));
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(createError('Token and new password are required', 400));
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
      if (decoded.type !== 'password_reset') {
        return next(createError('Invalid token type', 400));
      }
    } catch (error) {
      return next(createError('Invalid or expired token', 400));
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [passwordHash, decoded.id]
    );

    if (result.rows.length === 0) {
      return next(createError('User not found', 404));
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

