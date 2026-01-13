// lib/d1.ts - Final Correct Logic
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// ১. ডাটাবেস কানেকশন পাওয়ার হেল্পার ফাংশন
function getDB() {
  try {
    // 1. Try process.env (Local dev or some Cloudflare setups)
    const envDB = (process.env as any).FITNESS_DB;
    if (envDB) {
      console.log('✅ Found FITNESS_DB in process.env');
      return envDB;
    }

    // 2. Try getRequestContext (Required for Cloudflare Pages production with @cloudflare/next-on-pages)
    const ctx = getRequestContext();
    if (ctx && ctx.env && (ctx.env as any).FITNESS_DB) {
      console.log('✅ Found FITNESS_DB in getRequestContext().env');
      return (ctx.env as any).FITNESS_DB;
    }

    if (!ctx) {
      console.warn('⚠️ getRequestContext() returned null - ensure you are using the correct adapter and running on Edge.');
    } else {
      console.error("❌ FITNESS_DB binding not found in ctx.env. Available keys:", Object.keys(ctx.env || {}));
    }

    return null;
  } catch (e: any) {
    console.error("❌ Database connection detection error:", e.message);
    return null;
  }
}

// ২. ডাটা পড়ার জন্য (SELECT)
export async function selectQuery(query: string, params: any[] = []) {
  const db = getDB()
  if (!db) {
    console.error("❌ Database instance is null in selectQuery")
    return null // Return null to indicate connection failure
  }

  try {
    const stmt = db.prepare(query).bind(...params)
    const { results } = await stmt.all()
    return results || []
  } catch (error) {
    console.error("❌ SQL Select Error:", error)
    throw error // Re-throw to be caught by route handler
  }
}

// ৩. ডাটা লিখার জন্য (INSERT, UPDATE, DELETE)
export async function executeMutation(query: string, params: any[] = []) {
  const db = getDB()
  if (!db) {
    console.error("❌ Database instance is null in executeMutation")
    return 0
  }

  try {
    console.log("📝 Executing SQL:", query)
    console.log("👉 Params:", params)

    const stmt = db.prepare(query).bind(...params)
    const info = await stmt.run()

    // Cloudflare D1 meta parsing logic
    let changes = 0
    if (info && typeof info === 'object') {
      if (info.meta && typeof info.meta.changes === 'number') {
        changes = info.meta.changes
      } else if (typeof (info as any).changes === 'number') {
        changes = (info as any).changes
      } else if (info.success) {
        // যদি changes না পাওয়া যায় কিন্তু success true হয়, তবে অন্তত ১ ধরুন (INSERT এর ক্ষেত্রে)
        changes = 1
      }
    }

    console.log("✅ Success! Interpretated changes:", changes)
    return changes
  } catch (error) {
    console.error("❌ SQL Mutation Error:", error)
    return 0
  }
}