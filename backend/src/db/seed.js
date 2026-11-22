const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function runSeed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/uok_bvms';
  const pool = new Pool({ connectionString });

  try {
    console.log('Connecting to PostgreSQL:', connectionString.replace(/:[^:@]+@/, ':****@'));
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);

    // Trigger initDatabase logic
    const db = require('./index');
    await db.initDatabase();
    console.log('✅ University of Kigali PostgreSQL database seeded successfully!');
  } catch (err) {
    console.error('❌ Failed to seed PostgreSQL database:', err.message);
    console.log('Tip: Make sure your PostgreSQL database "uok_bvms" exists and DATABASE_URL in .env has the right password.');
  } finally {
    await pool.end();
  }
}

runSeed();
