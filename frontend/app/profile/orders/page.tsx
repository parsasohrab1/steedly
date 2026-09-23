'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { shopAPI } from '@/lib/api';
import Link from 'next/link';
import { FaArrowRight, FaBox } from 'react-icons/fa';

interface Order {
  id: number;
  order_number: string;
  total_amount: number | string;
  status: string;
  payment_status: string;
  created_at: string;
  items?: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels: { [key: string]: string } = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده'
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await shopAPI.getOrders();
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">سفارشات من</h1>
        <Link
          href="/profile"
          className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          بازگشت به پروفایل
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">سفارشی وجود ندارد</h2>
          <p className="text-gray-600 mb-6">شما هنوز سفارشی ثبت نکرده‌اید</p>
          <Link
            href="/shop"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            شروع خرید
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">سفارش #{order.order_number}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div className="text-left">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || statusColors.pending}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">مبلغ کل:</span>
                  <span className="text-xl font-bold text-primary-600">
                    {Number(order.total_amount).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">وضعیت پرداخت:</span>
                  <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                    {order.payment_status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}
                  </span>
                </div>
              </div>

              <Link
                href={`/profile/orders/${order.id}`}
                className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
              >
                مشاهده جزئیات
                <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

