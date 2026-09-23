'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { shopAPI, paymentsAPI } from '@/lib/api';
import { FaCheckCircle, FaTimesCircle, FaHome, FaShoppingBag, FaCreditCard } from 'react-icons/fa';
import { orderStatusLabels, paymentStatusLabels, formatToman, canPayOrder } from '@/lib/orderStatus';

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  // Set by the payment callback redirect: "success" | "failed" | null (no online payment attempted)
  const paymentResult = searchParams.get('payment');
  const refId = searchParams.get('ref_id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;
    shopAPI
      .getOrder(orderId)
      .then((response) => {
        if (response.data.success) setOrder(response.data.data);
      })
      .catch((err) => console.error('Error loading order:', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  const retryPayment = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await paymentsAPI.requestPayment(orderId);
      window.location.href = res.data.data.payment_url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'اتصال به درگاه پرداخت ممکن نشد');
      setPaying(false);
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

  const failed = paymentResult === 'failed';
  const title = failed
    ? 'پرداخت ناموفق بود'
    : paymentResult === 'success'
      ? 'پرداخت با موفقیت انجام شد!'
      : 'سفارش شما با موفقیت ثبت شد!';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className={`${failed ? 'bg-red-100' : 'bg-green-100'} rounded-full p-4`}>
              {failed ? (
                <FaTimesCircle className="text-6xl text-red-600" />
              ) : (
                <FaCheckCircle className="text-6xl text-green-600" />
              )}
            </div>
          </div>

          <h1 className={`text-3xl font-bold mb-4 ${failed ? 'text-red-600' : 'text-green-600'}`}>
            {title}
          </h1>

          {failed && (
            <p className="text-gray-600">
              سفارش شما ثبت شده است اما پرداخت انجام نشد. می‌توانید دوباره پرداخت کنید.
            </p>
          )}

          {order && (
            <div className="mt-6 space-y-2">
              <p className="text-lg">
                <span className="font-semibold">شماره سفارش:</span> {order.order_number}
              </p>
              <p className="text-lg">
                <span className="font-semibold">مبلغ کل:</span> {formatToman(order.total_amount)}
              </p>
              <p className="text-lg">
                <span className="font-semibold">وضعیت:</span>{' '}
                {orderStatusLabels[order.status] || order.status}
              </p>
              <p className="text-lg">
                <span className="font-semibold">وضعیت پرداخت:</span>{' '}
                {paymentStatusLabels[order.payment_status] || order.payment_status}
              </p>
              {refId && (
                <p className="text-lg">
                  <span className="font-semibold">کد پیگیری:</span> {refId}
                </p>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-red-600">{error}</p>}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {order && order.payment_method === 'online' && canPayOrder(order) && (
              <button
                onClick={retryPayment}
                disabled={paying}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaCreditCard />
                {failed ? 'تلاش مجدد پرداخت' : 'پرداخت آنلاین'}
              </button>
            )}
            <Link
              href={`/profile/orders/${orderId}`}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
            >
              <FaShoppingBag />
              جزئیات سفارش
            </Link>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
            >
              <FaHome />
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
