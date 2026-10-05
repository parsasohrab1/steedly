# Application Startup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (running)
3. **Redis** (running)

## Installing Dependencies

```bash
npm run install:all
```

## Startup

### Method 1: Simultaneous startup (recommended)

```bash
npm run dev
```

This command starts both the Backend and Frontend simultaneously:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3001

### Method 2: Separate startup

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

## Checking status

### Backend Health Check
```bash
curl http://localhost:3000/health
```

Or in the browser:
http://localhost:3000/health

### Frontend
In the browser:
http://localhost:3001

## Common Problems

### ERR_CONNECTION_REFUSED

**Cause**: The application has stopped

**Solution**:
1. Make sure `npm run dev` is running
2. Check that PostgreSQL and Redis are running
3. Check the ports:
   ```bash
   netstat -ano | findstr ":3000 :3001"
   ```

### Port is in use

**Solution**:
1. Stop the process:
   ```bash
   # Windows PowerShell
   Get-Process -Name node | Stop-Process -Force
   ```
2. Or change the port (in `.env` or `package.json`)

### Database Connection Error

**Solution**:
1. Make sure PostgreSQL is running
2. Check the `.env` settings
3. Create the Database

## Stopping the application

In the terminal where `npm run dev` is running:
- `Ctrl + C` (Windows/Linux)
- `Cmd + C` (Mac)

## Building for Production

```bash
npm run build
```

Then:
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

