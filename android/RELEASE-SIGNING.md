# امضای نسخه نهایی اندروید (Release Signing)

کلید امضای نسخه نهایی استیدلی **هرگز در مخزن قرار نمی‌گیرد**. فایل‌های `*.jks` و `keystore.properties`
در `android/.gitignore` مستثنا شده‌اند.

> ⚠️ **این کلید را گم نکنید.** اگر کلید از دست برود، دیگر نمی‌توانید برای همین اپ در کافه‌بازار و مایکت
> به‌روزرسانی منتشر کنید و باید اپ جدیدی با نام بسته دیگری ثبت کنید. فایل کلید و رمز را دست‌کم در
> **دو جای امن جدا** نگه دارید (مثلاً مدیر رمز عبور + فلش/هارد رمزگذاری‌شده).

## مشخصات کلید

| مورد | مقدار |
|------|--------|
| فایل | `steedly-release.jks` (PKCS12) |
| Alias | `steedly` |
| الگوریتم | RSA 4096 بیت، SHA384withRSA |
| اعتبار | تا سپتامبر ۲۰۵۶ |
| SHA-1 | `FE:6E:2F:F0:32:7D:AE:0C:A9:70:2D:C4:1B:92:17:E6:C4:08:A3:1D` |
| SHA-256 | `5E:55:3F:EA:0D:1D:33:84:91:4C:4A:07:07:6E:1B:50:2A:49:1A:9E:CD:96:3E:82:73:29:28:25:4F:27:A0:8B` |

اثرانگشت SHA-1 را همراه نام بسته `ir.steedly.app` در **پنل نشان** (برای نمایش نقشه) و در صورت نیاز
در **کافه‌بازار** ثبت کنید. اثرانگشت‌ها عمومی هستند؛ رمز و فایل کلید محرمانه‌اند.

## ساخت نسخه امضاشده روی کامپیوتر

1. فایل‌های `steedly-release.jks` و `keystore.properties` را در پوشه `android/` بگذارید.
2. اجرا کنید:

```bash
cd android
./gradlew assembleRelease
```

خروجی: `android/app/build/outputs/apk/release/app-release.apk`

محتوای `keystore.properties`:

```properties
storeFile=steedly-release.jks
storePassword=...
keyAlias=steedly
keyPassword=...
```

## ساخت خودکار در GitHub Actions

در GitHub به **Settings ← Secrets and variables ← Actions ← New repository secret** بروید و این چهار
مقدار را اضافه کنید:

| نام Secret | مقدار |
|-------------|--------|
| `ANDROID_KEYSTORE_BASE64` | محتوای فایل `keystore.base64.txt` (نسخه base64 فایل کلید) |
| `ANDROID_KEYSTORE_PASSWORD` | `storePassword` |
| `ANDROID_KEY_ALIAS` | `steedly` |
| `ANDROID_KEY_PASSWORD` | `keyPassword` |

ساخت base64 از فایل کلید (اگر فایل آماده را ندارید):

```bash
base64 -w0 steedly-release.jks > keystore.base64.txt      # لینوکس
base64 -i steedly-release.jks -o keystore.base64.txt       # مک
```

بعد از تنظیم secretها، هر اجرای CI فایل `steedly-release-apk` (APK امضاشده) را در بخش Artifacts می‌سازد.
بدون secretها، CI یک APK **امضانشده** می‌سازد که فقط برای بررسی درستی تنظیمات release است و قابل نصب نیست.

## ساخت کلید جدید (فقط اگر هنوز اپ منتشر نشده)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore steedly-release.jks -alias steedly \
  -keyalg RSA -keysize 4096 -validity 10950 \
  -dname "CN=Steedly, OU=Mobile, O=Steedly, L=Tehran, ST=Tehran, C=IR"
```
