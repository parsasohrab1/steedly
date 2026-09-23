'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { FaEnvelope } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ارسال ایمیل بازیابی ممکن نشد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">بازیابی رمز عبور</h1>

        {sent ? (
          <p className="text-center text-green-700">
            اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برای شما ارسال شد.
            لطفاً صندوق ایمیل خود را بررسی کنید.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              ایمیل حساب کاربری خود را وارد کنید تا لینک تغییر رمز عبور برایتان ارسال شود.
            </p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            <div className="relative">
              <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ایمیل"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-primary-600 hover:text-primary-500">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    </div>
  );
}
