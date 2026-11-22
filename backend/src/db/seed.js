const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { getInitialSeedQueries } = require('./index');

async function runSeed() {
  const cliPassword = process.argv[2];
  let connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/uok_bvms';

  if (cliPassword) {
    connectionString = `postgresql://postgres:${encodeURIComponent(cliPassword)}@localhost:5432/uok_bvms`;
  }

  const adminUrl = connectionString.replace(/\/([^/?]+)(\?.*)?$/, '/postgres$2');

  try {
    console.log('1️⃣ Connecting to PostgreSQL server:', adminUrl.replace(/:[^:@]+@/, ':****@'));
    const adminPool = new Pool({ connectionString: adminUrl });
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'uok_bvms'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('2️⃣ Creating database "uok_bvms"...');
      await adminPool.query('CREATE DATABASE uok_bvms');
      console.log('✅ Database "uok_bvms" created!');
    } else {
      console.log('2️⃣ Database "uok_bvms" already exists.');
    }
    await adminPool.end();

    const pool = new Pool({ connectionString });
    console.log('3️⃣ Creating tables from schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);

    console.log('4️⃣ Seeding University of Kigali (UoK) data...');
    const seedSql = await getInitialSeedQueries();
    await pool.query(seedSql);
    await pool.end();

    // If user passed their password via CLI, save it to backend/.env automatically
    if (cliPassword) {
      const envPath = path.join(__dirname, '../../.env');
      if (fs.existsSync(envPath)) {
        const envText = fs.readFileSync(envPath, 'utf8');
        const updatedEnv = envText.replace(
          /^DATABASE_URL=.*$/m,
          `DATABASE_URL=${connectionString}`
        );
        fs.writeFileSync(envPath, updatedEnv, 'utf8');
        console.log('5️⃣ Updated DATABASE_URL in backend/.env with your PostgreSQL password.');
      }
    }

    console.log('====================================================================');
    console.log('🎉 SUCCESS! "uok_bvms" is ready. Refresh Databases in pgAdmin 4 to view all 9 tables!');
    console.log('====================================================================');
  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL database:', err.message);
    console.log('Usage: node src/db/seed.js YOUR_POSTGRES_PASSWORD');
    process.exit(1);
  }
}

runSeed();
