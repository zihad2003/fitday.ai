import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

// Health check endpoint
app.get('/', (c) => c.text('FitDay AI Worker is running!'))

// Example: Fetch workouts from D1
app.get('/workouts', async (c) => {
  // Access D1 binding from process.env (standard for Next.js on Pages)
  const db = process.env.FITNESS_DB as any
  
  if (!db) {
    return c.json({ error: 'Database binding not found' }, 500)
  }

  const res = await db.prepare('SELECT * FROM workouts').all()
  return c.json(res.results)
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)