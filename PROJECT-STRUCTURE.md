# ساختار پروژه استیدلی

## نمای کلی

این پروژه یک پلتفرم جامع برای اطلاعات، خدمات و فروشگاه آنلاین اسب است که شامل:

1. **بک‌اند**: Node.js + Express + TypeScript + PostgreSQL + Redis
2. **فرانت‌اند**: Next.js 14 + TypeScript + Tailwind CSS (PWA)

## ساختار فولدرها

```
steedly/
├── backend/                    # بک‌اند API
│   ├── src/
│   │   ├── controllers/        # کنترلرهای API
│   │   │   ├── authController.ts
│   │   │   ├── blogController.ts
│   │   │   ├── serviceController.ts
│   │   │   ├── shopController.ts
│   │   │   └── competitionController.ts
│   │   ├── routes/             # روت‌های API
│   │   │   ├── auth.ts
│   │   │   ├── blog.ts
│   │   │   ├── services.ts
│   │   │   ├── shop.ts
│   │   │   └── competitions.ts
│   │   ├── middleware/         # میدلورها
│   │   │   ├── auth.ts         # احراز هویت JWT
│   │   │   ├── errorHandler.ts # مدیریت خطا
│   │   │   └── validation.ts   # اعتبارسنجی
│   │   ├── database/           # دیتابیس
│   │   │   ├── connection.ts   # اتصال PostgreSQL
│   │   │   ├── redis.ts        # اتصال Redis
│   │   │   ├── schema.sql      # ساختار دیتابیس
│   │   │   └── seed.ts         # داده‌های اولیه
│   │   └── index.ts            # نقطه ورود
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # فرانت‌اند PWA
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Layout اصلی
│   │   ├── page.tsx            # صفحه اصلی
│   │   ├── blog/               # صفحات بلاگ
│   │   ├── shop/               # صفحات فروشگاه
│   │   ├── services/           # صفحات خدمات
│   │   └── competitions/       # صفحات مسابقات
│   ├── components/             # کامپوننت‌های React
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── lib/                    # توابع کمکی
│   │   └── api.ts              # توابع API
│   ├── public/                 # فایل‌های استاتیک
│   │   ├── manifest.json       # PWA Manifest
│   │   └── sw.js               # Service Worker
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── package.json                # Root package.json
├── README.md                   # مستندات اصلی
├── README-SETUP.md            # راهنمای راه‌اندازی
└── .gitignore
```

## ماژول‌های اصلی

### 1. ماژول احراز هویت
- ثبت‌نام کاربر
- ورود و خروج
- مدیریت پروفایل
- JWT Authentication

### 2. ماژول بلاگ
- نمایش مقالات
- جستجوی مقالات
- دسته‌بندی مقالات
- مدیریت مقالات (برای ادمین/نویسنده)

### 3. ماژول خدمات
- ثبت دامپزشک
- ثبت اسب‌کش
- رزرو خدمات
- سیستم امتیازدهی و نظرات

### 4. ماژول فروشگاه
- نمایش محصولات
- دسته‌بندی محصولات
- سبد خرید
- مدیریت سفارشات

### 5. ماژول مسابقات
- نمایش مسابقات
- فیلتر بر اساس نوع
- نتایج مسابقات
- تقویم مسابقات

## تکنولوژی‌های استفاده شده

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Relational database
- **Redis**: Caching
- **JWT**: Authentication
- **bcryptjs**: Password hashing

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Icons**: Icon library
- **Axios**: HTTP client
- **PWA**: Progressive Web App support

## ویژگی‌های PWA

- Service Worker برای آفلاین
- Web App Manifest
- قابلیت نصب روی دستگاه
- Push Notifications (آماده برای پیاده‌سازی)

## امنیت

- JWT برای احراز هویت
- Hash کردن رمز عبور با bcrypt
- Helmet برای امنیت HTTP headers
- CORS configuration
- Input validation

## عملکرد

- Redis caching برای بهبود سرعت
- Database indexing
- Image optimization
- Code splitting در Next.js
- Lazy loading

## توسعه آینده

- [ ] تست‌های واحد و یکپارچگی
- [ ] اپلیکیشن اندروید (Kotlin + Jetpack Compose)
- [ ] Push Notifications
- [ ] سیستم پرداخت آنلاین
- [ ] پنل مدیریت
- [ ] سیستم اعلان‌ها
- [ ] چت و پشتیبانی آنلاین

