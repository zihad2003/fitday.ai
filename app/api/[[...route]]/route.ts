import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { cors } from 'hono/cors'
export const runtime = 'nodejs'

// 1. STRONG TYPING: Define exactly what your environment looks like
// This prevents "undefined" crashes and gives you autocomplete.
type Bindings = {
  FITNESS_DB: D1Database
}

// Initialize Hono with the Type Definition
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

// 2. MIDDLEWARE: Security & Logging
app.use('*', cors()) // Allow Cross-Origin requests (essential for Next.js client fetching)

// 3. GLOBAL ERROR BARRIER: Catches any crash in the app
app.onError((err, c) => {
  console.error('🔥 Server Error:', err)
  return c.json({
    success: false,
    message: 'Internal Server Error',
    error: err instanceof Error ? err.message : 'Unknown error'
  }, 500)
})

// 4. 404 HANDLER: Clean response for wrong URLs
app.notFound((c) => {
  return c.json({ success: false, message: 'Endpoint not found' }, 404)
})

// --- ROUTES ---

// Health Check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'FitDay AI Engine is Operational',
    timestamp: new Date().toISOString()
  })
})

// Fetch Workouts (Optimized)
app.get('/workouts', async (c) => {
  // A. Access via Hono Context (c.env), NOT process.env
  // This is the correct way to handle Edge bindings
  const db = c.env.FITNESS_DB

  // B. Defensive Check: Ensure DB binding actually exists
  if (!db) {
    throw new Error('Database binding (FITNESS_DB) is missing. Check Vercel/Cloudflare config.')
  }

  // C. The Query (Wrapped safely by app.onError automatically)
  // We use .results to get the clean array
  const { results } = await db.prepare('SELECT * FROM workouts ORDER BY id DESC LIMIT 50').all()

  // D. Standardized Response
  return c.json({
    success: true,
    count: results.length,
    data: results
  })
})

// Export handlers for Next.js App Router
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)