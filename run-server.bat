@echo off
echo ========================================
echo   FitDayAI - Starting Development Server
echo ========================================
echo.

cd /d D:\FitDayAI

echo Checking environment...
if exist .env.local (
    echo [OK] Environment file found
) else (
    echo [WARN] .env.local not found
)

echo.
echo Starting Next.js development server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause
