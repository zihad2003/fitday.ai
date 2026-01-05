# FitDay AI

A modern web app for daily fitness and lifestyle tracking, built with Next.js, TypeScript, Tailwind CSS, and Cloudflare D1.

## Features

- **User Authentication**: Secure sign-in with Google OAuth
- **Profile Management**: Set gender, age, height, weight, and fitness goals
- **Daily Workouts**: Guided exercise plans with progress tracking
- **Daily Diet Plans**: Meal tracking with calorie information
- **Time-Based Checklists**: Scheduled tasks that unlock at specific times
- **Progress Tracking**: Visual summaries of workouts, meals, and weight loss
- **Smart Notifications**: Reminders for meals and activities
- **Achievement Sharing**: Share your progress on social media
- **PWA Support**: Install as a mobile app

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Cloudflare D1 (Database), Next.js API Routes
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account with D1 database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fitday-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Cloudflare D1:
   - Create a Cloudflare account at [cloudflare.com](https://cloudflare.com)
   - Install Wrangler CLI: `npm install -g wrangler`
   - Login to Cloudflare: `wrangler auth login`
   - Create a D1 database: `wrangler d1 create fitday-ai-db`
   - Deploy the schema: `wrangler d1 execute fitday-ai-db --file=db/schema.sql`
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
       gender TEXT,
       age INTEGER,
       height DECIMAL,
       weight DECIMAL,
       fitness_goal TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );
     ```

4. Create `.env.local` file:
   ```
   NEXT_PUBLIC_D1_DB=42dfee08-f14f-4e08-938d-6fdebab4700e
   NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fitday-ai/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Main dashboard
│   ├── profile/           # User profile setup
│   ├── workout/           # Workout tracking
│   ├── diet/              # Diet tracking
│   ├── checklist/         # Daily checklist
│   ├── progress/          # Progress summary
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to dashboard)
├── components/            # Reusable React components
│   ├── Dashboard.tsx      # Dashboard component
│   ├── Profile.tsx        # Profile form
│   ├── Workout.tsx        # Workout interface
│   ├── Diet.tsx           # Diet tracking
│   ├── Checklist.tsx      # Time-based tasks
│   └── Progress.tsx       # Progress visualization
├── lib/                   # Utility functions and configurations
│   └── d1.ts              # Cloudflare D1 client
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── styles/                # Global styles
│   └── globals.css        # Tailwind CSS imports
└── package.json           # Dependencies and scripts
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Safety & AI Guidelines

- No extreme dieting recommendations
- No body-shaming language
- General fitness guidance only
- Consult healthcare professionals for medical advice

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.