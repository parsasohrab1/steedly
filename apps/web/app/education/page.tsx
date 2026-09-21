'use client';

import { useState } from 'react';

type Disc = 'jump' | 'dressage' | 'eventing' | 'race' | 'archery';

const TABS: { id: Disc; label: string }[] = [
  { id: 'jump', label: 'پرش (Jumping)' },
  { id: 'dressage', label: 'دراساژ (Dressage)' },
  { id: 'eventing', label: 'ایونتینگ (Eventing)' },
  { id: 'race', label: 'کورس (اسب‌دوانی)' },
  { id: 'archery', label: 'کمان‌سواری' },
];

const RESOURCES: Record<Disc, { title: string; desc: string; href: string }[]> = {
  jump: [
    { title: 'FEI Jumping Education System', desc: 'نظام رسمی آموزش پرش فدراسیون جهانی سوارکاری (FEI)', href: 'https://inside.fei.org/fei/sgo/sh/jumping/education' },
    { title: 'FEI Campus — Jumping Courses', desc: 'دوره‌های آنلاین سطح مبتدی تا پیشرفته', href: 'https://campus.fei.org/course/index.php?categoryid=4' },
  ],
  dressage: [
    { title: 'FEI Dressage — Useful Documents', desc: 'مستندات رسمی آموزش و قوانین دراساژ', href: 'https://inside.fei.org/fei/disc/dressage/useful-docs' },
    { title: 'Dressage: The Ultimate Guide', desc: 'راهنمای جامع FEI برای درک اصول دراساژ', href: 'https://www.fei.org/stories/sport/dressage/dressage-ultimate-guide-tokyo-2020' },
  ],
  eventing: [
    { title: 'FEI Eventing Downloads', desc: 'مستندات و آیین‌نامه رسمی ایونتینگ', href: 'https://inside.fei.org/fei/your-role/organisers/eventing/downloads' },
    { title: 'USEF — راهنمای تازه‌واردان به ایونتینگ', desc: 'مناسب برای سوارکاران تازه‌کار در این رشته', href: 'https://www.usef.org/compete/disciplines/eventing/content/first-time-user' },
  ],
  race: [
    { title: 'IFHA — فدراسیون بین‌المللی اسب‌دوانی', desc: 'قوانین، رتبه‌بندی جهانی و استانداردهای مسابقات کورس', href: 'https://www.ifhaonline.org' },
    { title: 'فدراسیون سوارکاری ایران', desc: 'اخبار و آیین‌نامه‌های داخلی مسابقات کورس در ایران', href: 'https://feiorg.ir' },
  ],
  archery: [
    { title: 'International Horseback Archery Alliance', desc: 'قوانین بین‌المللی، رتبه‌بندی و مسابقات پستی کمان‌سواری', href: 'https://ihaa.info/' },
    { title: 'World Federation of Equestrian Archery', desc: 'سیستم آموزشی مبتنی بر متد Kassai', href: 'https://wfea.world/about-us/' },
  ],
};

export default function EducationPage() {
  const [tab, setTab] = useState<Disc>('jump');

  return (
    <main className="container">
      <h2 className="section-title">
        آموزش‌های سوارکاری <span className="tag">EDUCATION</span>
      </h2>
      <p className="lede">منابع رسمی و معتبر بین‌المللی و داخلی، به تفکیک رشته.</p>

      <div className="subtabs">
        {TABS.map((t) => (
          <a key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)} style={{ cursor: 'pointer' }}>
            {t.label}
          </a>
        ))}
      </div>

      <div className="resource-list">
        {RESOURCES[tab].map((r) => (
          <a className="resource-item" key={r.href} href={r.href} target="_blank" rel="noopener noreferrer">
            <div>
              <div className="r-title">{r.title}</div>
              <div className="r-desc">{r.desc}</div>
            </div>
            <span className="r-arrow">↗</span>
          </a>
        ))}
      </div>
    </main>
  );
}
