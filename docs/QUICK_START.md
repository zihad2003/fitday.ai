# ⚡ Quick Start - Run FitDayAI on Localhost

## 🚀 Fast Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File
Create `.env.local` in the root directory:
```bash
GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### Step 3: Start Development Server

**Option A: Standard Next.js Dev (Recommended for quick testing)**
```bash
npm run dev
```

**Option B: Cloudflare Pages Dev (Full D1 database support)**
```bash
npm run pages:dev
```

### Step 4: Open Browser
Navigate to: **http://localhost:3000**

## ⚠️ Important Notes

### Database Setup
This project uses **Cloudflare D1** database. For local development:

1. **Quick Test Mode**: The app will work but database operations may fail. You can still test UI and most features.

2. **Full Database Support**: Use Wrangler for local D1:
   ```bash
   # Install Wrangler globally
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   
   # Create local database
   wrangler d1 create fitday-ai-db-local
   
   # Initialize schema
   wrangler d1 execute fitday-ai-db-local --file=./db/complete_schema.sql --local
   wrangler d1 execute fitday-ai-db-local --file=./db/complete_seed.sql --local
   
   # Run with D1 support
   npm run pages:dev
   ```

### What Works Without Database
- ✅ UI and navigation
- ✅ Authentication UI (registration/login forms)
- ✅ Dashboard display
- ✅ AI features (if API key is set)
- ❌ Data persistence (requires database)

### What Requires Database
- User registration/login
- Meal/workout generation
- Progress tracking
- All data storage

## 🎯 Quick Test Checklist

1. ✅ Server starts without errors
2. ✅ Homepage loads at http://localhost:3000
3. ✅ Can navigate to /login and /register
4. ✅ Dashboard loads (may show errors without DB)
5. ✅ AI features work (if GEMINI_API_KEY is set)

## 🔧 Troubleshooting

### Port 3000 Already in Use
```bash
PORT=3001 npm run dev
```

### API Routes Not Working
- Make sure `output: 'export'` is NOT active (already fixed in next.config.js)
- Restart the dev server

### Database Errors
- Use `npm run pages:dev` instead of `npm run dev`
- Or set up local D1 database as shown above

### AI Features Not Working
- Check `.env.local` has `GEMINI_API_KEY`
- Verify API key is valid
- Check browser console for errors

## 📝 Next Steps

1. Set up local D1 database for full functionality
2. Create a test user account
3. Generate meal and workout plans
4. Test AI features
5. Explore lifestyle suggestions

---

**The server should now be running!** 🎉

Open http://localhost:3000 in your browser.
