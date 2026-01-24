# FitDayAI - Deployment Guide

## 🚀 Quick Start Deployment

This guide will help you deploy FitDayAI to production on Cloudflare Pages.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Cloudflare account
- [x] Neon PostgreSQL database
- [x] Upstash Redis account
- [x] Google Gemini API key

---

## 🔧 Step 1: Environment Setup

### 1.1 Create `.env.local` file

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host/database?sslmode=require"

# AI (Google Gemini)
GEMINI_API_KEY="your_gemini_api_key_here"

# Redis (Upstash - Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET="your_session_secret_here"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 1.2 Get Your API Keys

**Neon PostgreSQL:**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use it for both `DATABASE_URL` and `DIRECT_URL`

**Upstash Redis:**
1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy REST URL and Token
4. Add to environment variables

**Google Gemini:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Get API key
3. Add to `GEMINI_API_KEY`

---

## 📦 Step 2: Build Configuration

### 2.1 Verify `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2.2 Check `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['raw.githubusercontent.com'],
  },
}

module.exports = nextConfig
```

---

## ☁️ Step 3: Cloudflare Pages Deployment

### 3.1 Connect GitHub Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Select **Connect to Git**
5. Choose your GitHub repository (`zihad2003/fitday.ai`)
6. Click **Begin setup**

### 3.2 Configure Build Settings

**Framework preset**: Next.js

**Build command**:
```bash
npx @cloudflare/next-on-pages
```

**Build output directory**:
```
.vercel/output/static
```

**Root directory**: `/` (leave empty)

**Environment variables**: Add all from `.env.local`

### 3.3 Deploy

1. Click **Save and Deploy**
2. Wait for build to complete (3-5 minutes)
3. Your app will be live at `https://your-project.pages.dev`

---

## 🔗 Step 4: Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Cloudflare Pages, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `fitday.ai`)
4. Follow DNS configuration instructions

### 4.2 Update Environment Variables

```env
NEXT_PUBLIC_APP_URL="https://fitday.ai"
```

Redeploy after updating.

---

## 🗄️ Step 5: Database Setup

### 5.1 Run Migrations

```bash
# Install Drizzle Kit
npm install -g drizzle-kit

# Push schema to database
npx drizzle-kit push:pg
```

### 5.2 Verify Tables

Your database should have these tables:
- `users`
- `user_profiles`
- `workouts`
- `meals`
- `progress`

---

## 🔐 Step 6: Security Checklist

- [x] Environment variables set in Cloudflare
- [x] SESSION_SECRET is random and secure
- [x] Database uses SSL (`sslmode=require`)
- [x] CORS configured correctly
- [x] Rate limiting enabled
- [x] CSRF protection active

---

## 📊 Step 7: Post-Deployment Verification

### 7.1 Test Core Features

1. **Authentication**:
   - Register new user
   - Login
   - Logout
   - Session persistence

2. **Dashboard**:
   - Load dashboard
   - View AI insights
   - Check data fetching

3. **PWA**:
   - Install prompt appears
   - Service worker registers
   - Offline page works

4. **Accessibility**:
   - Keyboard navigation
   - Screen reader compatibility
   - Focus indicators

### 7.2 Performance Check

Run Lighthouse audit:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run audit
4. Verify scores:
   - Performance: 90+
   - Accessibility: 100
   - Best Practices: 100
   - SEO: 100
   - PWA: 100

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error**: `TypeScript errors`
```bash
# Check for type errors
npm run lint
```

### Runtime Errors

**Error**: `Database connection failed`
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Ensure SSL mode is enabled

**Error**: `AI features not working`
- Verify `GEMINI_API_KEY` is set
- Check API quota limits
- Review API logs

**Error**: `Rate limiting not working`
- Verify Upstash Redis credentials
- Check Redis is accessible
- Review middleware logs

---

## 🔄 Continuous Deployment

### Automatic Deployments

Cloudflare Pages automatically deploys when you push to `main`:

```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

### Preview Deployments

Pull requests automatically get preview URLs:
- `https://pr-123.your-project.pages.dev`

---

## 📈 Monitoring & Analytics

### Recommended Tools

**Error Tracking**:
```bash
npm install @sentry/nextjs
```

**Analytics**:
```bash
npm install @vercel/analytics
# or
npm install plausible-tracker
```

**Performance**:
- Cloudflare Web Analytics (built-in)
- Vercel Speed Insights

---

## 🔧 Environment-Specific Configuration

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.fitday.ai
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fitday.ai
```

---

## 📱 PWA Configuration

### Manifest.json

Already configured at `/public/manifest.json`:
```json
{
  "name": "FitDay AI",
  "short_name": "FitDay",
  "description": "Your personal fitness and lifestyle assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#020617",
  "theme_color": "#8b5cf6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

Already configured at `/public/sw.js` - no changes needed.

---

## 🎯 Performance Optimization

### Image Optimization

Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // for above-fold images
/>
```

### Code Splitting

Next.js automatically code-splits. For manual splitting:
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

---

## 🔒 Security Best Practices

### Headers Configuration

Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### Rate Limiting

Already configured in `middleware.ts`:
- Auth routes: 5 requests/minute
- Other API routes: 100 requests/minute

---

## 📞 Support

### Common Issues

1. **Build timeout**: Increase Node memory
   ```bash
   NODE_OPTIONS=--max-old-space-size=8192 npm run build
   ```

2. **Database connection pool**: Use connection pooling
   ```env
   DATABASE_URL="postgresql://...?pgbouncer=true"
   ```

3. **API rate limits**: Implement caching
   ```typescript
   // Already implemented in service worker
   ```

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Service worker registered
- [ ] PWA manifest valid
- [ ] Lighthouse scores verified
- [ ] Error tracking setup
- [ ] Analytics configured
- [ ] Backup strategy in place

---

## 🎉 You're Live!

Your FitDayAI app is now deployed and accessible to users worldwide!

**Next Steps:**
1. Monitor error logs
2. Track user analytics
3. Gather user feedback
4. Plan feature updates
5. Regular security audits

---

**Need Help?**
- Check [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- Review [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- See project documentation in `/docs` folder

---

**Version**: 2.0.0  
**Last Updated**: 2026-01-25  
**Deployment Platform**: Cloudflare Pages
