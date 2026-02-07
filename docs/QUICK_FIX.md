# ⚡ Quick Fix - Cannot See Anything

## Problem: Blank Page or Nothing Showing

### Solution 1: Start Server Properly

**Open a NEW PowerShell window and run:**

```powershell
cd D:\FitDayAI
npm run dev
```

**Wait until you see:**
```
✓ Ready in X.Xs
```

**Then open browser:** http://localhost:3000

---

### Solution 2: Use the Batch File

**Double-click:** `run-server.bat`

This will start the server automatically.

---

### Solution 3: Check What's Running

**Check if something is already running:**
```powershell
netstat -ano | findstr :3000
```

**If port is busy, kill it:**
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Then start fresh:**
```powershell
npm run dev
```

---

### Solution 4: Clear Cache and Restart

```powershell
cd D:\FitDayAI

# Delete Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start server
npm run dev
```

---

### Solution 5: Check Browser Console

1. Open browser to http://localhost:3000
2. Press **F12** to open Developer Tools
3. Check **Console** tab for errors
4. Check **Network** tab to see if files are loading

---

### Solution 6: Try Different URL

Instead of `localhost`, try:
- http://127.0.0.1:3000
- http://localhost:3000 (with http:// not https://)

---

### Solution 7: Verify Server Started

**You MUST see this in terminal:**
```
▲ Next.js 15.4.10
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

**If you don't see this, the server didn't start!**

---

## Common Issues

### Issue: Terminal shows errors
**Fix:** Share the error message and I'll help fix it

### Issue: "Cannot find module"
**Fix:** Run `npm install`

### Issue: "Port already in use"
**Fix:** Use Solution 3 above

### Issue: Page loads but is blank
**Fix:** Check browser console (F12) for JavaScript errors

---

## Step-by-Step Checklist

- [ ] Opened NEW PowerShell/Command Prompt window
- [ ] Navigated to `D:\FitDayAI`
- [ ] Ran `npm run dev`
- [ ] Saw "Ready" message in terminal
- [ ] Opened browser to http://localhost:3000
- [ ] See FitDayAI homepage

---

## Still Not Working?

**Share:**
1. What you see in terminal when running `npm run dev`
2. What you see in browser (screenshot if possible)
3. Any error messages from browser console (F12)
