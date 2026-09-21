const NEWS = [
  { source: 'World of Showjumping', title: 'رتبه‌بندی زنده پرش جهانی و اخبار مسابقات CSI', desc: 'پوشش لحظه‌ای رقابت‌های پرش با اسب در سطح جهانی.', href: 'https://www.worldofshowjumping.com/en/news.html' },
  { source: 'EquiRatings', title: 'تحلیل داده‌محور مسابقات پرش و ایونتینگ', desc: 'اخبار پشتیبانی‌شده با آمار و رتبه‌بندی اسب و سوارکار.', href: 'https://news.equiratings.com/categories/show-jumping' },
  { source: 'US Equestrian', title: 'اطلاعیه‌های رسمی فدراسیون سوارکاری آمریکا', desc: 'نتایج، انتخاب تیم‌ها و رویدادهای رسمی.', href: 'https://www.usef.org/media/press-releases' },
  { source: 'HorsesDaily', title: 'اخبار روزانه دنیای سوارکاری', desc: 'خلاصه رویدادهای بین‌المللی پرش، دراساژ و ایونتینگ.', href: 'https://horsesdaily.com/' },
];

export default function NewsPage() {
  return (
    <main className="container">
      <h2 className="section-title">
        اخبار سوارکاری <span className="tag">LIVE FEED (نمونه)</span>
      </h2>
      <p className="lede">
        در نسخه نهایی، این بخش از طریق RSS/News API به‌صورت خودکار و لحظه‌ای به‌روزرسانی می‌شود — دقیقاً همان
        Notification/Ingestion pipeline که در سند معماری پلتفرم توضیح داده شده. موارد زیر نمونه‌ای از منابع خبری
        معتبر جهانی است.
      </p>
      {NEWS.map((n) => (
        <a className="news-item" key={n.href} href={n.href} target="_blank" rel="noopener noreferrer">
          <span className="n-date">{n.source}</span>
          <h4>{n.title}</h4>
          <p>{n.desc}</p>
        </a>
      ))}
    </main>
  );
}
