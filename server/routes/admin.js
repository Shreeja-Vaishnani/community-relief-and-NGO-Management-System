const router = require('express').Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('admin'));

// Dashboard stats
router.get('/stats', async (req, res) => {
  const [[{ users }]] = await db.query('SELECT COUNT(*) as users FROM users');
  const [[{ donations }]] = await db.query('SELECT COALESCE(SUM(amount),0) as donations FROM donations WHERE type="money"');
  const [[{ requests }]] = await db.query('SELECT COUNT(*) as requests FROM relief_requests WHERE status="pending"');
  const [[{ tasks }]] = await db.query('SELECT COUNT(*) as tasks FROM volunteer_tasks WHERE status="open"');
  res.json({ users, donations, pendingRequests: requests, openTasks: tasks });
});

// All users
router.get('/users', async (req, res) => {
  const [rows] = await db.query('SELECT id,name,email,role,phone,created_at FROM users ORDER BY created_at DESC');
  res.json(rows);
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  await db.query('UPDATE users SET role=? WHERE id=?', [req.body.role, req.params.id]);
  res.json({ message: 'Role updated' });
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

module.exports = router;