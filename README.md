# 🏋️ FitDayAI - Your Personal Fitness & Lifestyle Assistant

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple)](https://web.dev/progressive-web-apps/)
[![WCAG](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> AI-powered fitness platform designed for South Asian users with personalized meal planning, workout generation, and progress tracking.

[Live Demo](https://fitday-ai.pages.dev) | [Documentation](./docs/COMPLETE_DOCUMENTATION.md) | [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

---

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Meal Planning**: Personalized nutrition with South Asian cuisine (12+ meals)
- **Workout Generation**: Custom programs from 800+ exercise database
- **Progress Prediction**: Trend analysis with milestone tracking

### 🎨 Premium UX/UI
- **Smooth Animations**: Framer Motion throughout
- **Dark Theme**: Modern glassmorphism design
- **Responsive**: Mobile-first, works on all devices
- **Accessibility**: WCAG 2.1 AA compliant

### 📱 Progressive Web App
- **Installable**: Add to home screen
- **Offline Support**: Works without internet
- **Background Sync**: Syncs data when online
- **Push Notifications**: Stay engaged

### 🔍 Advanced Search
- **Global Search (Cmd+K)**: Find anything instantly
- **Food Search**: Autocomplete with nutrition info
- **Exercise Search**: Filter by muscle group and difficulty

### 🔒 Security First
- **JWT Authentication**: Secure httpOnly cookies
- **CSRF Protection**: Validated mutations
- **Rate Limiting**: Prevent abuse
- **Encrypted Data**: Secure storage

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/zihad2003/fitday.ai.git
cd fitday.ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx drizzle-kit push:pg

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
fitday-ai/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── animations/        # Framer Motion components
│   ├── ui/                # Accessible UI components
│   └── ...                # Feature components
├── lib/                   # Utilities & services
│   ├── ai-meal-planner.ts
│   ├── ai-workout-generator.ts
│   ├── ai-progress-predictor.ts
│   └── ...
├── public/                # Static assets
│   ├── sw.js              # Service worker
│   └── manifest.json      # PWA manifest
└── docs/                  # Documentation
```

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [React Query](https://tanstack.com/query) - Data fetching

**Backend:**
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Backend API
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Upstash Redis](https://upstash.com/) - Rate limiting

**AI/ML:**
- [Google Gemini](https://ai.google.dev/) - AI chat
- Custom algorithms - Meal planning, workout generation, progress prediction

**PWA:**
- Service Worker - Advanced caching
- IndexedDB - Offline storage
- Web Push API - Notifications

---

## 📊 Key Metrics

- **10,000+** lines of code
- **50+** components
- **4** major development phases
- **100%** TypeScript coverage
- **WCAG 2.1 AA** accessibility compliance
- **800+** exercises in database
- **12+** South Asian meals

---

## 🎯 Core Features

### AI Meal Planner
- Calorie calculation using Mifflin-St Jeor Equation
- Macro distribution based on goals
- South Asian cuisine focus
- Dietary restriction support
- Cultural context for each meal

### AI Workout Generator
- Personalized workout splits (3-6 days/week)
- Exercise selection from 800+ database
- Sets/reps/rest based on goal and fitness level
- Equipment filtering
- Progressive overload planning

### AI Progress Predictor
- Linear regression for trend analysis
- Weight prediction with confidence scores
- Milestone generation
- Personalized recommendations
- Weekly progress reports

---

## ♿ Accessibility

FitDayAI is built with accessibility as a priority:

- ✅ **WCAG 2.1 AA Compliant**
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Screen Reader**: Proper ARIA labels
- ✅ **Color Contrast**: 4.5:1 minimum ratio
- ✅ **Touch Targets**: 44x44px minimum
- ✅ **Focus Indicators**: Clear visual feedback
- ✅ **Reduced Motion**: Respects user preferences

---

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Works without internet connection
- **Background Sync**: Syncs data when back online
- **Push Notifications**: Stay engaged with reminders
- **Fast Loading**: Cache-first strategy
- **App-like Experience**: Standalone display mode

---

## 🔐 Security

- **JWT Authentication**: Secure token-based auth
- **httpOnly Cookies**: XSS protection
- **CSRF Protection**: Validated mutations
- **Rate Limiting**: 5 req/min for auth, 100 req/min for API
- **SQL Injection Prevention**: Parameterized queries
- **Password Hashing**: bcrypt with 10 rounds
- **Secure Headers**: XSS, clickjacking protection

---

## 📖 Documentation

- [Complete Documentation](./docs/COMPLETE_DOCUMENTATION.md) - Full project overview
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- [Phase 1: Security](./docs/PHASE_1_SECURITY.md) - Security implementation
- [Phase 2.1: Search](./docs/PHASE_2.1_SEARCH.md) - Search features
- [Phase 2.2: Accessibility](./docs/PHASE_2.2_ACCESSIBILITY.md) - A11y features

---

## 🚀 Deployment

### Cloudflare Pages (Recommended)

```bash
# Build command
npx @cloudflare/next-on-pages

# Output directory
.vercel/output/static
```

See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

### Environment Variables

```env
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_key
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your_token
SESSION_SECRET=your_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Build test
npm run build
```

---

## 📈 Performance

Expected Lighthouse scores:
- **Performance**: 90+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: 100

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Exercise Database**: [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- **AI**: Google Gemini
- **Icons**: Heroicons
- **Fonts**: Google Fonts (Inter, Outfit)
- **Community**: South Asian Fitness Community

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/zihad2003/fitday.ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zihad2003/fitday.ai/discussions)

---

## 🗺️ Roadmap

### Phase 5 (Future)
- [ ] Social features (friends, sharing)
- [ ] Wearable integration (Fitbit, Apple Watch)
- [ ] Advanced analytics dashboard
- [ ] Voice commands
- [ ] AR workout guidance
- [ ] Meal photo recognition
- [ ] Barcode scanning
- [ ] Community challenges

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/zihad2003/fitday.ai?style=social)
![GitHub forks](https://img.shields.io/github/forks/zihad2003/fitday.ai?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/zihad2003/fitday.ai?style=social)

---

<div align="center">

**Built with ❤️ for the fitness community**

[Website](https://fitday-ai.pages.dev) • [Documentation](./docs/) • [Report Bug](https://github.com/zihad2003/fitday.ai/issues) • [Request Feature](https://github.com/zihad2003/fitday.ai/issues)

</div>