# Render.com Deployment - Quick Guide

## Why Render?
- ✅ Free tier (750 hours/month)
- ✅ Easy as Railway
- ✅ GitHub auto-deploy
- ✅ No credit card needed for free tier

## Step-by-Step Deployment

### 1. Go to Render
Visit: https://render.com

### 2. Sign Up
- Click "Get Started"
- Sign in with GitHub
- Authorize Render

### 3. Create New Web Service
- Click "New +" button (top right)
- Select "Web Service"

### 4. Connect Repository
- Find and select: `devsunnywork/getzenithos`
- Click "Connect"

### 5. Configure Service

**Basic Settings:**
- **Name:** `zenith-os-backend` (or any name)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** `server`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Instance Type:**
- Select: **Free** (750 hours/month)

### 6. Add Environment Variables

Click "Advanced" → Scroll to "Environment Variables"

Add these 3 variables:

**Variable 1:**
- Key: `MONGO_URI`
- Value: (paste your MongoDB connection string from .env file)

**Variable 2:**
- Key: `JWT_SECRET`  
- Value: (paste your JWT secret from .env file)

**Variable 3:**
- Key: `PORT`
- Value: `5000`

### 7. Deploy!

- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- Status will show "Live" when ready

### 8. Copy Your Render URL

After deployment, you'll get a URL like:
```
https://zenith-os-backend.onrender.com
```

Copy this URL!

### 9. Update Frontend API URLs

**File 1: `public/js/landing.js` (line 6)**
```javascript
const API_BASE_URL = 'https://zenith-os-backend.onrender.com';
```

**File 2: `public/js/app.js` (line 6)**
```javascript
const API_BASE_URL = 'https://zenith-os-backend.onrender.com';
```

### 10. Update CORS

**File: `server/server.js` (line 34)**
```javascript
const allowedOrigins = [
    'http://localhost:5000',
    'https://getzenithos.netlify.app',
    'https://getzenithos.vercel.app',
    'https://zenith-os-backend.onrender.com'  // Add Render URL
];
```

### 11. Push Changes

```bash
git add .
git commit -m "Updated API URLs for Render backend"
git push
```

Render will auto-redeploy!

## ✅ Done!

Your backend is now live on Render!

**Test it:**
- Backend: `https://your-app.onrender.com/api/settings/branding`
- Frontend: `https://getzenithos.vercel.app`

## Important Notes

⚠️ **Free tier sleeps after 15 min of inactivity**
- First request may take 30-60 seconds to wake up
- Subsequent requests are fast

✅ **Auto-deploy on GitHub push**
- Every push to main branch auto-deploys
- No manual deployment needed

## Troubleshooting

### Build Failed
- Check if `package.json` is in `server/` folder
- Verify all dependencies are listed

### Service Won't Start
- Check environment variables are set correctly
- View logs in Render dashboard

### CORS Errors
- Make sure frontend URL is in `allowedOrigins`
- Redeploy after updating CORS

---

**Ready to deploy!** 🚀

Just follow steps 1-7, then I'll help you update the URLs!
