const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'gs_associates_secret_key_12345';

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  try {
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'staff']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ error: 'Server error fetching user details' });
  }
};

exports.resetDb = async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE users, event_types, packages, package_addons, ceremonies RESTART IDENTITY CASCADE;');
    
    // Instead of restarting, let's run the seed script directly to catch the error
    const fs = require('fs');
    const path = require('path');
    const seedPath = path.join(__dirname, '../database/seeds/seed_data.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    
    try {
      await db.query(sql);
      res.json({ message: 'Users cleared and seed_data.sql executed perfectly!' });
    } catch (err) {
      res.status(500).json({ error: 'seed_data.sql crashed!', details: err.message, stack: err.stack });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.seedAdmin = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Ensure table exists (though migrations should have created it)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Try to insert admin user
    const insertResult = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id",
      ['GS Admin', 'admin@gsassociates.com', hashedPassword, 'admin']
    );

    if (insertResult.rows.length > 0) {
      return res.json({ message: 'Admin user successfully created! You can now log in with email admin@gsassociates.com and password admin123.' });
    }

    // If already exists, update it to make sure it works
    await db.query(
      "UPDATE users SET password = $1, role = $2 WHERE email = $3",
      [hashedPassword, 'admin', 'admin@gsassociates.com']
    );

    res.json({ message: 'Admin user already existed. Password has been reset/updated to admin123 successfully!' });
  } catch (error) {
    console.error('Seeding admin user failed:', error.message);
    res.status(500).json({ error: 'Failed to seed admin user: ' + error.message });
  }
};

