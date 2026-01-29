# Git Setup & Push to GitHub

## Step 1: Create .gitignore (Important!)

Before pushing, make sure sensitive files are not uploaded:

```
# Dependencies
node_modules/

# Environment variables (IMPORTANT - Don't upload!)
.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Build files
dist/
build/

# Temporary files
*.tmp
*.temp
```

## Step 2: Initialize Git Repository

```bash
cd "c:\Advik\Development\Project Alpha"
git init
```

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Create First Commit

```bash
git commit -m "Initial commit - Zenith OS connected to Railway backend"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `zenith-os` (or any name you want)
3. Description: "Zenith OS - Life Operating System"
4. Choose: **Private** or **Public**
5. **DO NOT** initialize with README (we already have code)
6. Click "Create repository"

## Step 6: Connect to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/zenith-os.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

## Step 7: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files
3. ✅ Make sure `.env` is **NOT** visible (it should be ignored)

## Quick Commands (Copy-Paste Ready)

```bash
# Navigate to project
cd "c:\Advik\Development\Project Alpha"

# Initialize Git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - Zenith OS"

# Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/zenith-os.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Future Updates

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/zenith-os.git
```

### Error: "Authentication failed"
- Use GitHub Personal Access Token instead of password
- Or use GitHub Desktop app (easier)

### Files too large
- Check if `node_modules/` is being uploaded
- Make sure `.gitignore` exists and has `node_modules/`

## Important Notes

⚠️ **NEVER upload `.env` file** - It contains sensitive data like MongoDB password
✅ `.gitignore` will prevent this automatically
✅ Railway and Netlify use their own environment variables

## After Pushing to GitHub

You can then:
1. Connect Netlify to this GitHub repo
2. Auto-deploy on every push
3. Easy updates in future

Ready to push! 🚀
