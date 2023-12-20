const express = require('express');
const router = express.Router();
const pool = require('./db'); // データベース設定をインポート

// アサインを追加するAPI
router.post('/', async (req, res) => {
  const { user_id, system_id, role } = req.body;
  try {
    const newAssignment = await pool.query(
      'INSERT INTO user_system_assignments (user_id, system_id, role) VALUES ($1, $2, $3) RETURNING *',
      [user_id, system_id, role]
    );
    res.json(newAssignment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// すべてのアサインを取得するAPI
router.get('/', async (req, res) => {
  try {
    const allAssignments = await pool.query('SELECT * FROM user_system_assignments');
    res.json(allAssignments.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 特定のアサインを取得するAPI
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const assignment = await pool.query('SELECT * FROM user_system_assignments WHERE assignment_id = $1', [id]);
    if (assignment.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// アサイン情報を更新するAPI
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, system_id, role } = req.body;
  try {
    const updatedAssignment = await pool.query(
      'UPDATE user_system_assignments SET user_id = $1, system_id = $2, role = $3 WHERE assignment_id = $4 RETURNING *',
      [user_id, system_id, role, id]
    );
    if (updatedAssignment.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(updatedAssignment.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// アサインを削除するAPI
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAssignment = await pool.query('DELETE FROM user_system_assignments WHERE assignment_id = $1 RETURNING *', [id]);
    if (deletedAssignment.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
