# Steedly Project Structure

## Overview

This project is a comprehensive platform for horse information, services and an online shop, including:

1. **Backend**: Node.js + Express + TypeScript + PostgreSQL + Redis
2. **Frontend**: Next.js 14 + TypeScript + Tailwind CSS (PWA)

## Folder structure

```
steedly/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   │   ├── authController.ts
│   │   │   ├── blogController.ts
│   │   │   ├── serviceController.ts
│   │   │   ├── shopController.ts
│   │   │   └── competitionController.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts
│   │   │   ├── blog.ts
│   │   │   ├── services.ts
│   │   │   ├── shop.ts
│   │   │   └── competitions.ts
│   │   ├── middleware/         # Middlewares
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── errorHandler.ts # Error handling
│   │   │   └── validation.ts   # Validation
│   │   ├── database/           # Database
│   │   │   ├── connection.ts   # PostgreSQL connection
│   │   │   ├── redis.ts        # Redis connection
│   │   │   ├── schema.sql      # Database schema
│   │   │   └── seed.ts         # Seed data
│   │   └── index.ts            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # PWA frontend
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Main layout
│   │   ├── page.tsx            # Home page
│   │   ├── blog/               # Blog pages
│   │   ├── shop/               # Shop pages
│   │   ├── services/           # Service pages
│   │   └── competitions/       # Competition pages
│   ├── components/             # React components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── lib/                    # Helper functions
│   │   └── api.ts              # API functions
│   ├── public/                 # Static files
│   │   ├── manifest.json       # PWA Manifest
│   │   └── sw.js               # Service Worker
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── package.json                # Root package.json
├── README.md                   # Main documentation
├── README-SETUP.md            # Setup guide
└── .gitignore
```

## Main modules

### 1. Authentication module
- User registration
- Login and logout
- Profile management
- JWT Authentication

### 2. Blog module
- Display articles
- Search articles
- Article categories
- Article management (for admin/author)

### 3. Services module
- Veterinarian registration
- Horse transporter registration
- Service booking
- Rating and review system

### 4. Shop module
- Display products
- Product categories
- Shopping cart
- Order management

### 5. Competitions module
- Display competitions
- Filter by type
- Competition results
- Competition calendar

## Technologies used

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Relational database
- **Redis**: Caching
- **JWT**: Authentication
- **bcryptjs**: Password hashing

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Icons**: Icon library
- **Axios**: HTTP client
- **PWA**: Progressive Web App support

## PWA features

- Service Worker for offline
- Web App Manifest
- Installable on the device
- Push Notifications (ready for implementation)

## Security

- JWT for authentication
- Password hashing with bcrypt
- Helmet for HTTP header security
- CORS configuration
- Input validation

## Performance

- Redis caching to improve speed
- Database indexing
- Image optimization
- Code splitting in Next.js
- Lazy loading

## Future development

- [ ] Unit and integration tests
- [ ] Android application (Kotlin + Jetpack Compose)
- [ ] Push Notifications
- [ ] Online payment system
- [ ] Admin panel
- [ ] Notification system
- [ ] Online chat and support

