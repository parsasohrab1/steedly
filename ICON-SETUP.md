# آیکون‌ها و لوگو (Icons & Logo)

منبع همه آیکون‌ها و لوگوها پوشه [`brand/`](brand/) است. راهنمای هویت بصری و رنگ‌های سازمانی در
[`brand/BRAND.md`](brand/BRAND.md) آمده است.

| فایل | کاربرد |
|------|--------|
| `frontend/public/logo-mark.svg` | نشان اصلی (favicon برداری، PWA) |
| `frontend/public/logo-horizontal.svg` | لوگوی افقی با نام فارسی و لاتین |
| `frontend/public/icon-192x192.png`, `icon-512x512.png` | آیکون‌های PWA |
| `frontend/public/apple-touch-icon.png` | آیکون iOS |
| `frontend/public/favicon.ico` | favicon مرورگر |
| `android/app/src/main/res/drawable/ic_launcher_*.xml` | آیکون تطبیقی اندروید (برداری) |

## بازتولید آیکون‌های PNG

```bash
bash brand/export-icons.sh
```

این اسکریپت با Chromium نسخه PNG را از `brand/logo-mark.svg` می‌سازد و با Pillow اندازه‌های لازم را تولید می‌کند.
