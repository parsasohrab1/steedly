export const orderStatusLabels: Record<string, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
};

export const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const paymentStatusLabels: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  failed: 'پرداخت ناموفق',
  refunded: 'بازگشت وجه',
};

export const formatToman = (value: number | string) =>
  `${Number(value || 0).toLocaleString('fa-IR')} تومان`;

// An order can still be paid online while it is open and unpaid
export const canPayOrder = (order: { status: string; payment_status: string }) =>
  order.status !== 'cancelled' && order.payment_status !== 'paid';

// Mirrors the backend rule in shopController.cancelOrder
export const canCancelOrder = (order: { status: string; payment_status: string }) =>
  order.status === 'pending' && order.payment_status !== 'paid';
