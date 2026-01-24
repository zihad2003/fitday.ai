# 🔧 Troubleshooting - Localhost Connection Issues

## Problem: ERR_CONNECTION_REFUSED

If you're getting "localhost refused to connect", follow these steps:

### Step 1: Check if Server is Running

Open PowerShell in the project directory and run:
```powershell
netstat -ano | findstr :3000
```

If nothing shows up, the server isn't running.

### Step 2: Start the Server Manually

**Option A: Using npm (Recommended)**
```powershell
cd D:\FitDayAI
npm run dev
```

**Option B: Using the PowerShell script**
```powershell
.\start-dev.ps1
```

**Option C: Direct Next.js command**
```powershell
npx next dev
```

### Step 3: Check for Errors

Look for error messages in the terminal. Common issues:

#### Error: "Port 3000 is already in use"
**Solution:**
```powershell
# Use a different port
$env:PORT='3001'; npm run dev
# Then open http://localhost:3001
```

#### Error: "Cannot find module"
**Solution:**
```powershell
# Reinstall dependencies
npm install
```

#### Error: "TypeScript errors"
**Solution:**
```powershell
# Check for TypeScript issues
npm run lint
```

### Step 4: Verify Server Started

You should see output like:
```
▲ Next.js 15.4.10
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Step 5: Check Firewall/Antivirus

Sometimes Windows Firewall or antivirus blocks localhost connections:
1. Check Windows Firewall settings
2. Temporarily disable antivirus to test
3. Add exception for Node.js/Next.js

### Step 6: Try Different Browser

- Try Chrome, Firefox, or Edge
- Clear browser cache
- Try incognito/private mode

### Step 7: Check Windows Hosts File

Make sure localhost isn't blocked:
1. Open `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Ensure this line exists: `127.0.0.1 localhost`
3. If not, add it

### Step 8: Alternative - Use 127.0.0.1

Instead of `localhost`, try:
```
http://127.0.0.1:3000
```

## Quick Fix Commands

```powershell
# Kill any process on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Start fresh
cd D:\FitDayAI
npm run dev
```

## Still Not Working?

1. **Check Node.js version**: Should be 18+ (`node --version`)
2. **Check npm version**: Should be 9+ (`npm --version`)
3. **Reinstall dependencies**: `npm install`
4. **Clear Next.js cache**: Delete `.next` folder and restart
5. **Check for syntax errors**: `npm run lint`

## Manual Start Instructions

1. Open PowerShell or Command Prompt
2. Navigate to project: `cd D:\FitDayAI`
3. Run: `npm run dev`
4. Wait for "Ready" message
5. Open browser to `http://localhost:3000`

## Need Help?

Check the terminal output for specific error messages and share them for further troubleshooting.
