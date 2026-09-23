# مستندات API استیدلی

## دسترسی به مستندات

مستندات API در محیط development در آدرس زیر در دسترس است:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON**: `http://localhost:3000/api-docs.json`

## احراز هویت

اکثر endpointها نیاز به احراز هویت دارند. برای احراز هویت:

1. ابتدا با استفاده از `/auth/login` یا `/auth/register` یک token دریافت کنید
2. در header درخواست‌های بعدی، token را به صورت زیر ارسال کنید:
   ```
   Authorization: Bearer <your-token>
   ```

## Endpoints اصلی

### Authentication (`/api/auth`)

#### POST `/auth/register`
ثبت‌نام کاربر جدید

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "نام کاربر",
  "phone": "09123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "نام کاربر"
  }
}
```

#### POST `/auth/login`
ورود کاربر

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "نام کاربر"
    }
  }
}
```

#### GET `/auth/profile`
دریافت پروفایل کاربر (نیاز به احراز هویت)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "نام کاربر",
    "phone": "09123456789",
    "role": "user"
  }
}
```

#### PUT `/auth/profile`
به‌روزرسانی پروفایل کاربر (نیاز به احراز هویت)

**Request Body:**
```json
{
  "full_name": "نام جدید",
  "phone": "09123456789",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Blog (`/api/blog`)

#### GET `/blog/posts`
دریافت لیست مقالات

**Query Parameters:**
- `page` (optional): شماره صفحه (default: 1)
- `limit` (optional): تعداد در هر صفحه (default: 10)
- `category_id` (optional): فیلتر بر اساس دسته‌بندی

#### GET `/blog/posts/:slug`
دریافت یک مقاله با slug

#### GET `/blog/posts/search?q=query`
جستجو در مقالات

#### GET `/blog/categories`
دریافت لیست دسته‌بندی‌ها

### Services (`/api/services`)

#### GET `/services/veterinarians`
دریافت لیست دامپزشکان

**Query Parameters:**
- `region` (optional): فیلتر بر اساس منطقه
- `specialization` (optional): فیلتر بر اساس تخصص
- `latitude` (optional): عرض جغرافیایی
- `longitude` (optional): طول جغرافیایی
- `radius` (optional): شعاع جستجو به کیلومتر (default: 50)

#### GET `/services/transporters`
دریافت لیست اسب‌کش‌ها

**Query Parameters:**
- `region` (optional): فیلتر بر اساس منطقه
- `latitude` (optional): عرض جغرافیایی
- `longitude` (optional): طول جغرافیایی
- `radius` (optional): شعاع جستجو به کیلومتر (default: 50)

#### POST `/services/bookings`
ایجاد رزرو (نیاز به احراز هویت)

**Request Body:**
```json
{
  "service_type": "veterinarian",
  "service_provider_id": 1,
  "booking_date": "2024-01-15T10:00:00Z",
  "description": "معاینه اسب"
}
```

### Shop (`/api/shop`)

#### GET `/shop/products`
دریافت لیست محصولات

**Query Parameters:**
- `page` (optional): شماره صفحه
- `limit` (optional): تعداد در هر صفحه
- `category_id` (optional): فیلتر بر اساس دسته‌بندی
- `search` (optional): جستجو در نام و توضیحات

#### GET `/shop/products/:slug`
دریافت یک محصول با slug

#### POST `/shop/orders`
ایجاد سفارش (نیاز به احراز هویت)

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": "آدرس ارسال",
  "payment_method": "online"
}
```

### Competitions (`/api/competitions`)

#### GET `/competitions`
دریافت لیست مسابقات

**Query Parameters:**
- `type` (optional): نوع مسابقه
- `is_international` (optional): مسابقات بین‌المللی
- `start_date` (optional): تاریخ شروع
- `end_date` (optional): تاریخ پایان

#### GET `/competitions/:slug`
دریافت یک مسابقه با slug

### Notifications (`/api/notifications`)

#### GET `/notifications`
دریافت اعلان‌های کاربر (نیاز به احراز هویت)

**Query Parameters:**
- `limit` (optional): تعداد اعلان‌ها (default: 20)

#### GET `/notifications/unread-count`
دریافت تعداد اعلان‌های خوانده نشده (نیاز به احراز هویت)

#### PUT `/notifications/:id/read`
علامت‌گذاری اعلان به عنوان خوانده شده (نیاز به احراز هویت)

#### PUT `/notifications/read-all`
علامت‌گذاری همه اعلان‌ها به عنوان خوانده شده (نیاز به احراز هویت)

#### DELETE `/notifications/:id`
حذف اعلان (نیاز به احراز هویت)

### Search (`/api/search`)

#### GET `/search`
جستجوی سراسری در مقالات، محصولات و مسابقات

**Query Parameters:**
- `q` (required): عبارت جستجو
- `type` (optional): فیلتر بر اساس نوع ('blog', 'product', 'competition', 'all')
- `category` (optional): فیلتر بر اساس دسته‌بندی
- `sort` (optional): مرتب‌سازی ('relevance', 'date', 'price')
- `page` (optional): شماره صفحه
- `limit` (optional): تعداد در هر صفحه

## کدهای خطا

- `200`: موفق
- `201`: ایجاد شده
- `400`: خطای اعتبارسنجی
- `401`: نیاز به احراز هویت
- `403`: دسترسی غیرمجاز
- `404`: یافت نشد
- `500`: خطای سرور

## مثال استفاده

### با curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get profile (with token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### با JavaScript/TypeScript

```typescript
import api from '@/lib/api';

// Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = response.data.data.token;
localStorage.setItem('token', token);

// Get profile
const profile = await api.get('/auth/profile');
```

## Rate Limiting

در حال حاضر rate limiting پیاده‌سازی نشده است. برای production توصیه می‌شود از middleware مانند `express-rate-limit` استفاده شود.

## نسخه‌بندی API

API فعلاً در نسخه 1.0.0 است. برای تغییرات breaking در آینده، نسخه‌بندی API پیاده‌سازی خواهد شد.

