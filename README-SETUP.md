# Steedly Project Setup Guide

## Prerequisites

### For Backend and Frontend (PWA)
- Node.js (version 18 or higher)
- PostgreSQL (version 12 or higher)
- Redis (version 6 or higher)
- npm or yarn

### For the Android App
- Android Studio Hedgehog (2023.1.1) or higher
- JDK 17 or higher
- Android SDK (API Level 24 and above)

## Installation and Setup

### 1. Install Dependencies

```bash
# Install the project root dependencies
npm install

# Install the backend dependencies
cd backend
npm install

# Install the frontend dependencies
cd ../frontend
npm install
```

### 2. Setting up the database

1. Start PostgreSQL
2. Create a new database:
```sql
CREATE DATABASE steedly;
```

3. Run the schema file:
```bash
psql -U postgres -d steedly -f backend/src/database/schema.sql
```

### 3. Configuring environment variables

#### Backend
Copy the `.env.example` file in the `backend` folder and rename it to `.env`:

```bash
cd backend
cp .env.example .env
```

Then set the values:
- `DB_HOST`: Database address (default: localhost)
- `DB_NAME`: Database name (default: steedly)
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: A random string for JWT
- `REDIS_HOST`: Redis address (default: localhost)

#### Frontend
Copy the `.env.example` file in the `frontend` folder and rename it to `.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Set the value of `NEXT_PUBLIC_API_URL` (default: http://localhost:3000/api)

### 4. Setting up Redis

```bash
# On Linux/Mac
redis-server

# Or on Windows using WSL
```

### 5. Running the project

#### Development mode

From the project root:
```bash
npm run dev
```

This command runs both the backend and frontend simultaneously.

Or separately:

```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd frontend
npm run dev
```

#### Production mode

```bash
# Build the project
npm run build

# Run the backend
cd backend
npm start

# Run the frontend
cd frontend
npm start
```

## Accessing the application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Project Structure

```
steedly/
├── backend/              # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Middlewares
│   │   ├── database/     # Database and Redis connection
│   │   └── index.ts      # Entry point
│   └── package.json
├── frontend/            # Next.js + TypeScript (PWA) frontend
│   ├── app/             # Pages and layout
│   ├── components/      # React components
│   ├── lib/             # Helper functions and API
│   └── package.json
├── android/             # Android application (Kotlin + Jetpack Compose)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/ir/steedly/app/
│   │   │   │   ├── data/      # Models and API
│   │   │   │   ├── ui/        # Screens and components
│   │   │   │   └── MainActivity.kt
│   │   │   └── res/           # Resources
│   │   └── build.gradle.kts
│   └── build.gradle.kts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Registration
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Blog
- `GET /api/blog/posts` - List articles
- `GET /api/blog/posts/:slug` - Get article
- `GET /api/blog/posts/search?q=...` - Search articles
- `GET /api/blog/categories` - Categories

### Services
- `GET /api/services/veterinarians` - List veterinarians
- `GET /api/services/transporters` - List horse transporters
- `POST /api/services/bookings` - Create booking
- `GET /api/services/bookings` - List bookings

### Shop
- `GET /api/shop/products` - List products
- `GET /api/shop/products/:slug` - Get product
- `POST /api/shop/orders` - Create order
- `GET /api/shop/orders` - List orders

### Competitions
- `GET /api/competitions` - List competitions
- `GET /api/competitions/:slug` - Get competition
- `GET /api/competitions/:id/results` - Competition results

## Important Notes

1. **Security**: In the production environment, be sure to change `JWT_SECRET` to a strong random value.

2. **Files**: The `uploads` folder is used for file uploads. Make sure this folder exists.

3. **PWA**: To fully enable the PWA, put the appropriate icons in the `frontend/public` folder.

4. **Database**: For the production environment, use migration tools and keep regular backups.

## Setting up the Android application

For full details, see [README-ANDROID.md](android/README-ANDROID.md).

### Quick steps:

1. Open Android Studio
2. Open the project from the `android` folder
3. Set the API address in `RetrofitClient.kt`
4. Run the application

### Building the file for Cafe Bazaar:

```bash
cd android
./gradlew bundleRelease
```

For the complete Cafe Bazaar publishing guide, see [CAFEBAZAAR-GUIDE.md](CAFEBAZAAR-GUIDE.md).

## Further development

- To add a new module, follow the existing pattern
- Use TypeScript for type safety
- Add unit and integration tests
- Use ESLint and Prettier for code formatting

## More documentation

- [README-SETUP.md](README-SETUP.md) - Setup guide
- [README-ANDROID.md](android/README-ANDROID.md) - Android guide
- [CAFEBAZAAR-GUIDE.md](CAFEBAZAAR-GUIDE.md) - Cafe Bazaar publishing guide
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - Project structure

## Support

If you run into a problem, please create an issue in the repository.

