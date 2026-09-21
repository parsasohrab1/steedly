'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

const LINKS = [
  { href: '/', label: 'خانه' },
  { href: '/register', label: 'ثبت‌نام / ورود' },
  { href: '/download', label: 'دانلود' },
  { href: '/reviews', label: 'نظرات کاربران' },
  { href: '/education', label: 'آموزش‌ها' },
  { href: '/technique', label: 'اصلاح تکنیک' },
  { href: '/breeds', label: 'نژادهای اسب' },
  { href: '/stallions', label: 'سیلمی جهت کشش' },
  { href: '/loyalty', label: 'باشگاه مشتریان' },
  { href: '/body-condition', label: 'وزن و رژیم' },
  { href: '/payments', label: 'پرداخت' },
  { href: '/archive', label: 'آرشیو ویدیو' },
  { href: '/news', label: 'اخبار' },
  { href: '/demo', label: 'دموی محصول' },
  { href: '/feedback', label: 'پیشنهادات و انتقادات' },
  { href: '/contact', label: 'تماس با ما' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'var(--green)',
        color: '#f4f1e6',
        paddingBlock: 12,
        paddingInline: 16,
        borderBottom: '3px solid var(--gold)',
      }}
    >
      <div style={{ maxWidth: 1080, marginInline: 'auto', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <Logo />
          <div>
            <span style={{ fontWeight: 800, fontSize: 19, color: '#f4f1e6', display: 'block' }}>اسبان</span>
            <span style={{ fontSize: 11, color: '#cfe0d4' }}>دستیار هوشمند سوارکار</span>
          </div>
        </Link>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: '1 1 auto' }}>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: '7px 12px',
                  borderRadius: 20,
                  fontSize: 12.5,
                  background: active ? 'var(--gold)' : 'transparent',
                  color: active ? '#1c1706' : '#e7ecdf',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
