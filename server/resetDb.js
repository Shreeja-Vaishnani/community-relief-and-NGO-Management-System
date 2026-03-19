const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = [
  { name: 'Admin User',      email: 'shreeja@relief.org', password: 'shreeja',  role: 'admin',     phone: null },
  { name: 'Alice Volunteer', email: 'alice@relief.org',   password: 'alice123', role: 'volunteer', phone: '9000000001' },
  { name: 'Bob Volunteer',   email: 'bob@relief.org',     password: 'bob123',   role: 'volunteer', phone: '9000000002' },
  { name: 'Carol Volunteer', email: 'carol@relief.org',   password: 'carol123', role: 'volunteer', phone: '9000000003' },
];

async function runSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await connection.query('DROP DATABASE IF EXISTS community_relief');
  await connection.query('CREATE DATABASE community_relief');
  await connection.query('USE community_relief');

  await connection.query(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','volunteer','donor','beneficiary') NOT NULL DEFAULT 'donor',
      phone VARCHAR(20),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  await connection.query(`
    CREATE TABLE donations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type ENUM('money','food','clothes','medicine','other') DEFAULT 'money',
      description TEXT,
      status ENUM('pending','received','distributed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

  await connection.query(`
    CREATE TABLE relief_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      beneficiary_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category ENUM('food','shelter','medical','education','clothing','other') DEFAULT 'other',
      urgency ENUM('low','medium','high','critical') DEFAULT 'medium',
      status ENUM('pending','approved','in_progress','fulfilled','rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beneficiary_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

  await connection.query(`
    CREATE TABLE volunteer_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      volunteer_id INT,
      assigned_by INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      location VARCHAR(200),
      due_date DATE,
      status ENUM('open','assigned','in_progress','completed','cancelled') DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
    )`);

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await connection.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [u.name, u.email, hash, u.role, u.phone]
    );
  }

  console.log('Database reset successfully with hashed passwords!');
  await connection.end();
}

runSchema().catch(console.error);
