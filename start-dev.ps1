# PowerShell script to start FitDayAI dev server
Write-Host "Starting FitDayAI Development Server..." -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found" -ForegroundColor Yellow
    Write-Host "   AI features will not work without GEMINI_API_KEY" -ForegroundColor Yellow
    Write-Host "   Create .env.local with: GEMINI_API_KEY=your_key_here" -ForegroundColor Yellow
    Write-Host ""
}

# Start the dev server
Write-Host "🚀 Starting Next.js dev server on http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev
