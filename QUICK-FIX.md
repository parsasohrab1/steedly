# Quick Fix Guide

## Problem: npm error ENOENT

### Cause
You are in the wrong path. `package.json` is in the `steedly` folder.

### Solution

#### 1. Go to the correct path:
```bash
cd steedly
```

#### 2. Then run the command:
```bash
npm run dev:backend
```

Or to run Backend and Frontend together:
```bash
npm run dev
```

## Correct paths

- **Main project**: `C:\Users\asus\Documents\steedly\steedly`
- **Backend**: `C:\Users\asus\Documents\steedly\steedly\backend`
- **Frontend**: `C:\Users\asus\Documents\steedly\steedly\frontend`

## Useful Commands

### Checking the current path
```bash
pwd
# Or in PowerShell:
Get-Location
```

### Going to the project path
```bash
cd C:\Users\asus\Documents\steedly\steedly
```

### Running the Backend
```bash
npm run dev:backend
```

### Running the Frontend
```bash
npm run dev:frontend
```

### Running both
```bash
npm run dev
```

