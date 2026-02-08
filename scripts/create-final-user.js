// scripts/create-final-user.js - Create user in the new restructured database
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('✅ Loaded .env.local');
}
// but runs in a plain Node.js environment.

async function hashPassword(password, salt) {
    const pepper = process.env.APP_SECRET || 'fitday-default-secret';
    const encoder = new TextEncoder();

    // Note: Node.js crypto module is used here to match Web Crypto API behavior
    // in a script context where crypto.subtle might not be directly globally available
    // in some node versions, but better-sqlite3 scripts usually run in Node.

    // For simplicity and matching the exact bits, we'll use a direct implementation
    // that matches the logic in auth-utils.ts

    const key = crypto.pbkdf2Sync(
        password + pepper,
        salt,
        100000,
        32,
        'sha256'
    );

    return key.toString('hex');
}

function generateSalt() {
    return crypto.randomUUID();
}

async function main() {
    try {
        const dbPath = path.join(process.cwd(), 'local-db', 'fitday.db');
        console.log('📁 Database path:', dbPath);

        const db = new Database(dbPath);
        console.log('✅ Connected to new database');

        const email = 'zihadlaptopasus@gmail.com';
        const password = '123123';
        const name = 'Zihad';

        // Ensure table exists (fail-safe)
        db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        age INTEGER,
        gender TEXT,
        height REAL,
        weight REAL,
        primary_goal TEXT,
        activity_level TEXT,
        daily_calorie_goal INTEGER,
        daily_protein_goal INTEGER,
        daily_carbs_goal INTEGER,
        daily_fats_goal INTEGER
      )
    `);

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            console.log('⚠️ User already exists, updating password...');
            const salt = generateSalt();
            const hash = await hashPassword(password, salt);
            const storedHash = `${salt}:${hash}`;
            db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(storedHash, existing.id);
        } else {
            console.log('📝 Creating new user...');
            const salt = generateSalt();
            const hash = await hashPassword(password, salt);
            const storedHash = `${salt}:${hash}`;

            db.prepare(`
        INSERT INTO users (email, password_hash, name, age, gender, height, weight, primary_goal, activity_level, daily_calorie_goal)
        VALUES (?, ?, ?, 25, 'male', 175, 70, 'maintain', 'moderate', 2500)
      `).run(email, storedHash, name);
        }

        console.log('✅ User "zihadlaptopasus@gmail.com" with password "123123" is ready in the NEW database!');
        db.close();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

main();
