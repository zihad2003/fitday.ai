const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Password hashing function matching the auth.ts logic
async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const pepper = process.env.APP_SECRET || "";

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password + pepper),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function generateSalt() {
    return crypto.randomUUID();
}

async function main() {
    const dbDir = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
    const files = fs.readdirSync(dbDir);
    const walFile = files.find(f => f.endsWith('.sqlite-wal'));
    let dbName = '893b318a4110c8998585437d673ac659f3ce99cdebacfaf9117b1b480495c455.sqlite';
    if (walFile) {
        dbName = walFile.replace('.sqlite-wal', '.sqlite');
    } else {
        const existingSqlite = files.find(f => f.endsWith('.sqlite'));
        if (existingSqlite) dbName = existingSqlite;
    }

    const dbPath = path.join(dbDir, dbName);
    console.log(`Using DB: ${dbPath}`);

    const db = new Database(dbPath);

    // Generate salt and hash password
    const password = '123123';
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const storedPassword = `${salt}:${hash}`;

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('zihadlaptopasus@gmail.com');

    if (existing) {
        console.log('User already exists. Updating password and plan...');
        db.prepare(`
            UPDATE users 
            SET plan_type = 'free', 
                ai_credits = 3, 
                subscription_end_date = NULL,
                password = ?
            WHERE email = ?
        `).run(storedPassword, 'zihadlaptopasus@gmail.com');
        console.log('✅ User updated to Free Plan!');
    } else {
        console.log('Creating new user with Free Plan...');
        db.prepare(`
            INSERT INTO users (
                email, password, name, age, gender, height_cm, weight_kg, 
                goal, activity_level, target_calories, bmr, tdee,
                plan_type, ai_credits, subscription_end_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            'zihadlaptopasus@gmail.com',
            storedPassword,
            'Zihad',
            25,
            'male',
            175,
            70,
            'gain_muscle',
            'moderate',
            2500,
            1680,
            2520,
            'free',
            3,
            null
        );
        console.log('✅ User created with Free Plan!');
    }

    const user = db.prepare('SELECT id, email, name, plan_type, ai_credits FROM users WHERE email = ?').get('zihadlaptopasus@gmail.com');
    console.log('\n📧 Login Credentials:');
    console.log('Email:', user.email);
    console.log('Password: 123123');
    console.log('Plan:', user.plan_type);
    console.log('AI Credits:', user.ai_credits);
    console.log('\n🚀 You can now login at: http://localhost:3000/login');

    db.close();
}

main().catch(console.error);
