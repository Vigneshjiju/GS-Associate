require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  console.log('Connecting to database...');
  
  const connectionString = process.env.DATABASE_URL;
  let pool;
  
  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Password123'
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert admin user
    const res = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id",
      ['GS Admin', 'admin@gsassociates.com', hashedPassword, 'admin']
    );

    if (res.rows.length > 0) {
      console.log('Admin user successfully created!');
      console.log('Email: admin@gsassociates.com');
      console.log('Password: admin123');
    } else {
      // If user already exists, update their password and role to ensure they can login
      await pool.query(
        "UPDATE users SET password = $1, role = $2 WHERE email = $3",
        [hashedPassword, 'admin', 'admin@gsassociates.com']
      );
      console.log('Admin user already existed. Password updated to: admin123');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
