# راهنمای راه‌اندازی نقشه نشان (Neshan Maps)

## معرفی

نشان (Neshan) یک سرویس نقشه ایرانی است که جایگزین مناسبی برای Google Maps در ایران است.

## دریافت API Key

1. به [پنل توسعه‌دهندگان نشان](https://platform.neshan.org/panel/api-key) بروید
2. ثبت‌نام یا ورود کنید
3. پروژه جدید ایجاد کنید
4. API Key دریافت کنید

## تنظیمات Frontend (PWA)

### 1. اضافه کردن API Key

در فایل `.env.local`:
```
NEXT_PUBLIC_NESHAN_API_KEY=your_neshan_api_key_here
```

### 2. استفاده از MapComponent

کامپوننت `MapComponent` از Neshan Maps با Leaflet استفاده می‌کند:

```tsx
<MapComponent
  userLocation={{ lat: 35.6892, lng: 51.3890 }}
  providers={providers}
  serviceType="veterinarian"
  onProviderSelect={handleSelect}
/>
```

### 3. ویژگی‌ها

- ✅ نمایش موقعیت کاربر
- ✅ نمایش markers برای دامپزشکان و اسب‌کش‌ها
- ✅ Popup با اطلاعات
- ✅ کلیک روی marker برای انتخاب
- ✅ Zoom و Pan
- ✅ RTL Support
- ✅ استفاده از Leaflet (رایگان و بدون نیاز به API Key برای tile layer)

## تنظیمات Android

### 1. Repository

در `settings.gradle.kts`:
```kotlin
repositories {
    maven { url = uri("https://repo.neshan.org/artifactory/public-maven") }
}
```

### 2. Dependency

در `android/settings.gradle.kts` مخزن نشان و در `app/build.gradle.kts` کتابخانه‌ها:
```kotlin
maven { url = uri("https://maven.neshan.org/artifactory/public-maven") }

implementation("neshan-android-sdk:mobile-sdk:1.0.3")
implementation("neshan-android-sdk:common-sdk:0.0.3")
```

### 3. ثبت اپ در پنل نشان

SDK نسخه ۱ کلید API در کد ندارد؛ نام بسته `ir.steedly.app` و اثرانگشت SHA-1 امضای اپ
(debug و release — راهنما در `android/GET-FINGERPRINT.md`) را در [پنل توسعه‌دهندگان نشان](https://platform.neshan.org) ثبت کنید.

### 4. استفاده در اپ

پیاده‌سازی در `ui/screens/services/MapScreenNeshan.kt` است: موقعیت کاربر (بدون نیاز به Google Play Services)،
نمایش دامپزشک‌ها/اسب‌کش‌ها با `Marker` و انتخاب شعاع جستجو.

## مزایای استفاده از نشان

1. ✅ **سرویس ایرانی**: بدون نیاز به VPN
2. ✅ **سرعت بالا**: سرورهای داخل ایران
3. ✅ **پشتیبانی فارسی**: کامل
4. ✅ **رایگان**: برای استفاده‌های معمولی
5. ✅ **دقت بالا**: نقشه‌های به‌روز ایران

## مستندات

- [مستندات JavaScript SDK](https://developer.neshan.org/api/web/)
- [مستندات Android SDK](https://developer.neshan.org/api/android/)
- [نمونه کدها](https://developer.neshan.org/samples/)
- [پنل توسعه‌دهندگان](https://platform.neshan.org/)

## نکات مهم

1. **API Key**: حتماً API Key را در فایل‌های `.env.local` و `strings.xml` قرار دهید
2. **HTTPS**: برای استفاده در production، از HTTPS استفاده کنید
3. **محدودیت‌ها**: بررسی کنید که API Key شما محدودیت نداشته باشد
4. **بهینه‌سازی**: برای کاهش هزینه‌ها، از caching استفاده کنید

## مقایسه با Google Maps

| ویژگی | نشان | Google Maps |
|-------|------|-------------|
| دسترسی در ایران | ✅ بدون VPN | ❌ نیاز به VPN |
| سرعت | ✅ بالا | ⚠️ متوسط |
| پشتیبانی فارسی | ✅ کامل | ⚠️ محدود |
| هزینه | ✅ رایگان (محدود) | ⚠️ پولی |
| دقت نقشه ایران | ✅ عالی | ✅ خوب |

## مشکلات رایج

### نقشه نمایش داده نمی‌شود
- بررسی کنید API Key درست باشد
- بررسی کنید script Leaflet لود شده باشد
- Console مرورگر را بررسی کنید
- بررسی کنید که URL tile layer درست باشد

### موقعیت نمایش داده نمی‌شود
- بررسی کنید permission داده شده باشد
- در HTTPS یا localhost تست کنید

### در Android کار نمی‌کند
- بررسی کنید repository اضافه شده باشد
- بررسی کنید dependency درست اضافه شده باشد
- بررسی کنید API Key در strings.xml قرار گرفته باشد

## پشتیبانی

- [پشتیبانی نشان](https://developer.neshan.org/support/)
- [مستندات کامل](https://developer.neshan.org/docs/)
- [گیت‌هاب](https://github.com/NeshanMaps)
