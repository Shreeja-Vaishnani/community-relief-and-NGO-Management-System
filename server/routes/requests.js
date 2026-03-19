const router = require('express').Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  const { role, id } = req.user;
  const [rows] = role === 'beneficiary'
    ? await db.query('SELECT * FROM relief_requests WHERE beneficiary_id=? ORDER BY created_at DESC', [id])
    : await db.query('SELECT r.*,u.name as beneficiary_name FROM relief_requests r JOIN users u ON r.beneficiary_id=u.id ORDER BY r.created_at DESC');
  res.json(rows);
});

router.post('/', requireRole('beneficiary'), async (req, res) => {
  const { title, description, category, urgency } = req.body;
  const [result] = await db.query(
    'INSERT INTO relief_requests (beneficiary_id,title,description,category,urgency) VALUES (?,?,?,?,?)',
    [req.user.id, title, description, category, urgency]
  );
  res.status(201).json({ id: result.insertId, message: 'Request submitted' });
});

router.put('/:id/status', requireRole('admin'), async (req, res) => {
  await db.query('UPDATE relief_requests SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ message: 'Status updated' });
});

module.exports = router;
