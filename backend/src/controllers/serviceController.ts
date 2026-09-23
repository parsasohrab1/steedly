import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notificationService';
import { sendBookingReminderEmail } from '../services/emailService';

export const getVeterinarians = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { region, specialization, latitude, longitude, radius } = req.query;

    const params: any[] = [];
    let paramCount = 1;

    let queryText = `
      SELECT id, full_name, specialization, region, phone, email,
             image_url, latitude, longitude, address,
             rating, total_reviews, is_verified
    `;

    // If location is provided, calculate distance
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = radius ? parseFloat(radius as string) : 50; // Default 50km

      queryText += `,
        (
          6371 * acos(
            cos(radians($${paramCount++})) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians($${paramCount++})) +
            sin(radians($${paramCount++})) *
            sin(radians(latitude))
          )
        ) AS distance
      `;
      params.push(lat, lng, lat);

      queryText += `
        FROM veterinarians
        WHERE is_active = true
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians($${paramCount - 3})) *
              cos(radians(latitude)) *
              cos(radians(longitude) - radians($${paramCount - 2})) +
              sin(radians($${paramCount - 1})) *
              sin(radians(latitude))
            )
          ) <= $${paramCount++}
      `;
      params.push(radiusKm);
    } else {
      queryText += `
        FROM veterinarians
        WHERE is_active = true
      `;
    }

    if (region && !latitude) {
      queryText += ` AND region ILIKE $${paramCount++}`;
      params.push(`%${region}%`);
    }
    if (specialization) {
      queryText += ` AND specialization ILIKE $${paramCount++}`;
      params.push(`%${specialization}%`);
    }

    if (latitude && longitude) {
      queryText += ' ORDER BY distance ASC, rating DESC';
    } else {
      queryText += ' ORDER BY rating DESC, total_reviews DESC';
    }

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getVeterinarian = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM veterinarians WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return next(createError('Veterinarian not found', 404));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const registerVeterinarian = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { full_name, specialization, region, phone, email, resume, image_url, latitude, longitude, address } = req.body;
    const userId = req.user!.id;

    const result = await query(
      `INSERT INTO veterinarians 
       (user_id, full_name, specialization, region, phone, email, resume, image_url, latitude, longitude, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [userId, full_name, specialization, region, phone, email, resume, image_url, latitude, longitude, address]
    );

    res.status(201).json({
      success: true,
      message: 'Veterinarian registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateVeterinarian = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { full_name, specialization, region, phone, email, resume, image_url } = req.body;

    // Verify ownership
    const check = await query(
      'SELECT user_id FROM veterinarians WHERE id = $1',
      [id]
    );
    if (check.rows.length === 0) {
      return next(createError('Veterinarian not found', 404));
    }
    if (check.rows[0].user_id !== req.user!.id) {
      return next(createError('Unauthorized', 403));
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (full_name) { updates.push(`full_name = $${paramCount++}`); values.push(full_name); }
    if (specialization) { updates.push(`specialization = $${paramCount++}`); values.push(specialization); }
    if (region) { updates.push(`region = $${paramCount++}`); values.push(region); }
    if (phone) { updates.push(`phone = $${paramCount++}`); values.push(phone); }
    if (email) { updates.push(`email = $${paramCount++}`); values.push(email); }
    if (resume) { updates.push(`resume = $${paramCount++}`); values.push(resume); }
    if (image_url) { updates.push(`image_url = $${paramCount++}`); values.push(image_url); }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE veterinarians SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Veterinarian updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getTransporters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { region, latitude, longitude, radius } = req.query;

    let queryText = `
      SELECT id, company_name, contact_name, region, phone, email,
             latitude, longitude, address, equipment,
             rating, total_reviews, is_verified
    `;

    const params: any[] = [];
    let paramCount = 1;

    // If location is provided, calculate distance
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = radius ? parseFloat(radius as string) : 50; // Default 50km

      queryText += `,
        (
          6371 * acos(
            cos(radians($${paramCount++})) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians($${paramCount++})) +
            sin(radians($${paramCount++})) *
            sin(radians(latitude))
          )
        ) AS distance
      `;
      params.push(lat, lng, lat);

      queryText += `
        FROM horse_transporters
        WHERE is_active = true
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND (
            6371 * acos(
              cos(radians($${paramCount - 3})) *
              cos(radians(latitude)) *
              cos(radians(longitude) - radians($${paramCount - 2})) +
              sin(radians($${paramCount - 1})) *
              sin(radians(latitude))
            )
          ) <= $${paramCount++}
      `;
      params.push(radiusKm);
    } else {
      queryText += `
        FROM horse_transporters
        WHERE is_active = true
      `;
    }

    if (region && !latitude) {
      queryText += ` AND region ILIKE $${paramCount++}`;
      params.push(`%${region}%`);
    }

    if (latitude && longitude) {
      queryText += ' ORDER BY distance ASC, rating DESC';
    } else {
      queryText += ' ORDER BY rating DESC, total_reviews DESC';
    }

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const getTransporter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM horse_transporters WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return next(createError('Transporter not found', 404));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const registerTransporter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { company_name, contact_name, phone, email, region, equipment, transport_info, latitude, longitude, address } = req.body;
    const userId = req.user!.id;

    const result = await query(
      `INSERT INTO horse_transporters 
       (user_id, company_name, contact_name, phone, email, region, equipment, transport_info, latitude, longitude, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [userId, company_name, contact_name, phone, email, region, equipment, transport_info, latitude, longitude, address]
    );

    res.status(201).json({
      success: true,
      message: 'Transporter registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransporter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { company_name, contact_name, phone, email, region, equipment, transport_info } = req.body;

    // Verify ownership
    const check = await query(
      'SELECT user_id FROM horse_transporters WHERE id = $1',
      [id]
    );
    if (check.rows.length === 0) {
      return next(createError('Transporter not found', 404));
    }
    if (check.rows[0].user_id !== req.user!.id) {
      return next(createError('Unauthorized', 403));
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (company_name) { updates.push(`company_name = $${paramCount++}`); values.push(company_name); }
    if (contact_name) { updates.push(`contact_name = $${paramCount++}`); values.push(contact_name); }
    if (phone) { updates.push(`phone = $${paramCount++}`); values.push(phone); }
    if (email) { updates.push(`email = $${paramCount++}`); values.push(email); }
    if (region) { updates.push(`region = $${paramCount++}`); values.push(region); }
    if (equipment) { updates.push(`equipment = $${paramCount++}`); values.push(equipment); }
    if (transport_info) { updates.push(`transport_info = $${paramCount++}`); values.push(transport_info); }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE horse_transporters SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Transporter updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { service_type, service_provider_id, booking_date, description } = req.body;
    const userId = req.user!.id;

    if (!['veterinarian', 'transporter'].includes(service_type)) {
      return next(createError('Invalid service type', 400));
    }

    const result = await query(
      `INSERT INTO service_bookings 
       (user_id, service_type, service_provider_id, booking_date, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, service_type, service_provider_id, booking_date, description]
    );

    // Get user info
    const userResult = await query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Get service provider info
    const tableName = service_type === 'veterinarian' ? 'veterinarians' : 'horse_transporters';
    const providerResult = await query(
      `SELECT ${service_type === 'veterinarian' ? 'full_name' : 'contact_name'} as name FROM ${tableName} WHERE id = $1`,
      [service_provider_id]
    );
    const serviceName = service_type === 'veterinarian' ? 'دامپزشک' : 'اسب‌کش';
    const providerName = providerResult.rows[0]?.name || serviceName;

    // Parse booking date
    const bookingDate = new Date(booking_date);
    const dateStr = bookingDate.toLocaleDateString('fa-IR');
    const timeStr = bookingDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    // Create notification for booking
    try {
      await createNotification(
        userId,
        'booking',
        'رزرو جدید',
        `رزرو شما برای ${serviceName} با موفقیت ثبت شد.`,
        `/profile/bookings/${result.rows[0].id}`
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Send booking confirmation email
    try {
      await sendBookingReminderEmail(
        user.email,
        user.full_name,
        service_type,
        providerName,
        dateStr,
        timeStr
      );
    } catch (emailError) {
      console.error('Error sending booking email:', emailError);
      // Don't fail booking creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT sb.*,
              COALESCE(v.full_name, t.company_name, t.contact_name) AS provider_name,
              COALESCE(v.phone, t.phone) AS provider_phone,
              EXISTS (
                SELECT 1 FROM service_reviews sr WHERE sr.booking_id = sb.id
              ) AS has_review
       FROM service_bookings sb
       LEFT JOIN veterinarians v
         ON sb.service_type = 'veterinarian' AND v.id = sb.service_provider_id
       LEFT JOIN horse_transporters t
         ON sb.service_type = 'transporter' AND t.id = sb.service_provider_id
       WHERE sb.user_id = $1
       ORDER BY sb.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return next(createError('Invalid status', 400));
    }

    const bookingResult = await query(
      'SELECT * FROM service_bookings WHERE id = $1',
      [id]
    );
    if (bookingResult.rows.length === 0) {
      return next(createError('Booking not found', 404));
    }
    const booking = bookingResult.rows[0];

    // Admins can set any status; the provider behind the booking can manage it;
    // the customer who made it may only cancel it.
    const user = req.user!;
    let allowed = user.role === 'admin';
    if (!allowed) {
      const providerTable = booking.service_type === 'veterinarian' ? 'veterinarians' : 'horse_transporters';
      const providerResult = await query(
        `SELECT user_id FROM ${providerTable} WHERE id = $1`,
        [booking.service_provider_id]
      );
      const isProvider = providerResult.rows[0]?.user_id === user.id;
      const isOwner = booking.user_id === user.id;
      allowed = isProvider || (isOwner && status === 'cancelled');
    }
    if (!allowed) {
      return next(createError('Insufficient permissions', 403));
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return next(createError(`Booking is already ${booking.status}`, 400));
    }

    const result = await query(
      `UPDATE service_bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    res.json({
      success: true,
      message: 'Booking status updated',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { booking_id, service_provider_id, service_type, rating, comment } = req.body;
    const userId = req.user!.id;

    if (rating < 1 || rating > 5) {
      return next(createError('Rating must be between 1 and 5', 400));
    }

    const result = await query(
      `INSERT INTO service_reviews 
       (booking_id, user_id, service_provider_id, service_type, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [booking_id, userId, service_provider_id, service_type, rating, comment]
    );

    // Update provider rating
    const tableName = service_type === 'veterinarian' ? 'veterinarians' : 'horse_transporters';
    await query(
      `UPDATE ${tableName} 
       SET total_reviews = total_reviews + 1,
           rating = (rating * total_reviews + $1) / (total_reviews + 1)
       WHERE id = $2`,
      [rating, service_provider_id]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { serviceType, providerId } = req.params;

    const result = await query(
      `SELECT sr.*, u.full_name as reviewer_name
       FROM service_reviews sr
       LEFT JOIN users u ON sr.user_id = u.id
       WHERE sr.service_type = $1 AND sr.service_provider_id = $2
       ORDER BY sr.created_at DESC`,
      [serviceType, providerId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

