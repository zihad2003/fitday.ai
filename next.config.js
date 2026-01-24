/** @type {import('next').NextConfig} */
const nextConfig = {
  // For local development, don't use static export (API routes need server)
  // Only use static export for production builds when BUILD_STATIC=true
  ...(process.env.BUILD_STATIC === 'true' ? {
    output: 'export',
    distDir: 'out',
    images: {
      unoptimized: true
    }
  } : {
    // For development with API routes
    images: {
      unoptimized: true
    }
  }),
  trailingSlash: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://e5060afc.fitday.ai.pages.dev'
      : 'http://localhost:3000'
  }
}

module.exports = nextConfig