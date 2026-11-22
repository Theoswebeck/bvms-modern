const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool = null;
let isUsingFallback = false;

async function getInitialSeedQueries() {
  const defaultHash = await bcrypt.hash('12345', 10);
  const firstLoginHash = await bcrypt.hash('uok2026', 10);

  return `
    INSERT INTO department (abbreviation, dep_name) VALUES
      ('SCIT', 'School of Computing and Information Technology'),
      ('SBM', 'School of Business Management and Economics'),
      ('SL', 'School of Law'),
      ('SE', 'School of Education');

    INSERT INTO faculity (abbreviation, fac_name, dep_id) VALUES
      ('BIT', 'BSc in Information Technology', 1),
      ('BCS', 'BSc in Computer Science', 1),
      ('BBA-FIN', 'Bachelor of Business Administration (Finance)', 2),
      ('BBA-ACC', 'Bachelor of Business Administration (Accounting)', 2),
      ('BPROC', 'Bachelor of Procurement & Supply Chain Management', 2),
      ('LLB', 'Bachelor of Laws (Honours)', 3),
      ('BED', 'Bachelor of Education', 4);

    INSERT INTO room (room, numberofstudent) VALUES
      ('Kacyiru Block A - Room 101', 30),
      ('Kacyiru Block A - Room 102', 25),
      ('Kacyiru Main Auditorium', 60),
      ('Musanze Campus - Hall B1', 20);

    INSERT INTO module (module_code, module_name, dep_id, fac_id, year) VALUES
      ('CIT3101', 'Full-Stack Web Engineering', 1, 1, 3),
      ('CIT2104', 'Database Management Systems (PostgreSQL)', 1, 1, 2),
      ('BCS3202', 'Software Engineering & Architecture', 1, 2, 3),
      ('FIN2101', 'Corporate Finance & Investment', 2, 3, 2),
      ('LLB1102', 'Constitutional & Administrative Law', 3, 6, 1),
      ('ACC3105', 'Advanced Auditing & Assurance', 2, 4, 3);

    INSERT INTO student (reg_number, firstname, lastname, email, telephone, department, options, year) VALUES
      ('UoK/2024/IT/001', 'Theophile', 'NDAYISHIMIYE', 'theophile.ndayishimiye@uok.ac.rw', '0787278180', 1, 1, 3),
      ('UoK/2024/IT/002', 'Jolly', 'UMUHOZA', 'jolly.umuhoza@uok.ac.rw', '0789777777', 1, 1, 3),
      ('UoK/2024/IT/003', 'Jamary', 'BOSENIBAMWE', 'jamary.bosenibamwe@uok.ac.rw', '0786663655', 1, 1, 3),
      ('UoK/2024/IT/004', 'David', 'DUKUZE', 'david.dukuze@uok.ac.rw', '0788878180', 1, 1, 3),
      ('UoK/2025/IT/005', 'Cynthia', 'ABAYO', 'cynthia.abayo@uok.ac.rw', '0788838180', 1, 1, 2),
      ('UoK/2025/IT/006', 'Sandrine', 'KANYANA', 'sandrine.kanyana@uok.ac.rw', '0785522222', 1, 1, 2),
      ('UoK/2024/CS/007', 'Chantal', 'KAYITESI', 'chantal.kayitesi@uok.ac.rw', '0785028180', 1, 2, 3),
      ('UoK/2025/FIN/008', 'Patrick', 'MUGISHA', 'patrick.mugisha@uok.ac.rw', '0783871180', 2, 3, 2),
      ('UoK/2025/FIN/009', 'Aline', 'UWASE', 'aline.uwase@uok.ac.rw', '0780178080', 2, 3, 2),
      ('UoK/2026/LAW/010', 'Jean Paul', 'HABIMANA', 'jeanpaul.habimana@uok.ac.rw', '0789578170', 3, 6, 1);

    INSERT INTO invigilator (firstname, lastname, email, telephone) VALUES
      ('Betty', 'UWAMBAJE', 'uwambajebetty@gmail.com', '0788922222'),
      ('Eric', 'NIYITANGA', 'eri@gmail.com', '0785363536'),
      ('Chantal', 'KAYITESI', 'chanto@gmail.com', '0786113352');

    INSERT INTO manage_invigilator (invigilator_id, room_id, exam_date) VALUES
      (1, 1, '2026-11-20'),
      (2, 2, '2026-11-20'),
      (3, 3, '2026-11-21'),
      (1, 4, '2026-11-22');

    INSERT INTO exam_plan (room_id, exam_date, module_code, reg_number, booklet_code, seat_number, exam_status, checked_in_at, submitted_at) VALUES
      (1, '2026-11-20', 'CIT3101', 'UoK/2024/IT/001', 'UOK-BK-2026-0001', 1, 'Submitted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (1, '2026-11-20', 'CIT3101', 'UoK/2024/IT/002', 'UOK-BK-2026-0002', 2, 'Present', CURRENT_TIMESTAMP, NULL),
      (1, '2026-11-20', 'CIT3101', 'UoK/2024/IT/003', 'UOK-BK-2026-0003', 3, 'Not Submitted', NULL, NULL),
      (1, '2026-11-20', 'CIT3101', 'UoK/2024/IT/004', 'UOK-BK-2026-0004', 4, 'Submitted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (2, '2026-11-20', 'CIT2104', 'UoK/2025/IT/005', 'UOK-BK-2026-0005', 1, 'Submitted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      (2, '2026-11-20', 'CIT2104', 'UoK/2025/IT/006', 'UOK-BK-2026-0006', 2, 'Not Submitted', NULL, NULL),
      (3, '2026-11-21', 'FIN2101', 'UoK/2025/FIN/008', 'UOK-BK-2026-0007', 1, 'Not Submitted', NULL, NULL),
      (3, '2026-11-21', 'FIN2101', 'UoK/2025/FIN/009', 'UOK-BK-2026-0008', 2, 'Not Submitted', NULL, NULL);

    INSERT INTO users (firstname, lastname, email, telephone, password, user_type, must_change_password) VALUES
      ('Theophile', 'NDAYISHIMIYE', 'theoswelbeck@gmail.com', '0787278180', '${defaultHash}', 'admin', FALSE),
      ('Jolly', 'UMUTESI', 'jolly@gmail.com', '0786060737', '${defaultHash}', 'examination_officer', FALSE),
      ('Betty', 'UWAMBAJE', 'uwambajebetty@gmail.com', '0788922222', '${defaultHash}', 'Invigilator', FALSE),
      ('Eric', 'NIYITANGA', 'eri@gmail.com', '0785363536', '${defaultHash}', 'Invigilator', FALSE),
      ('Chantal', 'KAYITESI', 'chanto@gmail.com', '0786113352', '${defaultHash}', 'Invigilator', FALSE),
      ('Divine', 'ABIJURU', 'divine@gmail.com', '0786789444', '${firstLoginHash}', 'Invigilator', TRUE),
      ('Director', 'Academic Services', 'das@gmail.com', '0785087999', '${defaultHash}', 'DAS', FALSE);
  `;
}

