'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartService, CartItem } from '@/lib/cart';
import { shopAPI, paymentsAPI } from '@/lib/api';
import { FaLock } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import SuccessMessage from '@/components/SuccessMessage';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    shipping_address: '',
    payment_method: 'online',
    phone: '',
  });

  useEffect(() => {
    const cartItems = cartService.getItems();
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }
    setItems(cartItems);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const response = await shopAPI.createOrder({
        items: orderItems,
        shipping_address: formData.shipping_address,
        payment_method: formData.payment_method,
      });

      if (response.data.success) {
        const orderId = response.data.data.id;
        // The order now exists (stock is reserved), so the cart is no longer needed
        cartService.clear();

        if (formData.payment_method === 'online') {
          try {
            const payment = await paymentsAPI.requestPayment(orderId);
            window.location.href = payment.data.data.payment_url;
            return;
          } catch {
            // The order page offers a "pay now" retry if the gateway is unavailable
            router.push(`/orders/${orderId}/success?payment=failed`);
            return;
          }
        }

        router.push(`/orders/${orderId}/success`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartService.getTotalPrice();

  if (items.length === 0) {
    return null;
  }

  if (loading && items.length > 0) {
    return <LoadingSpinner fullScreen text="در حال ثبت سفارش..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">تکمیل خرید</h1>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">اطلاعات ارسال</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    آدرس ارسال *
                  </label>
                  <textarea
                    required
                    value={formData.shipping_address}
                    onChange={(e) =>
                      setFormData({ ...formData, shipping_address: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="آدرس کامل خود را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شماره تماس *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="09123456789"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">روش پرداخت</h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                    className="ml-3"
                  />
                  <div>
                    <p className="font-semibold">پرداخت آنلاین</p>
                    <p className="text-sm text-gray-600">
                      پرداخت از طریق درگاه بانکی
                    </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={formData.payment_method === 'cash'}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                    className="ml-3"
                  />
                  <div>
                    <p className="font-semibold">پرداخت در محل</p>
                    <p className="text-sm text-gray-600">پرداخت هنگام تحویل</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">خلاصه سفارش</h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toLocaleString('fa-IR')} تومان</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>جمع کل:</span>
                  <span className="font-semibold">
                    {totalPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-primary-600">
                    {totalPrice.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <FaLock />
                    تکمیل خرید
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                با کلیک روی دکمه بالا، شما شرایط و قوانین را می‌پذیرید
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

