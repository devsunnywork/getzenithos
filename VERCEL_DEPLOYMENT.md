# Vercel Deployment Guide for Zenith OS

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

This will open browser - login with GitHub account.

## Step 3: Deploy

```bash
cd "c:\Advik\Development\Project Alpha"
vercel
```

### During Setup, Answer:

1. **Set up and deploy?** → `Y` (Yes)
2. **Which scope?** → Select your account
3. **Link to existing project?** → `N` (No)
4. **Project name?** → `zenith-os` (or press Enter for default)
5. **Directory?** → `.` (press Enter)
6. **Override settings?** → `N` (No)

Wait for deployment... ⏳

## Step 4: Add Environment Variables

After first deployment:

```bash
vercel env add MONGO_URI
```
Paste your MongoDB URI and press Enter.

```bash
vercel env add JWT_SECRET
```
Paste your JWT secret and press Enter.

```bash
vercel env add PORT
```
Type `5000` and press Enter.

## Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

## Step 6: Get Your URLs

Vercel will give you:
- **Preview URL:** `https://zenith-os-xyz.vercel.app`
- **Production URL:** `https://zenith-os.vercel.app`

## Step 7: Update Frontend API URLs

Copy your Vercel URL, then update:

**File: `public/js/landing.js` (line 6)**
```javascript
const API_BASE_URL = 'https://zenith-os.vercel.app';
```

**File: `public/js/app.js` (line 6)**
```javascript
const API_BASE_URL = 'https://zenith-os.vercel.app';
```

## Step 8: Update CORS

**File: `server/server.js` (line 34)**
```javascript
const allowedOrigins = [
    'http://localhost:5000',
    'https://getzenithos.netlify.app',
    'https://zenith-os.vercel.app'  // Add your Vercel URL
];
```

## Step 9: Push Changes to GitHub

```bash
git add .
git commit -m "Updated for Vercel deployment"
git push
```

## Step 10: Final Deploy

```bash
vercel --prod
```

## ✅ Done!

Your app is now live at:
- **Frontend + Backend:** `https://zenith-os.vercel.app`

## Future Updates

Just run:
```bash
vercel --prod
```

Or connect GitHub for auto-deploy:
1. Go to https://vercel.com/dashboard
2. Import your GitHub repo
3. Auto-deploy on every push!

## Troubleshooting

### Error: "Serverless Function has timed out"
- Vercel free tier has 10s timeout
- Optimize slow API calls
- Consider upgrading plan

### Error: "Module not found"
- Make sure `package.json` is in root
- Run `npm install` locally first

### CORS Errors
- Check `allowedOrigins` in `server/server.js`
- Make sure Vercel URL is added

## Alternative: Vercel Dashboard Deploy

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import `devsunnywork/getzenithos`
4. Add environment variables
5. Deploy!

---

**Need help?** Let me know! 🚀