async function ensureDatabaseExists(connectionString) {
  try {
    const adminUrl = connectionString.replace(/\/([^/?]+)(\?.*)?$/, '/postgres$2');
    const dbNameMatch = connectionString.match(/\/([^/?]+)(\?.*)?$/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'uok_bvms';
    const adminPool = new Pool({ connectionString: adminUrl, connectionTimeoutMillis: 2500 });
    const checkDb = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (checkDb.rows.length === 0) {
      console.log(`🛠️ Creating PostgreSQL database "${dbName}"...`);
      await adminPool.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    }
    await adminPool.end();
  } catch (e) {
    // Let main connection attempt report the specific error
  }
}

async function initDatabase() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/uok_bvms';
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await ensureDatabaseExists(connectionString);
    const pgPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2500,
    });
    const client = await pgPool.connect();
    console.log('✅ Connected to PostgreSQL server:', connectionString.replace(/:[^:@]+@/, ':****@'));

    const checkRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS exists;
    `);

    let needsSeed = !checkRes.rows[0].exists;
    if (!needsSeed) {
      const countRes = await client.query('SELECT COUNT(*) AS count FROM users');
      if (Number(countRes.rows[0].count) === 0) {
        needsSeed = true;
      }
    }

    if (needsSeed) {
      console.log('📦 Initializing PostgreSQL schema and seeding University of Kigali data...');
      await client.query(schemaSql);
      const seedSql = await getInitialSeedQueries();
      await client.query(seedSql);
      console.log('✅ PostgreSQL schema & University of Kigali seed data created.');
    }

    client.release();
    pool = pgPool;
    isUsingFallback = false;
    return pool;
  } catch (err) {
    if (process.env.USE_IN_MEMORY_FALLBACK === 'false') {
      console.error('❌ Could not connect to PostgreSQL:', err.message);
      throw err;
    }

    console.warn(`⚠️ Local PostgreSQL connection (${err.message}) unavailable. Activating embedded pg-mem PostgreSQL engine with University of Kigali seed data...`);
    const { newDb } = require('pg-mem');
    const memDb = newDb();

    const { Pool: MemPool } = memDb.adapters.createPg();
    const memPool = new MemPool();

    await memPool.query(schemaSql);
    const seedSql = await getInitialSeedQueries();
    await memPool.query(seedSql);

    console.log('✅ Embedded PostgreSQL engine initialized & seeded with University of Kigali data.');
    pool = memPool;
    isUsingFallback = true;
    return pool;
  }
}

async function query(text, params = []) {
  const activePool = await initDatabase();
  return activePool.query(text, params);
}

function getDbStatus() {
  return {
    engine: isUsingFallback ? 'PostgreSQL (Embedded Engine)' : 'PostgreSQL (Native Server)',
    isFallback: isUsingFallback,
  };
}

module.exports = {
  initDatabase,
  query,
  getDbStatus,
  getInitialSeedQueries,
};
