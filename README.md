# FitDay AI

Smart Fitness. Balanced Life.

FitDay AI is a modern web app for daily fitness and lifestyle tracking, built with Next.js, TypeScript, Tailwind CSS, and Cloudflare D1. It provides diet planning, workout routines, progress tracking, and basic user authentication.

## Features

- User profile and personalization
- Daily meal plans tailored to local (Bangladeshi) foods
- Smart workout plans
- Progress tracking and sharing
- Local session management (browser)
- Deployable to Vercel / Cloudflare Pages with D1

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (optional for local DB)

### Quick start

1. Clone repository
2. Install deps: `npm install`
3. Create .env.local with required variables (if using Cloudflare D1)
4. Run dev server: `npm run dev`
5. Visit: http://localhost:3000

## Project Structure (overview)

- app/ — Next.js App Router pages and API routes
- components/ — React UI components
- lib/ — utilities (DB, auth, nutrition)
- db/ — SQL schema and seeds

## Deployment

- Vercel recommended for Next.js App Router
- Cloudflare Pages + D1 supported; ensure D1 bindings are configured

## Contributing

Fork, branch, implement, test, and submit a PR.

## License

MIT
