import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/emailService';
import { createNotification } from '../services/notificationService';

// Helper function to create slug
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to generate order number
const generateOrderNumber = (): string => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const categoryId = req.query.category_id as string;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT 
        p.id, p.name, p.slug, p.short_description, p.price, 
        p.compare_at_price, p.images, p.stock_quantity, p.is_active,
        pc.name as category_name, pc.slug as category_slug
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_active = true
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (categoryId) {
      queryText += ` AND p.category_id = $${paramCount++}`;
      params.push(categoryId);
    }
    if (search) {
      queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ` ORDER BY p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(queryText, params);
    // Reuse the same filters (without pagination) for the total count
    const countParams = params.slice(0, params.length - 2);
    let countQuery = 'SELECT COUNT(*) FROM products p WHERE p.is_active = true';
    let countParam = 1;
    if (categoryId) {
      countQuery += ` AND p.category_id = $${countParam++}`;
    }
    if (search) {
      countQuery += ` AND (p.name ILIKE $${countParam} OR p.description ILIKE $${countParam})`;
    }
    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        products: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const result = await query(
      `SELECT 
        p.*,
        pc.name as category_name, pc.slug as category_slug
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.slug = $1 AND p.is_active = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return next(createError('Product not found', 404));
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      'SELECT * FROM product_categories ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { items, shipping_address, payment_method } = req.body;
  const userId = req.user!.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(createError('Order items are required', 400));
  }
  if (!shipping_address || typeof shipping_address !== 'string' || !shipping_address.trim()) {
    return next(createError('Shipping address is required', 400));
  }
  const paymentMethod = payment_method || 'online';
  if (!['online', 'cash'].includes(paymentMethod)) {
    return next(createError('Invalid payment method', 400));
  }

  // Merge duplicate lines and reject non-positive / fractional quantities
  const quantities = new Map<number, number>();
  for (const item of items) {
    const productId = Number(item?.product_id);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      return next(createError('Invalid order item', 400));
    }
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }

  const client = await getClient();
  let orderId: number;
  let orderNumber: string;
  let totalAmount = 0;

  try {
    await client.query('BEGIN');

    const lineItems: { product_id: number; quantity: number; price: string }[] = [];
    for (const [productId, quantity] of quantities) {
      // Lock the row so concurrent orders cannot oversell the same stock
      const product = await client.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 AND is_active = true FOR UPDATE',
        [productId]
      );

      if (product.rows.length === 0) {
        throw createError(`Product ${productId} not found`, 404);
      }
      if (product.rows[0].stock_quantity < quantity) {
        throw createError(`Insufficient stock for ${product.rows[0].name}`, 400);
      }

      totalAmount += parseFloat(product.rows[0].price) * quantity;
      lineItems.push({ product_id: productId, quantity, price: product.rows[0].price });
    }

    orderNumber = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, order_number, total_amount, shipping_address, payment_method, status, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'pending')
       RETURNING id`,
      [userId, orderNumber, totalAmount, shipping_address.trim(), paymentMethod]
    );
    orderId = orderResult.rows[0].id;

    for (const item of lineItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    client.release();
    return next(error);
  }
  client.release();

  try {
    const finalOrder = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product_name', p.name
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [orderId]
    );

    // Get user info for email
    const userResult = await query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Prepare order items for email
    const emailItems = finalOrder.rows[0].items.map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.price),
    }));

    // Create notification for order
    try {
      await createNotification(
        userId,
        'order',
        'سفارش جدید',
        `سفارش شما با شماره ${orderNumber} ثبت شد. مبلغ کل: ${totalAmount.toLocaleString('fa-IR')} تومان`,
        `/profile/orders/${orderId}`
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        user.email,
        user.full_name,
        {
          orderNumber,
          totalAmount,
          items: emailItems,
          shippingAddress: shipping_address,
        }
      );
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: finalOrder.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [id, userId]
    );
    if (orderResult.rows.length === 0) {
      throw createError('Order not found', 404);
    }
    const order = orderResult.rows[0];

    // Once paid or handed to shipping, cancellation needs support (refund)
    if (order.status !== 'pending' || order.payment_status === 'paid') {
      throw createError('Only unpaid pending orders can be cancelled', 400);
    }

    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [id]
    );
    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    const updated = await client.query(
      `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Order cancelled',
      data: updated.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
};

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT * FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
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

export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return next(createError('Order not found', 404));
    }

    const itemsResult = await query(
      `SELECT oi.*, p.name as product_name, p.images[1] as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...orderResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status) {
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return next(createError('Invalid status', 400));
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (payment_status) {
      if (!['pending', 'paid', 'failed', 'refunded'].includes(payment_status)) {
        return next(createError('Invalid payment status', 400));
      }
      updates.push(`payment_status = $${paramCount++}`);
      values.push(payment_status);
    }

    if (updates.length === 0) {
      return next(createError('No fields to update', 400));
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return next(createError('Order not found', 404));
    }

    const order = result.rows[0];

    // Send status update email if status changed
    if (status) {
      try {
        const userResult = await query(
          'SELECT email, full_name FROM users WHERE id = $1',
          [order.user_id]
        );
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          await sendOrderStatusUpdateEmail(
            user.email,
            user.full_name,
            order.order_number,
            status
          );
        }
      } catch (emailError) {
        console.error('Error sending order status update email:', emailError);
        // Don't fail status update if email fails
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

