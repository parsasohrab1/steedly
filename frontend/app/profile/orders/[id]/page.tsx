'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowRight, FaCreditCard, FaTimes } from 'react-icons/fa';
import { shopAPI, paymentsAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';
import {
  orderStatusLabels,
  orderStatusColors,
  paymentStatusLabels,
  formatToman,
  canPayOrder,
  canCancelOrder,
} from '@/lib/orderStatus';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number | string;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number | string;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: string;
  created_at: string;
  items: OrderItem[];
}

interface Payment {
  id: number;
  amount: string;
  status: string;
  ref_id?: string;
  created_at: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const [orderRes, paymentsRes] = await Promise.all([
        shopAPI.getOrder(orderId),
        paymentsAPI.getOrderPayments(orderId).catch(() => null),
      ]);
      setOrder(orderRes.data.data);
      setPayments(paymentsRes?.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'سفارش یافت نشد');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/auth/login');
      return;
    }
    load();
  }, [load, router]);

  const handlePay = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await paymentsAPI.requestPayment(orderId);
      window.location.href = res.data.data.payment_url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'اتصال به درگاه پرداخت ممکن نشد');
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('آیا از لغو این سفارش مطمئن هستید؟')) return;
    setBusy(true);
    setError('');
    try {
      await shopAPI.cancelOrder(orderId);
      setMessage('سفارش لغو شد');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'لغو سفارش ممکن نشد');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="در حال بارگذاری سفارش..." />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ErrorMessage message={error || 'سفارش یافت نشد'} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/profile/orders"
        className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-2 mb-6"
      >
        <FaArrowRight />
        بازگشت به سفارشات
      </Link>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>
      )}
      {message && (
        <div className="mb-4">
          <SuccessMessage message={message} onDismiss={() => setMessage('')} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">سفارش #{order.order_number}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleString('fa-IR')}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              orderStatusColors[order.status] || orderStatusColors.pending
            }`}
          >
            {orderStatusLabels[order.status] || order.status}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">وضعیت پرداخت</dt>
            <dd className={order.payment_status === 'paid' ? 'text-green-600 font-semibold' : 'text-yellow-700 font-semibold'}>
              {paymentStatusLabels[order.payment_status] || order.payment_status}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">روش پرداخت</dt>
            <dd>{order.payment_method === 'cash' ? 'پرداخت در محل' : 'پرداخت آنلاین'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-500">آدرس ارسال</dt>
            <dd className="whitespace-pre-line">{order.shipping_address}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">اقلام سفارش</h2>
        <ul className="divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {item.product_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product_image} alt={item.product_name} className="w-14 h-14 rounded object-cover" />
                )}
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity.toLocaleString('fa-IR')} × {formatToman(item.price)}
                  </p>
                </div>
              </div>
              <span className="font-semibold">{formatToman(Number(item.price) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-4 mt-2 flex justify-between text-lg font-bold">
          <span>مبلغ کل</span>
          <span className="text-primary-600">{formatToman(order.total_amount)}</span>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">تراکنش‌ها</h2>
          <ul className="space-y-2 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{new Date(p.created_at).toLocaleString('fa-IR')}</span>
                <span className={p.status === 'paid' ? 'text-green-600' : p.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>
                  {paymentStatusLabels[p.status] || p.status}
                  {p.ref_id ? ` — کد پیگیری ${p.ref_id}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {canPayOrder(order) && (
          <button
            onClick={handlePay}
            disabled={busy}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaCreditCard />
            پرداخت آنلاین
          </button>
        )}
        {canCancelOrder(order) && (
          <button
            onClick={handleCancel}
            disabled={busy}
            className="flex-1 border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaTimes />
            لغو سفارش
          </button>
        )}
      </div>
    </div>
  );
}
