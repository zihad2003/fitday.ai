const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'local-db', 'fitday.db');
const db = new Database(dbPath);

function seed() {
    console.log('Seeding database...');

    // Ensure tables exist
    db.exec(`
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

      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        name TEXT NOT NULL,
        meal_type TEXT,
        calories REAL DEFAULT 0,
        protein REAL DEFAULT 0,
        carbs REAL DEFAULT 0,
        fats REAL DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        is_custom BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 1. Clear existing data
    db.prepare('DELETE FROM workout_plans').run();
    db.prepare('DELETE FROM exercise_library').run();
    db.prepare('DELETE FROM meals').run();

    // 2. Seed Library
    const exercises = [
        ['Push-ups', 'chest', 'bodyweight', 'beginner', 'https://gymvisual.com/img/p/1/7/5/5/2/17552.gif'],
        ['Bodyweight Squats', 'legs', 'bodyweight', 'beginner', 'https://gymvisual.com/img/p/2/1/7/4/1/21741.gif'],
        ['Plank', 'core', 'bodyweight', 'beginner', 'https://gymvisual.com/img/p/1/0/5/2/6/10526.gif'],
        ['Barbell Bench Press', 'chest', 'barbell', 'intermediate', 'https://gymvisual.com/img/p/4/8/1/1/4811.gif'],
        ['Deadlifts', 'back', 'barbell', 'advanced', 'https://gymvisual.com/img/p/8/2/1/1/8211.gif']
    ];

    const insertEx = db.prepare('INSERT INTO exercise_library (name, muscle_group, equipment_needed, difficulty, gif_url) VALUES (?, ?, ?, ?, ?)');
    for (const ex of exercises) {
        try { insertEx.run(...ex); } catch (e) { console.warn('Skipping duplicate exercise:', ex[0]); }
    }

    // 3. User setup (ensure user 1 exists)
    const user = db.prepare('SELECT id FROM users LIMIT 1').get();
    if (!user) {
        console.error('No user found! Please register first.');
        return;
    }
    const userId = user.id;

    // 4. Seed Workouts for Today
    const exIds = db.prepare('SELECT id FROM exercise_library').all();
    const insertWp = db.prepare('INSERT INTO workout_plans (user_id, date, exercise_id, sets, reps, order_index) VALUES (?, date(\'now\'), ?, ?, ?, ?)');
    insertWp.run(userId, exIds[0].id, 3, '15', 1);
    insertWp.run(userId, exIds[1].id, 4, '20', 2);
    insertWp.run(userId, exIds[2].id, 3, '60s', 3);

    // 5. Seed some Meals for Today
    const insertMeal = db.prepare('INSERT INTO meals (user_id, date, name, meal_type, calories, protein, carbs, fats, completed) VALUES (?, date(\'now\'), ?, ?, ?, ?, ?, ?, ?)');
    insertMeal.run(userId, 'Oatmeal with Blueberries', 'breakfast', 350, 10, 45, 5, 1);
    insertMeal.run(userId, 'Grilled Chicken Salad', 'lunch', 550, 45, 20, 15, 0);

    console.log('Database seeded successfully for user ID:', userId);
}

seed();
