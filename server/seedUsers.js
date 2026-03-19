require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  const users = [
    { name: 'Admin User',      email: 'shreeja@relief.org', password: 'shreeja',  role: 'admin',     phone: null },
    { name: 'Alice Volunteer', email: 'alice@relief.org',   password: 'alice123', role: 'volunteer', phone: '9000000001' },
    { name: 'Bob Volunteer',   email: 'bob@relief.org',     password: 'bob123',   role: 'volunteer', phone: '9000000002' },
    { name: 'Carol Volunteer', email: 'carol@relief.org',   password: 'carol123', role: 'volunteer', phone: '9000000003' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await db.query(
      'UPDATE users SET password=? WHERE email=?',
      [hash, u.email]
    );
    console.log(`Updated: ${u.email}`);
  }
  console.log('Done.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
