# راهنمای سریع رفع مشکل

## مشکل: npm error ENOENT

### علت
شما در مسیر اشتباه هستید. `package.json` در پوشه `steedly` قرار دارد.

### راه حل

#### 1. به مسیر صحیح بروید:
```bash
cd steedly
```

#### 2. سپس دستور را اجرا کنید:
```bash
npm run dev:backend
```

یا برای اجرای همزمان Backend و Frontend:
```bash
npm run dev
```

## مسیرهای صحیح

- **پروژه اصلی**: `C:\Users\asus\Documents\steedly\steedly`
- **Backend**: `C:\Users\asus\Documents\steedly\steedly\backend`
- **Frontend**: `C:\Users\asus\Documents\steedly\steedly\frontend`

## دستورات مفید

### بررسی مسیر فعلی
```bash
pwd
# یا در PowerShell:
Get-Location
```

### رفتن به مسیر پروژه
```bash
cd C:\Users\asus\Documents\steedly\steedly
```

### اجرای Backend
```bash
npm run dev:backend
```

### اجرای Frontend
```bash
npm run dev:frontend
```

### اجرای هر دو
```bash
npm run dev
```

