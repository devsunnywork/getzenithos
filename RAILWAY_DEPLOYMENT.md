# Railway Deployment Guide

## Quick Setup for Railway Backend

### Step 0: CORS Already Configured ✅

Your backend is already set up to accept requests from:
- `http://localhost:5000` (local development)
- `https://getzenithos.netlify.app` (production)

**File:** `server/server.js` (lines 31-53)

If you change your Netlify URL, update the `allowedOrigins` array in `server.js`.

### Step 1: Files Already Configured

The following files have `API_BASE_URL` variable at the top:

1. **`public/js/landing.js`** - Line 6
2. **`public/js/app.js`** - Line 6  
3. **`public/js/config.js`** - Centralized config (optional)

### Step 2: Deploy Backend to Railway ✅

**Your Railway Backend URL:**
```
https://zenithos-production.up.railway.app
```

✅ Backend is already deployed and running on Railway!

### Step 3: Update API URLs (When Ready for Production)

**IMPORTANT:** Currently set to `localhost` for local development.
When you want to use production backend, update these files:

**Option A: Quick Find & Replace (Recommended)**

Use VS Code or any editor:
1. Open `public/js/landing.js`
2. Find: `const API_BASE_URL = 'http://localhost:5000';`
3. Replace with: `const API_BASE_URL = 'https://zenithos-production.up.railway.app';`

4. Open `public/js/app.js`
5. Find: `const API_BASE_URL = 'http://localhost:5000';`
6. Replace with: `const API_BASE_URL = 'https://zenithos-production.up.railway.app';`

**Option B: Manual Update**

Edit these two lines:
- `public/js/landing.js` - Line 6
- `public/js/app.js` - Line 6

**Example:**
```javascript
// Current (Local Development)
const API_BASE_URL = 'http://localhost:5000';

// Production (When ready to use Railway backend)
const API_BASE_URL = 'https://zenithos-production.up.railway.app';
```

### Step 4: Deploy Frontend to Netlify

1. Drag & drop your entire project folder to Netlify
2. Or connect via GitHub
3. Netlify will serve `index.html` from root
4. Done! ✅

## Important Notes

- ⚠️ **NO trailing slash** in Railway URL
- ✅ Correct: `https://app.railway.app`
- ❌ Wrong: `https://app.railway.app/`

- All API calls are already configured to use `${API_BASE_URL}/api/...`
- You only need to change 2 lines total (one in each file)

## Files That Make API Calls

These files automatically use `API_BASE_URL`:
- `landing.js` - Login/Register
- `app.js` - All dashboard features
- All other JS files inherit from these

## Testing

After deployment:
1. Open your Netlify URL
2. Try login
3. Check browser console for any errors
4. Verify API calls go to Railway URL

## Rollback to Local

To test locally again:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

That's it! 🚀
