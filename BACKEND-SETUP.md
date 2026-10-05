# Backend Setup Guide

## Prerequisites

1. **PostgreSQL** - must be installed and running
2. **Redis** - must be installed and running
3. **Node.js** - version 18 or higher

## Setup steps

### 1. Create the `.env` file

Copy the `.env.example` file:

```bash
cd backend
copy .env.example .env
```

Or create the `backend/.env` file manually:

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

### 2. Create the database

In PostgreSQL:

```sql
CREATE DATABASE steedly;
```

Or from psql:

```bash
psql -U postgres -c "CREATE DATABASE steedly;"
```

### 3. Run the schema

```bash
cd backend
psql -U postgres -d steedly -f src/database/schema.sql
```

Or from Node.js:

```bash
npm run seed
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

Or from the root directory:

```bash
npm run dev:backend
```

## Verification

### Health Check

```bash
curl http://localhost:3000/health
```

Or in the browser:
http://localhost:3000/health

### API Documentation

If Swagger is enabled:
http://localhost:3000/api-docs

## Common Problems

### Database Connection Error

**Cause**: PostgreSQL is not running or the settings are wrong

**Solution**:
1. Make sure PostgreSQL is running
2. Check the `.env` settings
3. Create the database

### Redis Connection Error

**Cause**: Redis is not running

**Solution**:
1. Start Redis
2. Or set `REDIS_URL` in `.env`

### Port Already in Use

**Cause**: Port 3000 is in use

**Solution**:
1. Stop the process:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or change the port in `.env`

## Notes

- Put the `.env` file in `.gitignore`
- In production, use a strong JWT_SECRET
- Protect the Database password

