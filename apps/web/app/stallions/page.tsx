'use client';

import { useEffect, useState } from 'react';
import type { StallionListing } from '@asbaan/shared';
import { authHeaders } from '../../lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function StallionsPage() {
  const [listings, setListings] = useState<StallionListing[]>([]);
  const [note, setNote] = useState('');

  function refresh() {
    fetch(`${API_BASE}/v1/stallions`)
      .then((r) => r.json())
      .then(setListings)
      .catch(() => setNote('اتصال به سرور برقرار نشد.'));
  }

  useEffect(refresh, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API_BASE}/v1/stallions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          horseName: form.get('horseName'),
          breed: form.get('breed'),
          ageYears: Number(form.get('ageYears')) || undefined,
          location: form.get('location'),
          studFeeRial: Number(form.get('studFeeRial')),
          description: form.get('description'),
          contactPhone: form.get('contactPhone') || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setNote('آگهی سیلمی شما ثبت شد.');
      e.currentTarget.reset();
      refresh();
    } catch {
      setNote('ثبت ناموفق بود — ابتدا از صفحه «ثبت‌نام» وارد حساب خود شوید.');
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">
        سیلمی جهت کشش <span className="tag">STUD DIRECTORY</span>
      </h2>
      <p className="lede">
        فهرست پایین با نام و اطلاعات نمونه (<b>«نمونه»</b> علامت‌گذاری شده) پر شده — اطلاعات واقعی مالکان سیلمی‌های
        ایران از وب جمع‌آوری و منتشر نشده، چون انتشار نام و قیمت افراد واقعی بدون رضایت آن‌ها کار درستی نیست. در
        عوض، این یک دایرکتوری واقعی و کاربردی است: هر مالک سیلمی می‌تواند با ثبت‌نام، آگهی خودش را همین‌جا ثبت کند.
      </p>

      <div className="card-grid">
        {listings.map((s) => (
          <div className="card" key={s.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>🐴 {s.horseName}</h4>
              {s.sample && <span className="sample-tag">نمونه</span>}
            </div>
            <p><b>نژاد:</b> {s.breed} {s.ageYears && `— ${s.ageYears} ساله`}</p>
            <p><b>مالک:</b> {s.ownerDisplayName}</p>
            <p><b>محل:</b> {s.location}</p>
            <p><b>هزینه کشش:</b> <span className="num">{s.studFeeRial.toLocaleString('en-US')}</span> ریال</p>
            <p>{s.description}</p>
          </div>
        ))}
      </div>

      <form className="card" style={{ maxWidth: 520, marginBlockStart: 22 }} onSubmit={handleSubmit}>
        <h4>ثبت آگهی سیلمی جدید</h4>
        <div className="field"><label>نام اسب</label><input name="horseName" type="text" required /></div>
        <div className="field"><label>نژاد</label><input name="breed" type="text" required /></div>
        <div className="field"><label>سن (سال)</label><input name="ageYears" type="number" /></div>
        <div className="field"><label>محل نگهداری</label><input name="location" type="text" required /></div>
        <div className="field"><label>هزینه کشش (ریال)</label><input name="studFeeRial" type="number" required /></div>
        <div className="field"><label>شماره تماس (اختیاری)</label><input name="contactPhone" type="text" /></div>
        <div className="field"><label>توضیحات</label><textarea name="description" required /></div>
        <button type="submit" className="btn-primary">ثبت آگهی</button>
        {note && <p className="form-note">{note}</p>}
      </form>
    </main>
  );
}
