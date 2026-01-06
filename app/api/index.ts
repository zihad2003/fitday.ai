import { Hono } from 'hono'
import { D1Database } from '@cloudflare/workers-types'

const app = new Hono()

// Health check endpoint
app.get('/', (c) => c.text('FitDay AI Worker is running!'))

// Example: Fetch workouts from D1
app.get('/workouts', async (c) => {
  const db: D1Database = c.env.FITNESS_DB
  const res = await db.prepare('SELECT * FROM workouts').all()
  return c.json(res.results)
})

export default app
