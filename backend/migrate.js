const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'database', 'add_college_code.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration: add_college_code.sql');
    await db.query(sql);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
