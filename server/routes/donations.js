const router = require('express').Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Get donations (admin sees all, donor sees own)
router.get('/', async (req, res) => {
  const { role, id } = req.user;
  const [rows] = role === 'admin'
    ? await db.query('SELECT d.*,u.name as donor_name FROM donations d JOIN users u ON d.donor_id=u.id ORDER BY d.created_at DESC')
    : await db.query('SELECT * FROM donations WHERE donor_id=? ORDER BY created_at DESC', [id]);
  res.json(rows);
});

// Create donation (donor only)
router.post('/', requireRole('donor', 'admin'), async (req, res) => {
  const { amount, type, description } = req.body;
  const donor_id = req.user.role === 'admin' ? req.body.donor_id : req.user.id;
  const [result] = await db.query(
    'INSERT INTO donations (donor_id,amount,type,description) VALUES (?,?,?,?)',
    [donor_id, amount, type, description]
  );
  res.status(201).json({ id: result.insertId, message: 'Donation recorded' });
});

// Update status (admin only)
router.put('/:id/status', requireRole('admin'), async (req, res) => {
  await db.query('UPDATE donations SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ message: 'Status updated' });
});

module.exports = router;
