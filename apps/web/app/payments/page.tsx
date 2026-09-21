'use client';

import { useState } from 'react';
import type { Payment } from '@asbaan/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function PaymentsPage() {
  const [amount, setAmount] = useState(1500000);
  const [description, setDescription] = useState('ویزیت دامپزشک');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/v1/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payableType: 'booking', payableId: 'demo-booking', amountRial: amount, description }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPayment(data.payment);
      setPaymentUrl(data.paymentUrl);
    } catch {
      setError('اتصال به سرور برقرار نشد — بک‌اند اسبان را روی http://localhost:3000 اجرا کنید.');
    }
  }

  async function handlePay() {
    const res = await fetch(paymentUrl);
    setPayment(await res.json());
  }

  return (
    <main className="container">
      <h2 className="section-title">
        پرداخت <span className="tag">ZARINPAL / MOCK</span>
      </h2>
      <p className="lede">
        درگاه پرداخت اصلی زرین‌پال است (چون Stripe/PayPal از ایران در دسترس نیستند)؛ وقتی متغیر محیطی
        <code style={{ margin: '0 6px' }}>ZARINPAL_MERCHANT_ID</code>
        روی بک‌اند تنظیم نشده باشد، به‌طور خودکار از یک درگاه آزمایشی (mock) بدون تراکنش واقعی استفاده می‌شود —
        دقیقاً همان چیزی که این صفحه با آن کار می‌کند.
      </p>

      <form className="card" style={{ maxWidth: 480 }} onSubmit={handleCreate}>
        <div className="field">
          <label>مبلغ (ریال)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>بابت</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary">ایجاد درخواست پرداخت</button>
        {error && <p className="form-note">{error}</p>}
      </form>

      {payment && (
        <div className="card" style={{ maxWidth: 480, marginBlockStart: 16 }}>
          <h4>وضعیت پرداخت</h4>
          <p className="num">
            شناسه: {payment.id}
            <br />
            درگاه: {payment.gateway}
            <br />
            وضعیت: {payment.status}
            {payment.refId && (
              <>
                <br />
                کد پیگیری: {payment.refId}
              </>
            )}
          </p>
          {payment.status === 'pending' && paymentUrl && (
            <button className="btn-primary" onClick={handlePay} style={{ marginTop: 10 }}>
              شبیه‌سازی بازگشت از درگاه (تکمیل پرداخت)
            </button>
          )}
        </div>
      )}
    </main>
  );
}
