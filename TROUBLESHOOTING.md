# Troubleshooting Guide

## Problem: Next.js files are requested from port 3000

### Cause
- The browser has cached that static files should be requested from port 3000
- Or an old Service Worker has cached it

### Solution

#### 1. Hard Refresh the browser
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### 2. Clear the Cache
1. Open Developer Tools (F12)
2. Go to the **Application** tab
3. On the left, select **Clear storage**
4. Click **Clear site data**

#### 3. Unregister Service Worker
1. Developer Tools > Application > Service Workers
2. Click **Unregister**
3. Refresh the page

#### 4. Restart the application
```bash
# Stop the application (Ctrl+C)
# Then run again
npm run dev
```

## Problem: PWA icons are missing

### Solution
1. Create real icons (according to `ICON-SETUP.md`)
2. Or use a placeholder (for testing)

## Problem: MIME Type Error

### Cause
- Headers for JavaScript files are not set correctly

### Solution
- `next.config.js` has been fixed
- Restart the application

## Checking status

### Make sure that:
- ✅ Backend runs on port **3000**
- ✅ Frontend runs on port **3001**
- ✅ Static files are requested from port **3001**

### Checking in the browser:
1. Developer Tools > Network tab
2. Refresh the page
3. Check which port the `_next/static` files are requested from

