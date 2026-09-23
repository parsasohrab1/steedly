# راهنمای سریع اجرای اپلیکیشن

## مراحل سریع

### 1. ایجاد فایل‌های محیطی

#### Backend (.env)
در پوشه `backend` فایل `.env` را ایجاد کنید با محتوای زیر:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=steedly
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:3000/api
```

#### Frontend (.env.local)
در پوشه `frontend` فایل `.env.local` را ایجاد کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. راه‌اندازی دیتابیس

1. PostgreSQL را راه‌اندازی کنید
2. دیتابیس ایجاد کنید:
```sql
CREATE DATABASE steedly;
```

3. Schema را اجرا کنید:
```bash
psql -U postgres -d steedly -f backend/src/database/schema.sql
```

### 3. راه‌اندازی Redis (اختیاری)

```bash
# Windows (با WSL)
wsl redis-server

# یا استفاده از Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. اجرای اپلیکیشن

```bash
npm run dev
```

این دستور هم Backend (پورت 3000) و هم Frontend (پورت 3001) را اجرا می‌کند.

## دسترسی

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **API Docs (Swagger)**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## نکات مهم

- اگر PostgreSQL یا Redis در حال اجرا نیستند، اپلیکیشن خطا می‌دهد
- برای اولین بار، می‌توانید seed data را اجرا کنید:
  ```bash
  cd backend
  npm run seed
  ```

