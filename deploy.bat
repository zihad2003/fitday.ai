@echo off
echo "🚀 Deploying FitDayAI to Cloudflare Pages..."

echo "📦 Installing dependencies..."
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo "❌ npm install failed!"
    exit /b 1
)

echo "✅ Dependencies installed!"

echo "📦 Building application..."
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo "❌ Build failed!"
    echo "Please check the error messages above."
    exit /b 1
)

echo "✅ Build successful!"

echo "🌐 Deploying to Cloudflare Pages..."
call npm run deploy

if %ERRORLEVEL% NEQ 0 (
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
    exit /b 1
)

echo "🎉 Deployment successful!"
echo "🌍 Your FitDayAI application is now live!"
echo "URL: https://e5060afc.fitday.ai.pages.dev"
pause