// lib/database.ts - Unified Database Interface (Clean & Simple)

/**
 * UNIFIED DATABASE INTERFACE
 * 
 * This module provides a single, consistent interface for database operations.
 * It automatically uses:
 * - Local SQLite in development (npm run dev)
 * - Cloudflare D1 in production (deployed)
 * 
 * No configuration needed - it just works!
 */

import { getRequestContext } from '@cloudflare/next-on-pages'
import { QueryResult, MutationResult, User } from '@/lib/types'

// Local SQLite support (development only)
let localDB: any = null

function getLocalDB() {
    if (localDB) return localDB

    try {
        const Database = require('better-sqlite3')
        const path = require('path')
        const fs = require('fs')

        const dbDir = path.join(process.cwd(), 'local-db')
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true })
        }

        const dbPath = path.join(dbDir, 'fitday.db')
        localDB = new Database(dbPath)
        localDB.pragma('journal_mode = WAL')

        console.log('✅ [Database] Connected to local SQLite:', dbPath)
        initializeLocalSchema(localDB)

        return localDB
    } catch (error) {
        console.error('❌ [Database] Failed to initialize local SQLite:', error)
        return null
    }
}

function initializeLocalSchema(db: any) {
    console.log('📝 [Database] Synchronizing schema...')

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Profile
        age INTEGER,
        gender TEXT,
        height REAL,
        weight REAL,
        target_weight REAL,
        
        -- Goals
        primary_goal TEXT,
        activity_level TEXT,
        workout_days_per_week INTEGER DEFAULT 3,
        
        -- Nutrition
        daily_calorie_goal INTEGER,
        daily_protein_goal INTEGER,
        daily_carbs_goal INTEGER,
        daily_fats_goal INTEGER,
        daily_water_goal INTEGER DEFAULT 2000,
        
        -- Schedule
        wake_time TEXT,
        sleep_time TEXT
      );

      CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        food_id INTEGER,
        name TEXT, -- For custom meals
        calories REAL,
        protein REAL,
        carbs REAL,
        fats REAL,
        quantity REAL DEFAULT 1,
        completed BOOLEAN DEFAULT 0,
        is_custom BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        exercise_name TEXT NOT NULL,
        sets INTEGER DEFAULT 3,
        reps TEXT,
        weight REAL DEFAULT 0,
        duration INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        weight_kg REAL,
        calories_consumed INTEGER DEFAULT 0,
        water_liters REAL DEFAULT 0,
        sleep_hours REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS exercise_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        muscle_group TEXT NOT NULL,
        equipment_needed TEXT,
        difficulty TEXT,
        safety_instruction TEXT,
        gif_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS workout_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER DEFAULT 3,
        reps TEXT,
        weight REAL DEFAULT 0,
        duration INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        is_generated BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercise_library(id) ON DELETE CASCADE
      );

      -- Views for Dashboard
      CREATE VIEW IF NOT EXISTS daily_nutrition_summary AS
      SELECT 
        user_id,
        date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fats) as total_fat,
        COUNT(*) as total_meals
      FROM meals
      GROUP BY user_id, date;

      CREATE VIEW IF NOT EXISTS daily_workout_summary AS
      SELECT 
        user_id,
        date,
        COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_workouts,
        COUNT(*) as total_workouts
      FROM workout_plans
      GROUP BY user_id, date;

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_workout_plans_user_date ON workout_plans(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_progress_user_date ON user_progress(user_id, date);
    `)

    console.log('✅ [Database] Schema synchronized')
}

// Get D1 database (production)
function getD1DB() {
    try {
        const envDB = (process.env as any).FITNESS_DB
        if (envDB) return envDB

        const ctx = getRequestContext() as any
        if (ctx?.env?.FITNESS_DB) {
            return ctx.env.FITNESS_DB
        }

        return null
    } catch (error) {
        return null
    }
}

/**
 * Execute SELECT query
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    try {
        // Try D1 first (production)
        const d1 = getD1DB()
        if (d1) {
            console.log('🌐 [Database] Using Cloudflare D1')
            const stmt = d1.prepare(sql).bind(...params)
            const { results } = await stmt.all()
            return { success: true, data: (results || []) as T[] }
        }

        // Fallback to local SQLite (development)
        if (process.env.NODE_ENV !== 'production') {
            const db = getLocalDB()
            if (db) {
                console.log('💾 [Database] Using local SQLite')
                const stmt = db.prepare(sql)
                const results = stmt.all(...params)
                return { success: true, data: (results || []) as T[] }
            }
        }

        return {
            success: false,
            error: 'No database available. Please check configuration.'
        }
    } catch (error: any) {
        console.error('❌ [Database] Query error:', error)
        return {
            success: false,
            error: error.message || 'Database query failed'
        }
    }
}

/**
 * Execute INSERT/UPDATE/DELETE query
 */
export async function mutate(sql: string, params: any[] = []): Promise<MutationResult> {
    try {
        // Try D1 first (production)
        const d1 = getD1DB()
        if (d1) {
            console.log('🌐 [Database] Using Cloudflare D1')
            const stmt = d1.prepare(sql).bind(...params)
            const info = await stmt.run()
            return {
                success: info.success || false,
                changes: info.meta?.changes || 0,
                lastId: info.meta?.last_row_id
            }
        }

        // Fallback to local SQLite (development)
        if (process.env.NODE_ENV !== 'production') {
            const db = getLocalDB()
            if (db) {
                console.log('💾 [Database] Using local SQLite')
                const stmt = db.prepare(sql)
                const info = stmt.run(...params)
                return {
                    success: true,
                    changes: info.changes,
                    lastId: info.lastInsertRowid
                }
            }
        }

        return {
            success: false,
            error: 'No database available. Please check configuration.'
        }
    } catch (error: any) {
        console.error('❌ [Database] Mutation error:', error)
        return {
            success: false,
            error: error.message || 'Database mutation failed'
        }
    }
}

/**
 * Helper: Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE email = ?', [email])
    if (result.success && result.data && result.data.length > 0) {
        return result.data[0]
    }
    return null
}

/**
 * Helper: Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
    const result = await query<User>('SELECT * FROM users WHERE id = ?', [id])
    if (result.success && result.data && result.data.length > 0) {
        return result.data[0]
    }
    return null
}

/**
 * Helper: Create user
 */
export async function createUser(userData: User & { password_hash: string }) {
    const sql = `
    INSERT INTO users (
      email, password_hash, name, age, gender, height, weight,
      primary_goal, activity_level, daily_calorie_goal,
      daily_protein_goal, daily_carbs_goal, daily_fats_goal
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

    const params = [
        userData.email,
        userData.password_hash,
        userData.name,
        userData.age || null,
        userData.gender || null,
        userData.height || null,
        userData.weight || null,
        userData.primary_goal || null,
        userData.activity_level || null,
        userData.daily_calorie_goal || null,
        userData.daily_protein_goal || null,
        userData.daily_carbs_goal || null,
        userData.daily_fats_goal || null
    ]

    return await mutate(sql, params)
}
