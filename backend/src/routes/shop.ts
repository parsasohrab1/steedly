import express from 'express';
import {
  getProducts,
  getProduct,
  getCategories,
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus
} from '../controllers/shopController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/products', getProducts);
router.get('/products/:slug', getProduct);
router.get('/categories', getCategories);

// Protected routes
router.post('/orders', authenticate, createOrder);
router.get('/orders', authenticate, getOrders);
router.get('/orders/:id', authenticate, getOrder);
router.put('/orders/:id/cancel', authenticate, cancelOrder);
router.put('/orders/:id/status', authenticate, authorize('admin'), updateOrderStatus);

export default router;

