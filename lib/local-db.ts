// lib/local-db.ts - Local SQLite Database for Development
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

let db: Database.Database | null = null

/**
 * Get or create local SQLite database
 */
export function getLocalDB(): Database.Database {
    if (db) return db

    // Create db directory if it doesn't exist
    const dbDir = path.join(process.cwd(), 'local-db')
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
    }

    const dbPath = path.join(dbDir, 'fitday-local.db')
    console.log('[LocalDB] Connecting to:', dbPath)

    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')

    // Initialize schema if needed
    initializeSchema(db)

    return db
}

/**
 * Initialize database schema
 */
function initializeSchema(database: Database.Database) {
    // Check if users table exists
    const tableExists = database
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        .get()

    if (!tableExists) {
        console.log('[LocalDB] Creating schema...')

        // Create users table
        database.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Fitness Profile
        age INTEGER,
        gender TEXT CHECK(gender IN ('male', 'female', 'other')),
        weight REAL,
        height REAL,
        target_weight REAL,
        
        -- Goals & Preferences
        primary_goal TEXT CHECK(primary_goal IN ('muscle_building', 'fat_loss', 'maintenance', 'endurance', 'strength', 'lose_weight', 'gain_muscle', 'maintain')),
        activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
        workout_days_per_week INTEGER DEFAULT 3,
        preferred_workout_time TEXT CHECK(preferred_workout_time IN ('morning', 'afternoon', 'evening')),
        
        -- Nutrition
        dietary_preference TEXT,
        allergies TEXT,
        daily_calorie_goal INTEGER,
        daily_protein_goal INTEGER,
        daily_carbs_goal INTEGER,
        daily_fats_goal INTEGER,
        daily_water_goal INTEGER DEFAULT 8,
        
        -- Schedule
        wake_time TEXT,
        sleep_time TEXT,
        
        -- Settings
        notification_enabled INTEGER DEFAULT 1,
        metric_system INTEGER DEFAULT 1
      );

      CREATE INDEX idx_users_email ON users(email);
    `)

        console.log('[LocalDB] Schema created successfully')
    }
}

/**
 * Execute SELECT query (compatible with D1 API)
 */
export function localSelectQuery(query: string, params: any[] = []): any[] {
    try {
        const database = getLocalDB()
        const stmt = database.prepare(query)
        const results = stmt.all(...params)
        console.log(`[LocalDB] SELECT query executed: ${results.length} rows`)
        return results
    } catch (error) {
        console.error('[LocalDB] SELECT error:', error)
        return []
    }
}

/**
 * Execute INSERT/UPDATE/DELETE query (compatible with D1 API)
 */
export function localExecuteMutation(query: string, params: any[] = []): number {
    try {
        const database = getLocalDB()
        const stmt = database.prepare(query)
        const result = stmt.run(...params)
        console.log(`[LocalDB] Mutation executed: ${result.changes} changes`)
        return result.changes
    } catch (error) {
        console.error('[LocalDB] Mutation error:', error)
        return 0
    }
}

/**
 * Close database connection
 */
export function closeLocalDB() {
    if (db) {
        db.close()
        db = null
        console.log('[LocalDB] Connection closed')
    }
}
