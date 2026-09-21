export default function DownloadPage() {
  return (
    <main className="container">
      <h2 className="section-title">دانلود اپلیکیشن</h2>
      <p className="lede">
        اپ اسبان هم‌زمان برای iOS و Android در حال توسعه با React Native (Expo) است تا یک تجربه یکسان روی هر دو
        پلتفرم ارائه شود.
      </p>
      <div className="note">
        این پلتفرم هنوز منتشر نشده؛ کارت‌های زیر جای‌گاه واقعی لینک فروشگاه‌ها هستند و بعد از انتشار رسمی فعال می‌شوند.
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>🍎 App Store</h3>
          <p>نسخه iOS — سازگار با iPhone. وضعیت: در انتظار انتشار</p>
        </div>
        <div className="card">
          <h3>▶ Google Play</h3>
          <p>نسخه Android — سازگار با اکثر گوشی‌های اندرویدی. وضعیت: در انتظار انتشار</p>
        </div>
        <div className="card">
          <h3>📷 کد QR</h3>
          <p>پس از انتشار، کد QR دانلود مستقیم اینجا قرار می‌گیرد.</p>
        </div>
      </div>
    </main>
  );
}
