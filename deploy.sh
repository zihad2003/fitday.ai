#!/bin/bash

echo "🚀 Deploying FitDayAI to Cloudflare Pages..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Cloudflare Pages
    echo "🌐 Deploying to Cloudflare Pages..."
    npm run deploy
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌍 Your FitDayAI application is now live!"
        echo ""
        echo "📊 What's included:"
        echo "  🍽️ 250+ Bangladeshi food items"
        echo "  🏋️ 120+ gym exercises with GIFs"
        echo "  📈 Complete progress tracking"
        echo "  🔐 Secure authentication system"
        echo "  🎨 Modern responsive UI"
        echo ""
        echo "🚀 Visit your application at your Cloudflare Pages URL!"
    else
        echo "❌ Deployment failed!"
        echo "Please check your Cloudflare configuration."
        exit 1
    fi
else
    echo "❌ Build failed!"
    echo "Please fix the build errors before deploying."
    exit 1
fi