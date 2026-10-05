# Docker Guide

## Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose

## Quick start (three commands)

```bash
cp .env.example .env              # once; change values if needed
docker compose up -d --build      # build and run all services
docker compose run --rm seed      # once: admin user and sample content
```

Then:

| Service | Address |
|--------|------|
| Website | http://localhost:3001 |
| API | http://localhost:3000/api |
| API health | http://localhost:3000/health |

Admin login (after seed): `admin@steedly.ir` / `admin123` — **be sure to change the password.**

These commands also run PostgreSQL (port 5432) and Redis (port 6379), and the tables are created automatically
from `backend/src/database/schema.sql` on first run. Running `seed` again does not create duplicates.

### Connecting the Android app (test version)

1. Find your computer's IP (Windows: `ipconfig`, Mac: `ipconfig getifaddr en0`).
2. In the app: login screen ← ⚙️ ← "Server address" ← e.g. `192.168.1.10:3000` ← "Test connection" ← "Save".
3. For test payments from the phone, set `API_URL` in `.env` to the same IP
   (`http://192.168.1.10:3000/api`) and run `docker compose up -d` again.

### 2. Viewing logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### 3. Stopping containers

```bash
docker compose down
```

### 4. Stopping and removing volumes

```bash
docker compose down -v
```

## Building images

### Building the Backend image

```bash
docker build -t steedly-backend:latest --target backend-prod .
```

### Building the Frontend image

```bash
docker build -t steedly-frontend:latest --target frontend-prod .
```

## Environment variables

Create the `.env` file in the project root:

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

## Database access

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U steedly -d steedly

# Connect to Redis CLI
docker compose exec redis redis-cli
```

## Running migrations

```bash
# Run schema
docker compose exec backend npm run migrate

# Run seed
docker compose exec backend npm run seed
```

## Troubleshooting

### Database connection problem

```bash
# Check containers status
docker compose ps

# Check PostgreSQL logs
docker compose logs postgres
```

### Build problem

```bash
# Clear cache and rebuild
docker compose build --no-cache
```

### Port problem

If the ports are in use, you can change them in `docker-compose.yml`:

```yaml
ports:
  - "3002:3000"  # instead of 3000:3000
```

## Production Deployment

For production:

1. Set the environment variables
2. Set `ENABLE_SWAGGER=false`
3. Use a reverse proxy (nginx)
4. Enable SSL/TLS

```bash
# Build for production
docker compose -f docker-compose.prod.yml up -d
```

