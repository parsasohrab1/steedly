# Steedly API Documentation

## Accessing the documentation

In the development environment the API documentation is available at the following address:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSON**: `http://localhost:3000/api-docs.json`

## Authentication

Most endpoints require authentication. For authentication:

1. First get a token using `/auth/login` or `/auth/register`
2. In the header of subsequent requests, send the token as follows:
   ```
   Authorization: Bearer <your-token>
   ```

## Main endpoints

### Authentication (`/api/auth`)

#### POST `/auth/register`
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User name",
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
    "full_name": "User name"
  }
}
```

#### POST `/auth/login`
User login

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
      "full_name": "User name"
    }
  }
}
```

#### GET `/auth/profile`
Get the user profile (requires authentication)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User name",
    "phone": "09123456789",
    "role": "user"
  }
}
```

#### PUT `/auth/profile`
Update the user profile (requires authentication)

**Request Body:**
```json
{
  "full_name": "New name",
  "phone": "09123456789",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

### Blog (`/api/blog`)

#### GET `/blog/posts`
Get the list of articles

**Query Parameters:**
- `page` (optional): page number (default: 1)
- `limit` (optional): items per page (default: 10)
- `category_id` (optional): filter by category

#### GET `/blog/posts/:slug`
Get an article by slug

#### GET `/blog/posts/search?q=query`
Search in articles

#### GET `/blog/categories`
Get the list of categories

### Services (`/api/services`)

#### GET `/services/veterinarians`
Get the list of veterinarians

**Query Parameters:**
- `region` (optional): filter by region
- `specialization` (optional): filter by specialization
- `latitude` (optional): latitude
- `longitude` (optional): longitude
- `radius` (optional): search radius in kilometers (default: 50)

#### GET `/services/transporters`
Get the list of horse transporters

**Query Parameters:**
- `region` (optional): filter by region
- `latitude` (optional): latitude
- `longitude` (optional): longitude
- `radius` (optional): search radius in kilometers (default: 50)

#### POST `/services/bookings`
Create a booking (requires authentication)

**Request Body:**
```json
{
  "service_type": "veterinarian",
  "service_provider_id": 1,
  "booking_date": "2024-01-15T10:00:00Z",
  "description": "Horse examination"
}
```

### Shop (`/api/shop`)

#### GET `/shop/products`
Get the list of products

**Query Parameters:**
- `page` (optional): page number
- `limit` (optional): items per page
- `category_id` (optional): filter by category
- `search` (optional): search in name and description

#### GET `/shop/products/:slug`
Get a product by slug

#### POST `/shop/orders`
Create an order (requires authentication)

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": "Shipping address",
  "payment_method": "online"
}
```

### Competitions (`/api/competitions`)

#### GET `/competitions`
Get the list of competitions

**Query Parameters:**
- `type` (optional): competition type
- `is_international` (optional): international competitions
- `start_date` (optional): start date
- `end_date` (optional): end date

#### GET `/competitions/:slug`
Get a competition by slug

### Notifications (`/api/notifications`)

#### GET `/notifications`
Get the user's notifications (requires authentication)

**Query Parameters:**
- `limit` (optional): number of notifications (default: 20)

#### GET `/notifications/unread-count`
Get the number of unread notifications (requires authentication)

#### PUT `/notifications/:id/read`
Mark a notification as read (requires authentication)

#### PUT `/notifications/read-all`
Mark all notifications as read (requires authentication)

#### DELETE `/notifications/:id`
Delete a notification (requires authentication)

### Search (`/api/search`)

#### GET `/search`
Global search across articles, products and competitions

**Query Parameters:**
- `q` (required): search term
- `type` (optional): filter by type ('blog', 'product', 'competition', 'all')
- `category` (optional): filter by category
- `sort` (optional): sorting ('relevance', 'date', 'price')
- `page` (optional): page number
- `limit` (optional): items per page

## Error codes

- `200`: Success
- `201`: Created
- `400`: Validation error
- `401`: Authentication required
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

## Usage example

### With curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get profile (with token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### With JavaScript/TypeScript

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

Rate limiting is not currently implemented. For production it is recommended to use middleware such as `express-rate-limit`.

## API versioning

The API is currently at version 1.0.0. For future breaking changes, API versioning will be implemented.

