'use client';

import { useState } from 'react';
import type { FeedbackMessage } from '@asbaan/shared';
import { submitFeedback } from '../../lib/api';

export default function FeedbackPage() {
  const [note, setNote] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await submitFeedback({
        type: form.get('type') as FeedbackMessage['type'],
        name: String(form.get('name') || '') || undefined,
        email: String(form.get('email') || '') || undefined,
        message: String(form.get('message') || ''),
      });
      setNote('پیام شما ارسال شد. تیم اسبان به‌زودی بررسی می‌کند.');
      e.currentTarget.reset();
    } catch {
      setNote('اتصال به سرور برقرار نشد — بک‌اند اسبان را روی http://localhost:3000 اجرا کنید.');
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">پیشنهادات و انتقادات</h2>
      <p className="lede">نظر شما مستقیم به تیم محصول اسبان می‌رسد.</p>
      <form className="card" style={{ maxWidth: 520 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>نوع پیام</label>
          <select name="type" defaultValue="suggestion">
            <option value="suggestion">پیشنهاد</option>
            <option value="complaint">انتقاد</option>
            <option value="bug">گزارش مشکل فنی</option>
            <option value="other">سایر</option>
          </select>
        </div>
        <div className="field">
          <label>نام (اختیاری)</label>
          <input name="name" type="text" placeholder="نام شما" />
        </div>
        <div className="field">
          <label>ایمیل (اختیاری)</label>
          <input name="email" type="email" placeholder="email@example.com" />
        </div>
        <div className="field">
          <label>متن پیام</label>
          <textarea name="message" placeholder="نظر خود را بنویسید..." required />
        </div>
        <button type="submit" className="btn-primary">ارسال پیام</button>
        <p className="form-note">{note}</p>
      </form>
    </main>
  );
}
