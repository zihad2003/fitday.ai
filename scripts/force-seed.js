const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
// Ensure dir exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Check for existing hash or use specific one
let dbName = '893b318a4110c8998585437d673ac659f3ce99cdebacfaf9117b1b480495c455.sqlite';
const files = fs.readdirSync(dbDir);
const walFile = files.find(f => f.endsWith('.sqlite-wal'));
if (walFile) {
    dbName = walFile.replace('.sqlite-wal', '.sqlite');
} else {
    // If no WAL, maybe look for existing .sqlite
    const existingSqlite = files.find(f => f.endsWith('.sqlite'));
    if (existingSqlite) {
        dbName = existingSqlite;
    }
}

const dbPath = path.join(dbDir, dbName);
console.log(`Using DB: ${dbPath}`);

const db = new Database(dbPath);

const subscription = `
ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN ai_credits INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN subscription_end_date DATETIME;
`;

try {
    console.log('Applying Subscription Updates...');
    try {
        db.exec(subscription);
        console.log('Subscription updates applied.');
    } catch (e) {
        console.log('Subscription update failed (columns likely exist):', e.message);
    }

} catch (error) {
    console.error('Error:', error);
}

db.close();
