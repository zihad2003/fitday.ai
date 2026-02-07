# 🚀 How to Start FitDayAI Server

## ✅ Configuration Complete!

Your environment is now set up with:
- ✅ Gemini API Key configured
- ✅ Cloudflare D1 Database ID configured

## Step-by-Step Start Instructions

### Method 1: Standard Next.js Dev (Quick Start)

1. **Open PowerShell or Command Prompt**

2. **Navigate to project:**
   ```powershell
   cd D:\FitDayAI
   ```

3. **Start the server:**
   ```powershell
   npm run dev
   ```

4. **Wait for this message:**
   ```
   ▲ Next.js 15.4.10
   - Local:        http://localhost:3000
   ✓ Ready in X.Xs
   ```

5. **Open browser:**
   - Go to: **http://localhost:3000**
   - Or: **http://127.0.0.1:3000**

### Method 2: Cloudflare Pages Dev (Full D1 Support)

For full database functionality:

1. **Install Wrangler (if not installed):**
   ```powershell
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```powershell
   wrangler login
   ```

3. **Start with D1 database:**
   ```powershell
   npm run pages:dev
   ```

## What You Should See

### In Terminal:
```
▲ Next.js 15.4.10
- Local:        http://localhost:3000
- Ready in 2.3s

○ Compiling / ...
✓ Compiled / in XXXms
```

### In Browser:
- Homepage with "FitDay AI" branding
- Navigation menu
- "Get Started" or "Login" buttons
- Modern dark theme UI

## Troubleshooting

### If you see "Cannot GET /"
- Wait a few more seconds for compilation
- Refresh the browser
- Check terminal for errors

### If port 3000 is busy:
```powershell
# Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Or use different port
$env:PORT='3001'
npm run dev
# Then open http://localhost:3001
```

### If you see database errors:
- Use `npm run pages:dev` instead
- Or check Cloudflare D1 is properly configured

### If page is blank:
- Check browser console (F12) for errors
- Check terminal for compilation errors
- Try hard refresh (Ctrl+F5)

## Quick Commands

```powershell
# Start server
npm run dev

# Stop server
Press Ctrl+C

# Check if running
netstat -ano | findstr :3000

# View logs
# (logs appear in the terminal where you ran npm run dev)
```

## Next Steps After Server Starts

1. ✅ Server running on http://localhost:3000
2. ✅ Open browser and navigate to the URL
3. ✅ Register a new account
4. ✅ Set up your profile
5. ✅ Generate AI meal plans
6. ✅ Generate AI workout plans
7. ✅ Check lifestyle suggestions

---

**Your API key and database are configured! Just run `npm run dev` now!** 🎉
