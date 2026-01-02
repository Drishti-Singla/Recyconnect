#!/usr/bin/env node

/**
 * Script to create an admin user
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('🔐 Create Admin User\n');

    // Use fixed admin credentials
    const username = 'admin';
    const email = 'admin@chitkara.edu.in';
    const password = 'admin@chitkara.edu.in';
    const phone = '';

    console.log('Creating admin with credentials:');
    console.log('Email: admin@chitkara.edu.in');
    console.log('Password: admin@chitkara.edu.in\n');

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('\n⚠️  Admin user already exists. Updating password...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update password
      await db.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );
      
      console.log('✅ Admin password updated successfully!');
      rl.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin user
    const result = await db.query(
      `INSERT INTO users (username, email, password, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword, phone || null, 'admin']
    );

    console.log('\n✅ Admin user created successfully!');
    console.log('\nUser details:');
    console.log(result.rows[0]);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
