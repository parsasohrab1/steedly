# راهنمای راه‌اندازی Backend

## پیش‌نیازها

1. **PostgreSQL** - باید نصب و در حال اجرا باشد
2. **Redis** - باید نصب و در حال اجرا باشد
3. **Node.js** - نسخه 18 یا بالاتر

## مراحل راه‌اندازی

### 1. ایجاد فایل `.env`

فایل `.env.example` را کپی کنید:

```bash
cd backend
copy .env.example .env
```

یا به صورت دستی فایل `backend/.env` را ایجاد کنید:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=steedly
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
API_URL=http://localhost:3000/api

# Email Configuration (Optional - for email notifications)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Push Notifications Configuration (Optional)
PUSH_NOTIFICATIONS_ENABLED=false
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:support@steedly.ir
```

### 2. ایجاد Database

در PostgreSQL:

```sql
CREATE DATABASE steedly;
```

یا از psql:

```bash
psql -U postgres -c "CREATE DATABASE steedly;"
```

### 3. اجرای Schema

```bash
cd backend
psql -U postgres -d steedly -f src/database/schema.sql
```

یا از Node.js:

```bash
npm run seed
```

### 4. راه‌اندازی Backend

```bash
cd backend
npm run dev
```

یا از root directory:

```bash
npm run dev:backend
```

## بررسی

### Health Check

```bash
curl http://localhost:3000/health
```

یا در مرورگر:
http://localhost:3000/health

### API Documentation

اگر Swagger فعال باشد:
http://localhost:3000/api-docs

## مشکلات رایج

### Database Connection Error

**علت**: PostgreSQL در حال اجرا نیست یا تنظیمات اشتباه

**راه حل**:
1. مطمئن شوید PostgreSQL در حال اجرا است
2. تنظیمات `.env` را بررسی کنید
3. Database را ایجاد کنید

### Redis Connection Error

**علت**: Redis در حال اجرا نیست

**راه حل**:
1. Redis را راه‌اندازی کنید
2. یا `REDIS_URL` را در `.env` تنظیم کنید

### Port Already in Use

**علت**: پورت 3000 در حال استفاده است

**راه حل**:
1. Process را متوقف کنید:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. یا پورت را در `.env` تغییر دهید

## نکات

- فایل `.env` را در `.gitignore` قرار دهید
- در production، از JWT_SECRET قوی استفاده کنید
- Database password را محافظت کنید

