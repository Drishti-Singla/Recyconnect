const { Client } = require('pg');

async function runProductionMigration() {
  const connectionString = "postgresql://neondb_owner:npg_eXtgr92pQIUC@ep-restless-shadow-ah42u7cu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Migration 1: Add anonymity column
    console.log('📄 Running: add_anonymity_to_donated_items');
    await client.query(`
      ALTER TABLE donated_items 
      ADD COLUMN IF NOT EXISTS anonymity VARCHAR(20) DEFAULT 'public' 
      CHECK (anonymity IN ('public', 'anonymous', 'partial'))
    `);
    console.log('✅ Completed: add_anonymity_to_donated_items\n');

    // Migration 2: Add quantity column
    console.log('📄 Running: add_quantity_to_donated_items');
    await client.query(`
      ALTER TABLE donated_items 
      ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 CHECK (quantity > 0)
    `);
    console.log('✅ Completed: add_quantity_to_donated_items\n');

    // Migration 3: Add marketplace fields to items table
    console.log('📄 Running: add_marketplace_fields');
    await client.query(`
      ALTER TABLE items 
      ADD COLUMN IF NOT EXISTS asking_price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS condition VARCHAR(20) CHECK (condition IN ('new', 'like new', 'good', 'fair', 'poor'))
    `);
    console.log('✅ Completed: add_marketplace_fields\n');

    console.log('✨ All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runProductionMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
