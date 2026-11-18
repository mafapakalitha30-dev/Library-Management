const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
  dateStrings: ['DATE'],
});

// Create tables and a default admin account the first time the server starts.
async function initDb() {
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    // Add due_date to databases created before this column existed.
  const [cols] = await pool.query(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'due_date'"
  );
  if (cols.length === 0) {
    await pool.query('ALTER TABLE transactions ADD COLUMN due_date DATE NULL AFTER notes');
  }
  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (count === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      ['Library Admin', 'ADMIN001', 'admin', hash]
    );
    console.log('Seeded default admin -> ADMIN001 / admin123 (change this!)');
  }
}

module.exports = { pool, initDb };
