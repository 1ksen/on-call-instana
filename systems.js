const express = require('express');
const router = express.Router();
const pool = require('./db'); // データベース接続設定を別ファイルに分離

// システムを追加するAPI
router.post('/', async (req, res) => {
  const { system_name, description } = req.body;
  try {
    const newSystem = await pool.query(
      'INSERT INTO systems (system_name, description) VALUES ($1, $2) RETURNING *',
      [system_name, description]
    );
    res.json(newSystem.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// すべてのシステムを取得するAPI
router.get('/', async (req, res) => {
  try {
    const allSystems = await pool.query('SELECT * FROM systems');
    res.json(allSystems.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 特定のシステムを取得するAPI
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const system = await pool.query('SELECT * FROM systems WHERE system_id = $1', [id]);
    if (system.rows.length === 0) {
      return res.status(404).json({ message: 'System not found' });
    }
    res.json(system.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// システム情報を更新するAPI
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { system_name, description } = req.body;
  try {
    const updatedSystem = await pool.query(
      'UPDATE systems SET system_name = $1, description = $2 WHERE system_id = $3 RETURNING *',
      [system_name, description, id]
    );
    if (updatedSystem.rows.length === 0) {
      return res.status(404).json({ message: 'System not found' });
    }
    res.json(updatedSystem.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// システムを削除するAPI
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSystem = await pool.query('DELETE FROM systems WHERE system_id = $1 RETURNING *', [id]);
    if (deletedSystem.rows.length === 0) {
      return res.status(404).json({ message: 'System not found' });
    }
    res.json({ message: 'System deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
