# Quick Start Guide

## Quick steps

### 1. Creating environment files

#### Backend (.env)
In the `backend` folder create the `.env` file with the following content:

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
In the `frontend` folder create the `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Setting up the database

1. Start PostgreSQL
2. Create a database:
```sql
CREATE DATABASE steedly;
```

3. Run the Schema:
```bash
psql -U postgres -d steedly -f backend/src/database/schema.sql
```

### 3. Setting up Redis (optional)

```bash
# Windows (with WSL)
wsl redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. Running the application

```bash
npm run dev
```

This command runs both the Backend (port 3000) and the Frontend (port 3001).

## Access

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **API Docs (Swagger)**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Important Notes

- If PostgreSQL or Redis are not running, the application will give an error
- For the first time, you can run the seed data:
  ```bash
  cd backend
  npm run seed
  ```

