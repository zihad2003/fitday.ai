/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is enabled by default in Next.js 14
  output: 'export',
  trailingSlash: false,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://e5060afc.fitday.ai.pages.dev'
      : 'http://localhost:3000'
  }
}

module.exports = nextConfig