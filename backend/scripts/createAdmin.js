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

    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const phone = await question('Phone (optional): ');

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('\n❌ User with this email or username already exists!');
      rl.close();
      process.exit(1);
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
