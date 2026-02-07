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
    console.warn("⚠️ Database binding missing. Using local SQLite file.");

    // Use better-sqlite3 for local development
    if (typeof window === 'undefined') {
      try {
        const Database = require('better-sqlite3');
        const fs = require('fs');
        const path = require('path');

        const dbDir = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
        const files = fs.readdirSync(dbDir);
        const walFile = files.find((f: string) => f.endsWith('.sqlite-wal'));
        let dbName = '893b318a4110c8998585437d673ac659f3ce99cdebacfaf9117b1b480495c455.sqlite';
        if (walFile) {
          dbName = walFile.replace('.sqlite-wal', '.sqlite');
        } else {
          const existingSqlite = files.find((f: string) => f.endsWith('.sqlite'));
          if (existingSqlite) dbName = existingSqlite;
        }

        const dbPath = path.join(dbDir, dbName);
        const localDb = new Database(dbPath, { readonly: false });

        const stmt = localDb.prepare(query);
        const results = stmt.all(...params);
        localDb.close();

        return results;
      } catch (e) {
        console.error('Local DB error:', e);
        return [];
      }
    }

    return [];
  }

  // D1 binding is available, use it
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
    console.warn("⚠️ Database binding missing. Using local SQLite file for mutation.");

    // Use better-sqlite3 for local development
    if (typeof window === 'undefined') {
      try {
        const Database = require('better-sqlite3');
        const fs = require('fs');
        const path = require('path');

        const dbDir = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
        const files = fs.readdirSync(dbDir);
        const walFile = files.find((f: string) => f.endsWith('.sqlite-wal'));
        let dbName = '893b318a4110c8998585437d673ac659f3ce99cdebacfaf9117b1b480495c455.sqlite';
        if (walFile) {
          dbName = walFile.replace('.sqlite-wal', '.sqlite');
        } else {
          const existingSqlite = files.find((f: string) => f.endsWith('.sqlite'));
          if (existingSqlite) dbName = existingSqlite;
        }

        const dbPath = path.join(dbDir, dbName);
        const localDb = new Database(dbPath, { readonly: false });

        const stmt = localDb.prepare(query);
        const info = stmt.run(...params);
        localDb.close();

        return info.changes || 0;
      } catch (e) {
        console.error('Local DB mutation error:', e);
        return 0;
      }
    }

    return 0;
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