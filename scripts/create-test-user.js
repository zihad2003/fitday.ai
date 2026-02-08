// scripts/create-test-user.js - Create test user directly in database
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Password hashing function (matches lib/auth.ts)
async function hashPassword(password, salt) {
    const pepper = process.env.APP_SECRET || "";

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password + pepper),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt),
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

async function createTestUser() {
    try {
        // Database path
        const dbDir = path.join(process.cwd(), 'local-db');
        const dbPath = path.join(dbDir, 'fitday-local.db');

        console.log('📁 Database path:', dbPath);

        // Connect to database
        const db = new Database(dbPath);
        console.log('✅ Connected to database');

        // User credentials
        const email = 'zihadlaptopasus@gmail.com';
        const password = '123123';
        const name = 'Zihad';

        // Check if user already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            console.log('⚠️  User already exists with email:', email);
            console.log('🔑 You can login with:');
            console.log('   Email:', email);
            console.log('   Password:', password);
            db.close();
            return;
        }

        // Generate password hash
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);
        const storedPassword = `${salt}:${hashedPassword}`;

        // Calculate nutrition (simple defaults)
        const age = 25;
        const gender = 'male';
        const height = 175; // cm
        const weight = 70; // kg
        const activity_level = 'moderate';
        const primary_goal = 'maintain';

        // Simple BMR calculation (Mifflin-St Jeor)
        const bmr = gender === 'male'
            ? (10 * weight) + (6.25 * height) - (5 * age) + 5
            : (10 * weight) + (6.25 * height) - (5 * age) - 161;

        // Activity multiplier
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        };
        const tdee = Math.round(bmr * activityMultipliers[activity_level]);

        // Macros (simple 40/30/30 split)
        const daily_calorie_goal = tdee;
        const daily_protein_goal = Math.round((tdee * 0.3) / 4); // 30% protein, 4 cal/g
        const daily_carbs_goal = Math.round((tdee * 0.4) / 4); // 40% carbs, 4 cal/g
        const daily_fats_goal = Math.round((tdee * 0.3) / 9); // 30% fats, 9 cal/g

        // Insert user
        const stmt = db.prepare(`
      INSERT INTO users (
        email, password_hash, name, gender, age, height, weight,
        activity_level, primary_goal, daily_calorie_goal,
        daily_protein_goal, daily_carbs_goal, daily_fats_goal,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

        const result = stmt.run(
            email,
            storedPassword,
            name,
            gender,
            age,
            height,
            weight,
            activity_level,
            primary_goal,
            daily_calorie_goal,
            daily_protein_goal,
            daily_carbs_goal,
            daily_fats_goal
        );

        console.log('✅ Test user created successfully!');
        console.log('');
        console.log('🔑 Login Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('');
        console.log('📊 User Profile:');
        console.log('   Name:', name);
        console.log('   Age:', age);
        console.log('   Gender:', gender);
        console.log('   Height:', height, 'cm');
        console.log('   Weight:', weight, 'kg');
        console.log('   Goal:', primary_goal);
        console.log('   Activity:', activity_level);
        console.log('');
        console.log('🍽️  Nutrition Goals:');
        console.log('   Calories:', daily_calorie_goal, 'kcal/day');
        console.log('   Protein:', daily_protein_goal, 'g/day');
        console.log('   Carbs:', daily_carbs_goal, 'g/day');
        console.log('   Fats:', daily_fats_goal, 'g/day');
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('   1. Go to: http://localhost:3000/login');
        console.log('   2. Enter the credentials above');
        console.log('   3. Click "Login"');
        console.log('   4. You should be redirected to /dashboard');

        db.close();
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        process.exit(1);
    }
}

// Run the script
createTestUser().catch(console.error);
