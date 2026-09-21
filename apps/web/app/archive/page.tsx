const WORLD_FILMS = [
  { title: 'Seabiscuit', year: '2003', tag: 'درام / اسب‌دوانی', icon: '🐎', href: 'https://en.wikipedia.org/wiki/Seabiscuit_(film)' },
  { title: 'Secretariat', year: '2010', tag: 'درام / اسب‌دوانی', icon: '🏇', href: 'https://en.wikipedia.org/wiki/Secretariat_(film)' },
  { title: 'Black Beauty', year: '1994', tag: 'درام کلاسیک', icon: '🐴', href: 'https://en.wikipedia.org/wiki/Black_Beauty_(1994_film)' },
  { title: 'War Horse', year: '2011', tag: 'درام تاریخی', icon: '🐎', href: 'https://en.wikipedia.org/wiki/War_Horse_(film)' },
  { title: 'The Black Stallion', year: '1979', tag: 'درام کلاسیک', icon: '🐴', href: 'https://en.wikipedia.org/wiki/The_Black_Stallion_(film)' },
  { title: 'The Rider', year: '2017', tag: 'درام معاصر', icon: '🤠', href: 'https://en.wikipedia.org/wiki/The_Rider_(2017_film)' },
];

const IRAN_FILMS = [
  { title: 'مردی که اسب شد', year: '۱۳۹۳', tag: 'ساخته امیرحسین ثقفی', icon: '🐴', href: 'https://fa.wikipedia.org/wiki/مردی_که_اسب_شد' },
  { title: 'فهرست کامل ویکی‌پدیا', year: 'آرشیو', tag: 'رده فیلم‌های اسب‌محور', icon: '🎬', href: 'https://fa.wikipedia.org/wiki/رده:فیلم‌های_درباره_اسب‌ها' },
];

export default function ArchivePage() {
  return (
    <main className="container">
      <h2 className="section-title">
        آرشیو ویدیو و فیلم <span className="tag">BLOG ARCHIVE</span>
      </h2>
      <p className="lede">فیلم‌های شاخص مرتبط با اسب و سوارکاری، ایران و جهان. لینک هر عنوان به صفحه رسمی ویکی‌پدیا می‌رود.</p>

      <h3 style={{ fontSize: 14.5, margin: '18px 0 10px' }}>🌍 جهان</h3>
      <div className="film-grid">
        {WORLD_FILMS.map((f) => (
          <a className="film-card" key={f.title} href={f.href} target="_blank" rel="noopener noreferrer">
            <div className="film-poster">{f.icon}</div>
            <div className="film-body">
              <h4>{f.title}</h4>
              <span className="num">{f.year}</span>
              <br />
              <span className="film-tag">{f.tag}</span>
            </div>
          </a>
        ))}
      </div>

      <h3 style={{ fontSize: 14.5, margin: '24px 0 10px' }}>🇮🇷 ایران</h3>
      <div className="film-grid">
        {IRAN_FILMS.map((f) => (
          <a className="film-card" key={f.title} href={f.href} target="_blank" rel="noopener noreferrer">
            <div className="film-poster">{f.icon}</div>
            <div className="film-body">
              <h4>{f.title}</h4>
              <span className="num">{f.year}</span>
              <br />
              <span className="film-tag">{f.tag}</span>
            </div>
          </a>
        ))}
      </div>
      <p className="form-note" style={{ marginTop: 14 }}>
        به‌جای تصویر پوستر (به‌دلیل حق نشر)، هر کارت با یک نماد نمایش داده می‌شود؛ لینک هر عنوان به منبع معتبر می‌رود.
      </p>
    </main>
  );
}
