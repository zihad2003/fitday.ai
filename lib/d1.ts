// lib/d1.ts - Final Correct Logic
import { getRequestContext } from '@cloudflare/next-on-pages'


// ১. ডাটাবেস কানেকশন পাওয়ার হেল্পার ফাংশন
// ১. ডাটাবেস কানেকশন পাওয়ার হেল্পার ফাংশন
function getDB() {
  try {
    // 1. Try process.env (Standard Next.js dev)
    const envDB = (process.env as any).FITNESS_DB;
    if (envDB) return envDB;

    // 2. Try getRequestContext (Cloudflare Pages dev/prod)
    try {
      const ctx = getRequestContext();
      if (ctx && ctx.env && (ctx.env as any).FITNESS_DB) {
        return (ctx.env as any).FITNESS_DB;
      }
    } catch (err) { }

    // 3. Safety Check
    if (process.env.NODE_ENV === 'production') {
      console.error("CRITICAL: Database binding (FITNESS_DB) missing in PRODUCTION.");
      throw new Error("Database configuration error");
    }

    return null;
  } catch (e: any) {
    if (process.env.NODE_ENV === 'production') throw e;
    return null;
  }
}

// ২. ডাটা পড়ার জন্য (SELECT) 
// Fallback logic added for local development without D1 bindings
export async function selectQuery(query: string, params: any[] = []) {
  const db = getDB()

  if (!db) {
    console.warn("⚠️ Database binding missing. Entering Mock/Demo mode.");
    // Simple mock responses for common queries
    if (query.includes('FROM users')) {
      return [{
        id: 1, email: 'demo@fitday.ai', name: 'Demo User',
        gender: 'male', age: 25, height_cm: 175, weight_kg: 70,
        activity_level: 'moderate', goal: 'maintain', target_calories: 2200
      }]
    }
    if (query.includes('FROM food_items') || query.includes('FROM exercises')) {
      // Return empty or could import from food-data.ts if needed
      return []
    }
    return []
  }

  try {
    const stmt = db.prepare(query).bind(...params)
    const { results } = await stmt.all()
    return results || []
  } catch (error) {
    console.error("❌ SQL Select Error:", error)
    return []
  }
}

// ৩. ডাটা লিখার জন্য (INSERT, UPDATE, DELETE)
export async function executeMutation(query: string, params: any[] = []) {
  const db = getDB()
  if (!db) {
    console.warn("⚠️ Database binding missing. Mutation skipped in Demo mode.");
    return 1 // Simulate success
  }

  try {
    const stmt = db.prepare(query).bind(...params)
    const info = await stmt.run()
    return info.success ? 1 : 0
  } catch (error) {
    console.error("❌ SQL Mutation Error:", error)
    return 0
  }
}