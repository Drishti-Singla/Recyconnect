const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const databaseDir = path.join(__dirname, 'database');
    
    // List of migration files to run in order
    const migrations = [
      'add_anonymity_to_donated_items.sql',
      'add_quantity_to_donated_items.sql'
    ];
    
    console.log('🚀 Starting database migrations...\n');
    
    for (const migrationFile of migrations) {
      const sqlPath = path.join(databaseDir, migrationFile);
      
      if (!fs.existsSync(sqlPath)) {
        console.log(`⚠️  Skipping ${migrationFile} - file not found`);
        continue;
      }
      
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log(`📄 Running migration: ${migrationFile}`);
      await db.query(sql);
      console.log(`✅ Completed: ${migrationFile}\n`);
    }
    
    console.log('✨ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

runMigration();
