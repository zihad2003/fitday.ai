// lib/d1.ts - Correct Database Connection
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

// 1. ডাটাবেস কানেকশন পাওয়ার হেল্পার ফাংশন
function getDB() {
  try {
    // ডেভেলপমেন্ট মোডে (npm run dev)
    if (process.env.DB) {
      return process.env.DB
    }
    // প্রোডাকশন মোডে (Cloudflare Pages)
    const ctx = getRequestContext()
    // টাইপস্ক্রিপ্ট এরর এড়ানোর জন্য 'as any' ব্যবহার করা হলো
    return (ctx.env as any).DB
  } catch (e) {
    console.error("❌ Database binding error. Ensure you are running 'npm run pages:dev'")
    return null
  }
}

// 2. ডাটা পড়ার জন্য (SELECT)
export async function selectQuery(query: string, params: any[] = []) {
  const db = getDB()
  if (!db) return []

  try {
    const stmt = db.prepare(query).bind(...params)
    const { results } = await stmt.all()
    return results || []
  } catch (error) {
    console.error("❌ SQL Select Error:", error)
    return []
  }
}

// 3. ডাটা লিখার জন্য (INSERT, UPDATE, DELETE)
export async function executeMutation(query: string, params: any[] = []) {
  const db = getDB()
  if (!db) {
    console.error("❌ Database not found!")
    return 0
  }

  try {
    // ডিবাগিং লগ
    console.log("📝 Executing SQL:", query) 
    console.log("👉 Params:", params)       

    const stmt = db.prepare(query).bind(...params)
    const info = await stmt.run()
    
    console.log("✅ Success! Rows changed:", info.meta.changes)
    return info.meta.changes || 0
  } catch (error) {
    console.error("❌ SQL Mutation Error:", error)
    return 0
  }
}