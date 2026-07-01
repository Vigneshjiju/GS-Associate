const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pgPool = null;

async function initDatabase() {
  try {
    pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Password123',
      connectionTimeoutMillis: 5000 // fail fast if can't connect
    });
    
    // Test connection
    const client = await pgPool.connect();
    client.release();
    console.log('Successfully connected to PostgreSQL database!');
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  }

  // Run migrations
  await runMigrations();
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../database/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.warn('Migrations directory not found, skipping migrations.');
    return;
  }

  // Read migrations in order
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migrations to process.`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    // PostgreSQL execution
    try {
      await pgPool.query(sql);
      console.log(`PostgreSQL migration applied: ${file}`);
    } catch (err) {
      console.warn(`PostgreSQL migration status for ${file}:`, err.message);
    }
  }

  // Seed data
  await runSeeds();
}

async function runSeeds() {
  const seedPath = path.join(__dirname, '../database/seeds/seed_data.sql');
  if (!fs.existsSync(seedPath)) {
    console.warn('Seed data file not found, skipping seeding.');
    return;
  }

  // Check if already seeded (e.g. if users table has records)
  try {
    const res = await query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(res.rows[0]?.count || 0);
    if (count > 0) {
      console.log('Database already seeded, skipping seed execution.');
      return;
    }
  } catch (err) {
    // Tables might not exist or be empty
  }

  const sql = fs.readFileSync(seedPath, 'utf8');
  try {
    await pgPool.query(sql);
    console.log('PostgreSQL database seed data applied successfully.');
  } catch (err) {
    console.error('Error seeding PostgreSQL database:', err.message);
  }
}

async function query(text, params = []) {
  if (!pgPool) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return pgPool.query(text, params);
}

module.exports = {
  initDatabase,
  query,
  isSqlite: () => false
};
