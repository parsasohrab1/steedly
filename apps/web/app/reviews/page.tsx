'use client';

import { useEffect, useState } from 'react';
import type { Review, ReviewCategory } from '@asbaan/shared';
import { fetchReviews, submitReview } from '../../lib/api';

const CATEGORIES: { id: ReviewCategory; label: string }[] = [
  { id: 'vet', label: 'دامپزشک' },
  { id: 'farrier', label: 'نعلبند' },
  { id: 'equipment_shop', label: 'فروشگاه تجهیزات' },
  { id: 'feed_supplier', label: 'فروشنده کنسانتره' },
  { id: 'coach', label: 'مربی' },
  { id: 'club_service', label: 'خدمات باشگاه' },
];

const FALLBACK_SAMPLE: Review[] = [
  { id: 's1', category: 'vet', providerName: 'دامپزشک نمونه ۱', rating: 5, comment: 'برخورد سریع در اورژانس.', createdAtIso: '' },
];

export default function ReviewsPage() {
  const [category, setCategory] = useState<ReviewCategory>('vet');
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_SAMPLE);
  const [offline, setOffline] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchReviews(category)
      .then((data) => {
        setReviews(data);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, [category]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await submitReview({
        category: form.get('category') as ReviewCategory,
        providerName: String(form.get('providerName') || ''),
        rating: Number(form.get('rating')) as Review['rating'],
        comment: String(form.get('comment') || ''),
      });
      setNote('نظر شما ثبت شد. سپاسگزاریم!');
    } catch {
      setNote('اتصال به سرور برقرار نشد — بک‌اند اسبان را روی http://localhost:3000 اجرا کنید.');
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">
        نظرات کاربران <span className="tag">RATINGS</span>
      </h2>
      <p className="lede">
        ثبت و مشاهده امتیاز دامپزشک‌ها، نعلبندها، فروشگاه‌های تجهیزات، فروشنده‌های کنسانتره، مربی‌ها و خدمات رفاهی
        باشگاه‌ها در سطح کشور.
      </p>
      {offline && <div className="note">اتصال به بک‌اند برقرار نشد — داده نمونه محلی نمایش داده می‌شود.</div>}

      <div className="subtabs">
        {CATEGORIES.map((c) => (
          <a
            key={c.id}
            className={category === c.id ? 'active' : ''}
            onClick={() => setCategory(c.id)}
            style={{ cursor: 'pointer' }}
          >
            {c.label}
          </a>
        ))}
      </div>

      <div className="card-grid">
        {reviews.map((r) => (
          <div className="card" key={r.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>{r.providerName}</h4>
              {!r.createdAtIso ? <span className="sample-tag">نمونه</span> : null}
            </div>
            <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>

      <form
        className="card"
        style={{ marginBlockStart: 22, maxWidth: 480 }}
        onSubmit={handleSubmit}
      >
        <h4>ثبت نظر جدید</h4>
        <div className="field">
          <label>دسته‌بندی</label>
          <select name="category" defaultValue="vet">
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>نام ارائه‌دهنده خدمت</label>
          <input name="providerName" type="text" placeholder="مثال: دامپزشکی البرز" required />
        </div>
        <div className="field">
          <label>امتیاز</label>
          <select name="rating" defaultValue="5">
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆</option>
            <option value="3">★★★☆☆</option>
            <option value="2">★★☆☆☆</option>
            <option value="1">★☆☆☆☆</option>
          </select>
        </div>
        <div className="field">
          <label>توضیح نظر</label>
          <textarea name="comment" placeholder="تجربه خود را بنویسید..." required />
        </div>
        <button type="submit" className="btn-primary">ثبت نظر</button>
        <p className="form-note">{note}</p>
      </form>
    </main>
  );
}
