const CONTACTS = [
  { icon: '✉️', title: 'ایمیل پشتیبانی', value: 'info@asbaan.ir' },
  { icon: '📞', title: 'تلفن پشتیبانی', value: '021-XXXXXXX' },
  { icon: '📍', title: 'آدرس دفتر مرکزی', value: 'تهران — آدرس دقیق پس از راه‌اندازی رسمی اعلام می‌شود' },
  { icon: '💬', title: 'شبکه‌های اجتماعی', value: 'اینستاگرام و تلگرام اسبان — به‌زودی راه‌اندازی می‌شود' },
];

export default function ContactPage() {
  return (
    <main className="container">
      <h2 className="section-title">تماس با ما</h2>
      <p className="lede">راه‌های ارتباطی زیر جای‌گاه اطلاعات تماس رسمی اسبان هستند و پیش از انتشار نهایی تکمیل می‌شوند.</p>
      <div className="contact-grid">
        {CONTACTS.map((c) => (
          <div className="card" key={c.title}>
            <div style={{ fontSize: 20, marginBlockEnd: 8 }}>{c.icon}</div>
            <h4>{c.title}</h4>
            <p className="num">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="note" style={{ marginTop: 18 }}>
        برای اطلاع از فدراسیون رسمی سوارکاری ایران (نهاد نظارتی، نه بخشی از اسبان)، می‌توانید به{' '}
        <a href="https://feiorg.ir" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 600 }}>
          feiorg.ir
        </a>{' '}
        مراجعه کنید.
      </div>
    </main>
  );
}
