'use client';

import { useState } from 'react';
import type { CriterionFeedback, ReferenceCategory, TechniqueDiscipline, VideoAnalysisResult } from '@asbaan/shared';
import { REFERENCE_CATEGORY_LABELS, TECHNIQUE_CRITERIA, TECHNIQUE_REFERENCE_LIBRARY } from '@asbaan/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const REFERENCE_CATEGORIES = Object.keys(REFERENCE_CATEGORY_LABELS) as ReferenceCategory[];

function verdictLabel(v: CriterionFeedback['verdict']) {
  if (v === 'correct') return { text: 'صحیح', cls: 'ok' };
  if (v === 'needs_improvement') return { text: 'نیاز به بهبود', cls: 'watch' };
  return { text: 'نادرست', cls: 'alert' };
}

export default function TechniquePage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [discipline, setDiscipline] = useState<TechniqueDiscipline>('jumping');
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refCategory, setRefCategory] = useState<ReferenceCategory>('walk');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const submitRes = await fetch(`${API_BASE}/v1/technique/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId: 'demo-rider', discipline, videoUrl }),
      });
      if (!submitRes.ok) throw new Error();
      const submission = await submitRes.json();
      const analyzeRes = await fetch(`${API_BASE}/v1/technique/videos/${submission.id}/analyze`, { method: 'POST' });
      if (!analyzeRes.ok) throw new Error();
      setResult(await analyzeRes.json());
    } catch {
      setError('اتصال به سرور برقرار نشد — بک‌اند اسبان را روی http://localhost:3000 اجرا کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h2 className="section-title">
        اصلاح تکنیک سوارکاری <span className="tag">VIDEO FEEDBACK</span>
      </h2>
      <p className="lede">
        ویدیوی سواری خود را بارگذاری کنید تا طبق استانداردهای روز دنیا بازخورد فنی دریافت کنید.
      </p>
      <div className="note">
        تحلیل واقعی ویدیو نیازمند مدل بینایی کامپیوتر (pose-estimation روی بدن سوارکار و اسب) است که هنوز پیاده‌سازی
        نشده — نمونه‌های مشابه در بازار جهانی: Equus AI، Ridesum، Rider Analysis. نتیجه زیر یک شبیه‌سازی قطعی
        (deterministic) بر پایه معیارهای واقعی کوچینگ است تا رابط کاربری و ساختار بازخورد از هم‌اکنون قابل بررسی باشد.
      </div>

      <h3 style={{ fontSize: 14.5, margin: '0 0 10px' }}>کتابخانه تکنیک ایده‌آل</h3>
      <p className="lede">ویدیوهای مرجع واقعی برای هر گام و رشته — منبع مقایسه پیش از ارسال ویدیوی خودتان.</p>
      <div className="subtabs">
        {REFERENCE_CATEGORIES.map((cat) => (
          <a
            key={cat}
            className={refCategory === cat ? 'active' : ''}
            onClick={() => setRefCategory(cat)}
            style={{ cursor: 'pointer' }}
          >
            {REFERENCE_CATEGORY_LABELS[cat]}
          </a>
        ))}
      </div>
      <div className="film-grid" style={{ marginBlockEnd: 28 }}>
        {TECHNIQUE_REFERENCE_LIBRARY.filter((v) => v.category === refCategory).map((v) => (
          <a className="film-card" key={v.id} href={v.url} target="_blank" rel="noopener noreferrer">
            <div className="film-poster" style={{ padding: 0, overflow: 'hidden' }}>
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                '🎬'
              )}
            </div>
            <div className="film-body">
              <h4>{v.title}</h4>
              <span>{v.sourceLabel}</span>
              <p style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>{v.descriptionFa}</p>
            </div>
          </a>
        ))}
      </div>

      <h3 style={{ fontSize: 14.5, margin: '0 0 10px' }}>ارسال ویدیوی خودتان برای بازخورد</h3>
      <form className="card" style={{ maxWidth: 520, marginBlockEnd: 24 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>رشته</label>
          <select value={discipline} onChange={(e) => setDiscipline(e.target.value as TechniqueDiscipline)}>
            <option value="jumping">پرش</option>
            <option value="dressage">دراساژ</option>
            <option value="eventing">ایونتینگ</option>
          </select>
        </div>
        <div className="field">
          <label>لینک ویدیو</label>
          <input
            type="url"
            required
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'در حال تحلیل...' : 'ارسال برای تحلیل'}
        </button>
        {error && <p className="form-note">{error}</p>}
      </form>

      {result ? (
        <div className="card-grid">
          {result.feedback.map((f) => {
            const def = TECHNIQUE_CRITERIA.find((c) => c.key === f.key)!;
            const v = verdictLabel(f.verdict);
            return (
              <div className="card" key={f.key}>
                <div className={`tier-badge ${v.cls}`}>
                  <span className="dot" />
                  <span>{v.text}</span>
                </div>
                <h4>{def.label}</h4>
                <p>{f.note}</p>
                <p style={{ marginTop: 6, fontSize: 11.5 }}>
                  <b>استاندارد: </b>
                  {def.standard}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-grid">
          {TECHNIQUE_CRITERIA.map((c) => (
            <div className="card" key={c.key}>
              <h4>{c.label}</h4>
              <p>{c.standard}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
