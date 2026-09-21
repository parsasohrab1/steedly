import { Logo } from '../components/Logo';

const FEATURES = [
  { title: 'پرونده سلامت اسب', desc: 'سابقه واکسن، نعل، دامپزشک و تغذیه — همیشه در دسترس.' },
  { title: 'رزرو لحظه‌ای', desc: 'دامپزشک، نعلبند و اسب‌کش نزدیک باشگاه، با یک تماس درون‌اپی.' },
  { title: 'اسبان‌پالس', desc: 'بند پوشیدنی هوشمند برای هشدار زودهنگام کولیک، لمینایتیس و آزوتوریا.' },
  { title: 'آموزش و رویداد', desc: 'منابع آموزشی معتبر برای پرش، دراساژ، ایونتینگ، کورس و کمان‌سواری.' },
];

export default function HomePage() {
  return (
    <main className="container">
      <div className="hero">
        <div className="hero-text">
          <h1>همه خدمات سوارکاری، در یک اپ</h1>
          <p>
            رزرو دامپزشک، نعلبند، فروشگاه تجهیزات و کنسانتره، آموزش رشته‌های سوارکاری، و هشدار زودهنگام سلامت اسب با
            دستگاه پوشیدنی «اسبان‌پالس» — همه در یک پلتفرم.
          </p>
          <div className="hero-badges">
            <span className="store-badge">
              <span style={{ fontSize: 20 }}>🍎</span>
              <span>
                <b>App Store</b>
                <span className="soon">به‌زودی</span>
              </span>
            </span>
            <span className="store-badge">
              <span style={{ fontSize: 20 }}>▶</span>
              <span>
                <b>Google Play</b>
                <span className="soon">به‌زودی</span>
              </span>
            </span>
          </div>
        </div>
        <div style={{ width: 120, height: 120, flex: '0 0 auto' }}>
          <Logo size={120} />
        </div>
      </div>

      <h2 className="section-title">چرا اسبان؟</h2>
      <p className="lede">جایگزین تماس تلفنی پراکنده و مراجعه حضوری با یک اکوسیستم یکپارچه.</p>
      <div className="card-grid">
        {FEATURES.map((f) => (
          <div className="card" key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
