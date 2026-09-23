# راهنمای استفاده از اسکریپت جمع‌آوری محتوا

## 📋 معرفی

اسکریپت جمع‌آوری محتوا برای جمع‌آوری محتوای مرتبط با اسب از سایت‌های فارسی طراحی شده است. این اسکریپت:
- محتوا و متن‌های SEO شده را استخراج می‌کند
- تصاویر را دانلود و بهینه‌سازی می‌کند
- داده‌ها را در فرمت JSON و SQL ذخیره می‌کند

## 🚀 نصب و راه‌اندازی

### 1. نصب Python

```bash
# بررسی نسخه Python (باید 3.8 یا بالاتر باشد)
python --version
```

### 2. نصب وابستگی‌ها

```bash
cd scripts/content-scraper
pip install -r requirements.txt
```

### 3. تنظیمات (اختیاری)

فایل `scripts/content-scraper/sites_config.json` را ویرایش کنید تا:
- سایت‌های مورد نظر را اضافه کنید
- تنظیمات عمومی (تاخیر، تعداد مقالات، کیفیت تصاویر) را تغییر دهید
- Selector های CSS سفارشی برای هر سایت تعریف کنید

برای جزئیات بیشتر، به بخش [⚙️ تنظیمات](#-تنظیمات) مراجعه کنید.

## 📖 استفاده

### روش 1: استفاده ساده

```bash
# Windows
python content_scraper.py

# Linux/Mac
python3 content_scraper.py
```

یا از اسکریپت‌های آماده:

```bash
# Windows
run_scraper.bat

# Linux/Mac
chmod +x run_scraper.sh
./run_scraper.sh
```

### روش 2: استفاده پیشرفته با Selenium

برای سایت‌هایی که محتوا با JavaScript لود می‌شود:

```bash
# ابتدا ChromeDriver را نصب کنید
# Windows: دانلود از https://chromedriver.chromium.org/
# Linux: sudo apt-get install chromium-chromedriver
# Mac: brew install chromedriver

python advanced_scraper.py
```

**نکته**: در `sites_config.json` می‌توانید برای هر سایت به صورت جداگانه `use_selenium: true` تنظیم کنید. اسکریپت اصلی به صورت خودکار از Selenium استفاده می‌کند اگر این گزینه فعال باشد.

## ⚙️ تنظیمات

تمام تنظیمات از فایل `sites_config.json` خوانده می‌شوند. نیازی به تغییر کد نیست!

### اضافه کردن سایت جدید

فایل `scripts/content-scraper/sites_config.json` را ویرایش کنید:

```json
{
  "sites": [
    {
      "name": "نام سایت",
      "base_url": "https://example.com",
      "search_paths": ["/articles", "/blog", "/news"],
      "keywords": ["اسب", "سوارکاری", "مسابقات اسب"],
      "article_selectors": {
        "title": "h1, .article-title, .post-title",
        "content": ".article-content, .post-content, .entry-content",
        "images": "img",
        "date": ".date, .publish-date, time"
      },
      "use_selenium": false
    }
  ],
  "settings": {
    "max_articles_per_site": 50,
    "delay_between_requests": 3,
    "max_images_per_article": 10,
    "min_content_length": 200,
    "image_quality": 85,
    "max_image_size": [1920, 1920]
  }
}
```

### پارامترهای قابل تنظیم

#### پارامترهای سایت (`sites`):

- **`name`**: نام سایت (فقط برای نمایش)
- **`base_url`**: آدرس اصلی سایت
- **`search_paths`**: مسیرهای جستجو برای پیدا کردن مقالات (مثال: `/articles`, `/blog`)
- **`keywords`**: کلمات کلیدی برای فیلتر کردن مقالات مرتبط
- **`article_selectors`** (اختیاری): CSS Selector های سفارشی برای استخراج محتوا
  - `title`: Selector برای عنوان مقاله
  - `content`: Selector برای محتوای اصلی
  - `images`: Selector برای تصاویر
  - `date`: Selector برای تاریخ انتشار
- **`use_selenium`**: استفاده از Selenium برای سایت‌های JavaScript-heavy

#### تنظیمات عمومی (`settings`):

- **`max_articles_per_site`**: حداکثر تعداد مقالات از هر سایت (پیش‌فرض: 50)
- **`delay_between_requests`**: تاخیر بین درخواست‌ها به ثانیه (پیش‌فرض: 3)
- **`max_images_per_article`**: حداکثر تعداد تصاویر برای هر مقاله (پیش‌فرض: 10)
- **`min_content_length`**: حداقل طول محتوا برای اعتبارسنجی (پیش‌فرض: 200 کاراکتر)
- **`image_quality`**: کیفیت تصاویر بهینه شده (0-100، پیش‌فرض: 85)
- **`max_image_size`**: حداکثر اندازه تصویر [عرض, ارتفاع] (پیش‌فرض: [1920, 1920])

### مثال کامل تنظیمات

```json
{
  "sites": [
    {
      "name": "اسب ایران",
      "base_url": "https://www.asbiran.com",
      "search_paths": ["/articles", "/blog", "/news"],
      "keywords": ["اسب", "سوارکاری", "مسابقات اسب", "نژاد اسب"],
      "article_selectors": {
        "title": "h1.article-title",
        "content": ".article-body",
        "images": ".article-content img",
        "date": ".publish-date"
      },
      "use_selenium": false
    }
  ],
  "settings": {
    "max_articles_per_site": 100,
    "delay_between_requests": 5,
    "max_images_per_article": 15,
    "min_content_length": 300,
    "image_quality": 90,
    "max_image_size": [2560, 2560]
  }
}
```

## 📁 ساختار خروجی

پس از اجرای اسکرپر، فایل‌های زیر در پوشه `scraped_content/` ایجاد می‌شوند:

```
scraped_content/
├── data/
│   ├── scraped_content.json          # داده‌ها در فرمت JSON (خام)
│   ├── scraped_content.sql           # داده‌ها برای import به دیتابیس
│   └── scraped_content_validated.json # داده‌های اعتبارسنجی شده (پس از validate_content.py)
└── images/
    ├── abc123def456.jpg              # تصاویر دانلود شده (hash-based naming)
    ├── 789ghi012jkl.png
    └── ...
```

### توضیحات فایل‌ها:

- **`scraped_content.json`**: شامل تمام محتواهای جمع‌آوری شده در فرمت JSON (خام)
- **`scraped_content.sql`**: دستورات SQL برای import مستقیم به PostgreSQL
- **`scraped_content_validated.json`**: محتواهای معتبر پس از اعتبارسنجی (فقط محتواهایی که معیارهای کیفیت را دارند)
- **`images/`**: تمام تصاویر دانلود و بهینه‌سازی شده با نام‌گذاری hash-based برای جلوگیری از duplicate

## 📊 فرمت داده

### JSON Format

```json
{
  "id": "abc123def456",
  "url": "https://example.com/article",
  "slug": "article-title",
  "title": "عنوان مقاله",
  "meta_description": "توضیحات SEO",
  "meta_keywords": "اسب, سوارکاری, مسابقات",
  "content": "متن کامل مقاله...",
  "excerpt": "خلاصه مقاله...",
  "headings": [
    {"level": 1, "text": "عنوان اصلی"},
    {"level": 2, "text": "زیرعنوان"}
  ],
  "images": [
    {
      "path": "images/image1.jpg",
      "alt": "توضیحات تصویر",
      "title": "عنوان تصویر"
    }
  ],
  "scraped_at": "2024-01-15T10:30:00",
  "source": "example.com"
}
```

## 🔄 Import به دیتابیس

### روش 1: استفاده از Python Script

```bash
# ویرایش تنظیمات دیتابیس در import_to_database.py
python import_to_database.py
```

### روش 2: استفاده از SQL

```bash
# Import فایل SQL
psql -U postgres -d steedly -f scraped_content/data/scraped_content.sql
```

### روش 3: استفاده از Backend API

می‌توانید از API endpoint برای import استفاده کنید:

```typescript
// در backend/src/database/seed.ts
import fs from 'fs';
import { query } from './connection';

const contentData = JSON.parse(
  fs.readFileSync('scraped_content/data/scraped_content.json', 'utf-8')
);

for (const item of contentData) {
  await query(`
    INSERT INTO blog_posts (title, slug, excerpt, content, ...)
    VALUES ($1, $2, $3, $4, ...)
  `, [item.title, item.slug, ...]);
}
```

## ✅ اعتبارسنجی محتوا

پس از جمع‌آوری، محتواها را اعتبارسنجی کنید:

```bash
python validate_content.py
```

این اسکریپت:
- محتواهای نامعتبر را شناسایی می‌کند
- محتواهای معتبر را در فایل جداگانه ذخیره می‌کند
- خطاهای اعتبارسنجی را نمایش می‌دهد

## ⚠️ نکات مهم

### 1. رعایت قوانین

- ✅ همیشه `robots.txt` را بررسی کنید
- ✅ بین درخواست‌ها تاخیر بگذارید
- ✅ تعداد درخواست‌ها را محدود کنید
- ✅ فقط از سایت‌هایی که اجازه می‌دهند استفاده کنید

### 2. حقوق نشر

- ⚠️ محتواهای جمع‌آوری شده را با رعایت حقوق نشر استفاده کنید
- ⚠️ در صورت نیاز، منبع را ذکر کنید
- ⚠️ برای استفاده تجاری، مجوز لازم است

### 3. بهینه‌سازی

تمام تنظیمات بهینه‌سازی در `sites_config.json` قابل تغییر است:

- تصاویر به صورت خودکار بهینه می‌شوند (پیش‌فرض: max 1920x1920 در `settings.max_image_size`)
- کیفیت تصاویر: قابل تنظیم در `settings.image_quality` (پیش‌فرض: 85%)
- حداکثر تعداد تصاویر: قابل تنظیم در `settings.max_images_per_article` (پیش‌فرض: 10)

## 🔧 عیب‌یابی

### خطای Connection

```bash
# بررسی اتصال اینترنت
ping google.com

# بررسی فایروال
# در Windows: Windows Defender Firewall
# در Linux: sudo ufw status
```

### خطای Encoding

اگر متن‌ها به درستی نمایش داده نمی‌شوند:

```python
# در content_scraper.py
response.encoding = 'utf-8'  # یا 'windows-1256'
```

### خطای ChromeDriver

```bash
# نصب ChromeDriver
# Windows: دانلود از https://chromedriver.chromium.org/
# Linux: sudo apt-get install chromium-chromedriver
# Mac: brew install chromedriver
```

## 📝 مثال استفاده

### استفاده در کد Python

```python
from content_scraper import ContentScraper

# ایجاد اسکرپر
scraper = ContentScraper(output_dir="my_content")

# اسکرپ یک صفحه خاص
data = scraper.scrape_page("https://example.com/article")

if data:
    print(f"عنوان: {data['title']}")
    print(f"محتوا: {data['content'][:100]}...")

# ذخیره نتایج
scraper.save_to_json("my_data.json")
scraper.save_to_sql("my_data.sql")
```

### استفاده در Backend

```typescript
// در backend/src/database/seed.ts
import fs from 'fs';
import path from 'path';

const scrapedContentPath = path.join(__dirname, '../../scraped_content/data/scraped_content.json');

if (fs.existsSync(scrapedContentPath)) {
  const contentData = JSON.parse(fs.readFileSync(scrapedContentPath, 'utf-8'));
  
  for (const item of contentData) {
    await query(`
      INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, ...)
      VALUES ($1, $2, $3, $4, $5, ...)
    `, [
      item.title,
      item.slug,
      item.excerpt,
      item.content,
      item.images[0]?.path || null,
      // ...
    ]);
  }
}
```

## 🎯 بهترین روش‌ها

1. **تست اولیه**: ابتدا روی یک سایت کوچک تست کنید (`max_articles_per_site: 5` در `sites_config.json`)
2. **اعتبارسنجی**: همیشه محتواها را قبل از import اعتبارسنجی کنید (`validate_content.py`)
3. **بکاپ**: قبل از import، از دیتابیس بکاپ بگیرید
4. **بررسی دستی**: چند محتوا را به صورت دستی بررسی کنید
5. **به‌روزرسانی**: محتواهای قدیمی را به‌روزرسانی کنید
6. **تنظیمات**: از `sites_config.json` برای مدیریت تنظیمات استفاده کنید (نه تغییر مستقیم کد)
7. **رعایت اخلاقی**: تاخیر بین درخواست‌ها را افزایش دهید (`delay_between_requests: 5`)
8. **Selector های سفارشی**: برای سایت‌های خاص، `article_selectors` را در `sites_config.json` تنظیم کنید

## 📚 منابع

- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Requests Documentation](https://requests.readthedocs.io/)

---

**تاریخ ایجاد**: ۱۴۰۳/۱۲/۱۵  
**نسخه**: 1.0

