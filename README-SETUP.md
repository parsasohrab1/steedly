# راهنمای راه‌اندازی پروژه استیدلی

## پیش‌نیازها

### برای Backend و Frontend (PWA)
- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL (نسخه 12 یا بالاتر)
- Redis (نسخه 6 یا بالاتر)
- npm یا yarn

### برای Android App
- Android Studio Hedgehog (2023.1.1) یا بالاتر
- JDK 17 یا بالاتر
- Android SDK (API Level 24 به بالا)

## نصب و راه‌اندازی

### 1. نصب وابستگی‌ها

```bash
# نصب وابستگی‌های ریشه پروژه
npm install

# نصب وابستگی‌های بک‌اند
cd backend
npm install

# نصب وابستگی‌های فرانت‌اند
cd ../frontend
npm install
```

### 2. راه‌اندازی دیتابیس

1. PostgreSQL را راه‌اندازی کنید
2. یک دیتابیس جدید ایجاد کنید:
```sql
CREATE DATABASE steedly;
```

3. فایل schema را اجرا کنید:
```bash
psql -U postgres -d steedly -f backend/src/database/schema.sql
```

### 3. پیکربندی متغیرهای محیطی

#### بک‌اند
فایل `.env.example` را در پوشه `backend` کپی کرده و به `.env` تغییر نام دهید:

```bash
cd backend
cp .env.example .env
```

سپس مقادیر را تنظیم کنید:
- `DB_HOST`: آدرس دیتابیس (پیش‌فرض: localhost)
- `DB_NAME`: نام دیتابیس (پیش‌فرض: steedly)
- `DB_USER`: نام کاربری PostgreSQL
- `DB_PASSWORD`: رمز عبور PostgreSQL
- `JWT_SECRET`: یک رشته تصادفی برای JWT
- `REDIS_HOST`: آدرس Redis (پیش‌فرض: localhost)

#### فرانت‌اند
فایل `.env.example` را در پوشه `frontend` کپی کرده و به `.env.local` تغییر نام دهید:

```bash
cd frontend
cp .env.example .env.local
```

مقدار `NEXT_PUBLIC_API_URL` را تنظیم کنید (پیش‌فرض: http://localhost:3000/api)

### 4. راه‌اندازی Redis

```bash
# در سیستم‌عامل لینوکس/Mac
redis-server

# یا در Windows با استفاده از WSL
```

### 5. اجرای پروژه

#### حالت توسعه (Development)

از ریشه پروژه:
```bash
npm run dev
```

این دستور هم بک‌اند و هم فرانت‌اند را به صورت همزمان اجرا می‌کند.

یا به صورت جداگانه:

```bash
# ترمینال 1 - بک‌اند
cd backend
npm run dev

# ترمینال 2 - فرانت‌اند
cd frontend
npm run dev
```

#### حالت تولید (Production)

```bash
# Build پروژه
npm run build

# اجرای بک‌اند
cd backend
npm start

# اجرای فرانت‌اند
cd frontend
npm start
```

## دسترسی به برنامه

- **فرانت‌اند**: http://localhost:3001
- **بک‌اند API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## ساختار پروژه

```
steedly/
├── backend/              # بک‌اند Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # کنترلرهای API
│   │   ├── routes/       # روت‌های API
│   │   ├── middleware/   # میدلورها
│   │   ├── database/     # اتصال دیتابیس و Redis
│   │   └── index.ts      # نقطه ورود
│   └── package.json
├── frontend/            # فرانت‌اند Next.js + TypeScript (PWA)
│   ├── app/             # صفحات و layout
│   ├── components/      # کامپوننت‌های React
│   ├── lib/             # توابع کمکی و API
│   └── package.json
├── android/             # اپلیکیشن اندروید (Kotlin + Jetpack Compose)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/ir/steedly/app/
│   │   │   │   ├── data/      # مدل‌ها و API
│   │   │   │   ├── ui/        # صفحات و کامپوننت‌ها
│   │   │   │   └── MainActivity.kt
│   │   │   └── res/           # منابع
│   │   └── build.gradle.kts
│   └── build.gradle.kts
└── README.md
```

## API Endpoints

### احراز هویت
- `POST /api/auth/register` - ثبت‌نام
- `POST /api/auth/login` - ورود
- `GET /api/auth/profile` - دریافت پروفایل
- `PUT /api/auth/profile` - به‌روزرسانی پروفایل

### بلاگ
- `GET /api/blog/posts` - لیست مقالات
- `GET /api/blog/posts/:slug` - دریافت مقاله
- `GET /api/blog/posts/search?q=...` - جستجوی مقالات
- `GET /api/blog/categories` - دسته‌بندی‌ها

### خدمات
- `GET /api/services/veterinarians` - لیست دامپزشکان
- `GET /api/services/transporters` - لیست اسب‌کش‌ها
- `POST /api/services/bookings` - ایجاد رزرو
- `GET /api/services/bookings` - لیست رزروها

### فروشگاه
- `GET /api/shop/products` - لیست محصولات
- `GET /api/shop/products/:slug` - دریافت محصول
- `POST /api/shop/orders` - ایجاد سفارش
- `GET /api/shop/orders` - لیست سفارشات

### مسابقات
- `GET /api/competitions` - لیست مسابقات
- `GET /api/competitions/:slug` - دریافت مسابقه
- `GET /api/competitions/:id/results` - نتایج مسابقه

## نکات مهم

1. **امنیت**: در محیط production حتماً `JWT_SECRET` را به یک مقدار قوی و تصادفی تغییر دهید.

2. **فایل‌ها**: پوشه `uploads` برای آپلود فایل‌ها استفاده می‌شود. مطمئن شوید که این پوشه وجود دارد.

3. **PWA**: برای فعال‌سازی کامل PWA، باید آیکون‌های مناسب را در پوشه `frontend/public` قرار دهید.

4. **دیتابیس**: برای محیط production، از migration tools استفاده کنید و backup منظم داشته باشید.

## راه‌اندازی اپلیکیشن اندروید

برای جزئیات کامل، به [README-ANDROID.md](android/README-ANDROID.md) مراجعه کنید.

### مراحل سریع:

1. Android Studio را باز کنید
2. پروژه را از پوشه `android` باز کنید
3. در `RetrofitClient.kt` آدرس API را تنظیم کنید
4. اپلیکیشن را اجرا کنید

### ساخت فایل برای کافه‌بازار:

```bash
cd android
./gradlew bundleRelease
```

برای راهنمای کامل انتشار در کافه‌بازار، به [CAFEBAZAAR-GUIDE.md](CAFEBAZAAR-GUIDE.md) مراجعه کنید.

## توسعه بیشتر

- برای افزودن ماژول جدید، الگوی موجود را دنبال کنید
- از TypeScript برای type safety استفاده کنید
- تست‌های واحد و یکپارچگی را اضافه کنید
- از ESLint و Prettier برای فرمت کد استفاده کنید

## مستندات بیشتر

- [README-SETUP.md](README-SETUP.md) - راهنمای راه‌اندازی
- [README-ANDROID.md](android/README-ANDROID.md) - راهنمای اندروید
- [CAFEBAZAAR-GUIDE.md](CAFEBAZAAR-GUIDE.md) - راهنمای انتشار در کافه‌بازار
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - ساختار پروژه

## پشتیبانی

در صورت بروز مشکل، لطفاً issue در repository ایجاد کنید.

