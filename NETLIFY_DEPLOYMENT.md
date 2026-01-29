# Netlify Deployment Instructions

## ✅ Backend Connected to Railway

Your frontend is now configured to use Railway backend:
- **Backend URL:** `https://zenithos-production.up.railway.app`
- **Frontend URL:** `https://getzenithos.netlify.app`

## Files Updated

✅ `public/js/landing.js` - Line 6 (Railway URL)
✅ `public/js/app.js` - Line 6 (Railway URL)
✅ `public/js/config.js` - Line 20 (Railway URL)

## Deploy to Netlify

### Option 1: Drag & Drop (Easiest)

1. **Prepare files:**
   - Make sure `index.html` is in root directory ✅
   - Make sure `public/` folder has all JS/CSS files ✅

2. **Go to Netlify:**
   - Visit: https://app.netlify.com/drop
   - Drag your entire project folder
   - Wait for deployment

3. **Done!** Your site will be live at `https://getzenithos.netlify.app`

### Option 2: GitHub (Recommended for Updates)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Connected to Railway backend"
   git push origin main
   ```

2. **Connect Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your repository
   - Build settings:
     - **Build command:** Leave empty
     - **Publish directory:** `.` (root)
   - Click "Deploy site"

3. **Custom Domain (Optional):**
   - Go to Site settings → Domain management
   - Add custom domain: `getzenithos.netlify.app`

## Testing After Deployment

1. **Open your Netlify URL**
2. **Try Login:**
   - Should connect to Railway backend
   - Check browser console for any errors
3. **Test Features:**
   - Dashboard
   - Courses
   - Profile
   - All API calls should work

## Important Files Structure

```
Project Root/
├── index.html              ← Landing page (root)
├── public/
│   ├── js/
│   │   ├── landing.js     ← Railway URL configured
│   │   ├── app.js         ← Railway URL configured
│   │   └── config.js      ← Railway URL configured
│   ├── user.html          ← Dashboard
│   ├── admin.html         ← Admin panel
│   └── explore-tree.html  ← Explore tree
└── server/                ← Don't deploy this to Netlify
```

## Troubleshooting

### CORS Errors
- Backend already configured for `https://getzenithos.netlify.app`
- If you change Netlify URL, update `server/server.js` line 36

### 404 Errors on Routes
- Netlify needs a `_redirects` file for SPA routing
- Create `public/_redirects` with:
  ```
  /*    /index.html   200
  ```

### API Not Working
- Check browser console
- Verify Railway backend is running
- Test Railway URL directly: `https://zenithos-production.up.railway.app/api/settings/branding`

## Rollback to Local Development

If you want to test locally again:

1. Change in `public/js/landing.js` line 6:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```

2. Change in `public/js/app.js` line 6:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```

3. Restart local server:
   ```bash
   cd server
   node server.js
   ```

## Summary

✅ Frontend configured for Railway backend
✅ Ready to deploy to Netlify
✅ CORS configured
✅ All API calls will work

**Next Step:** Deploy to Netlify using Option 1 or 2 above! 🚀
