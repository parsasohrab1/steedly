'use client';

import { useEffect, useState } from 'react';
import type { HorseBreedInfo } from '@asbaan/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

function BreedCard({ breed }: { breed: HorseBreedInfo }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/v1/wiki-summary?title=${encodeURIComponent(breed.wikipediaTitle)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setThumb(d.thumbnailUrl))
      .catch(() => setFailed(true));
  }, [breed.wikipediaTitle]);

  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ height: 140, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt={breed.nameFa} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 32 }}>{failed ? '🐴' : '⏳'}</span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <h4>{breed.nameFa} <span className="num" style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-muted)' }}>({breed.nameEn})</span></h4>
        <p style={{ marginBottom: 6 }}><b>خاستگاه:</b> {breed.origin}</p>
        <p>{breed.descriptionFa}</p>
      </div>
    </div>
  );
}

export default function BreedsPage() {
  const [breeds, setBreeds] = useState<HorseBreedInfo[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/v1/breeds`)
      .then((r) => r.json())
      .then(setBreeds)
      .catch(() => setError('اتصال به سرور برقرار نشد — بک‌اند اسبان را روی http://localhost:3000 اجرا کنید.'));
  }, []);

  return (
    <main className="container">
      <h2 className="section-title">
        نژادهای اسب <span className="tag">BREEDS</span>
      </h2>
      <p className="lede">
        فهرست نژادهای شناخته‌شده اسب — نه فهرست کامل ۳۰۰+ نژاد ثبت‌شده جهانی، بلکه مجموعه‌ای معتبر شامل نژادهای
        اصلی جهان و نژادهای بومی ایران (کاسپین، ترکمن، دره‌شوری، کرد). تصویر هر نژاد به‌صورت زنده از ویکی‌پدیا
        دریافت می‌شود.
      </p>
      {error && <div className="note">{error}</div>}
      <div className="card-grid">
        {breeds.map((b) => (
          <BreedCard key={b.id} breed={b} />
        ))}
      </div>
    </main>
  );
}
