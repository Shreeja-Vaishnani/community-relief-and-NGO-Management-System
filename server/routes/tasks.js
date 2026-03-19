const router = require('express').Router();
const db = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  const { role, id } = req.user;
  const [rows] = role === 'volunteer'
    ? await db.query(
        'SELECT t.*,u.name as assigned_by_name FROM volunteer_tasks t JOIN users u ON t.assigned_by=u.id WHERE t.volunteer_id=? OR t.status="open" ORDER BY t.created_at DESC',
        [id]
      )
    : await db.query('SELECT t.*,u.name as assigned_by_name, v.name as volunteer_name FROM volunteer_tasks t JOIN users u ON t.assigned_by=u.id LEFT JOIN users v ON t.volunteer_id=v.id ORDER BY t.created_at DESC');
  res.json(rows);
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { volunteer_id, title, description, location, due_date } = req.body;
  const status = volunteer_id ? 'assigned' : 'open';
  const [result] = await db.query(
    'INSERT INTO volunteer_tasks (volunteer_id,assigned_by,title,description,location,due_date,status) VALUES (?,?,?,?,?,?,?)',
    [volunteer_id || null, req.user.id, title, description, location, due_date, status]
  );
  res.status(201).json({ id: result.insertId, message: 'Task created' });
});

router.put('/:id/status', requireRole('admin', 'volunteer'), async (req, res) => {
  await db.query('UPDATE volunteer_tasks SET status=? WHERE id=?', [req.body.status, req.params.id]);
  res.json({ message: 'Status updated' });
});

router.put('/:id/assign', requireRole('volunteer'), async (req, res) => {
  const [[task]] = await db.query('SELECT * FROM volunteer_tasks WHERE id=?', [req.params.id]);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.status !== 'open') return res.status(400).json({ message: 'Task is not open' });
  await db.query('UPDATE volunteer_tasks SET volunteer_id=?, status=? WHERE id=?', [req.user.id, 'assigned', req.params.id]);
  res.json({ message: 'Task assigned' });
});

module.exports = router;
