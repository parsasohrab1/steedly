# راهنمای Docker

## پیش‌نیازها

- Docker Desktop یا Docker Engine
- Docker Compose

## اجرای سریع

### 1. ساخت و اجرای Containerها

```bash
docker-compose up -d
```

این دستور:
- PostgreSQL را در پورت 5432 راه‌اندازی می‌کند
- Redis را در پورت 6379 راه‌اندازی می‌کند
- Backend را در پورت 3000 راه‌اندازی می‌کند
- Frontend را در پورت 3001 راه‌اندازی می‌کند

### 2. مشاهده لاگ‌ها

```bash
# همه سرویس‌ها
docker-compose logs -f

# فقط backend
docker-compose logs -f backend

# فقط frontend
docker-compose logs -f frontend
```

### 3. توقف Containerها

```bash
docker-compose down
```

### 4. توقف و حذف Volumeها

```bash
docker-compose down -v
```

## ساخت Imageها

### ساخت Backend Image

```bash
docker build -t steedly-backend:latest --target backend-prod .
```

### ساخت Frontend Image

```bash
docker build -t steedly-frontend:latest --target frontend-prod .
```

## متغیرهای محیطی

فایل `.env` را در root پروژه ایجاد کنید:

```env
# Database
POSTGRES_USER=steedly
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=steedly

# JWT
JWT_SECRET=your-secret-key-change-in-production

# API
API_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:3001
```

## دسترسی به Database

```bash
# اتصال به PostgreSQL
docker-compose exec postgres psql -U steedly -d steedly

# اتصال به Redis CLI
docker-compose exec redis redis-cli
```

## اجرای Migrationها

```bash
# اجرای schema
docker-compose exec backend npm run migrate

# اجرای seed
docker-compose exec backend npm run seed
```

## Troubleshooting

### مشکل در اتصال به Database

```bash
# بررسی وضعیت containerها
docker-compose ps

# بررسی لاگ‌های PostgreSQL
docker-compose logs postgres
```

### مشکل در Build

```bash
# پاک کردن cache و rebuild
docker-compose build --no-cache
```

### مشکل در Port

اگر پورت‌ها در حال استفاده هستند، می‌توانید در `docker-compose.yml` تغییر دهید:

```yaml
ports:
  - "3002:3000"  # به جای 3000:3000
```

## Production Deployment

برای production:

1. متغیرهای محیطی را تنظیم کنید
2. `ENABLE_SWAGGER=false` را تنظیم کنید
3. از reverse proxy (nginx) استفاده کنید
4. SSL/TLS را فعال کنید

```bash
# Build برای production
docker-compose -f docker-compose.prod.yml up -d
```

