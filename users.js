const express = require('express');
const router = express.Router();
const pool = require('./db'); // DB設定をインポート

// ユーザを追加するAPI
router.post('/', async (req, res) => {
    const { username, email, phone_number } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO users (username, email, phone_number) VALUES ($1, $2, $3) RETURNING *',
        [username, email, phone_number]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // すべてのユーザを取得するAPI
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // 特定のユーザを取得するAPI
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ユーザ情報を更新するAPI
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, phone_number } = req.body;
    try {
      const result = await pool.query(
        'UPDATE users SET username = $1, email = $2, phone_number = $3 WHERE user_id = $4 RETURNING *',
        [username, email, phone_number, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ユーザを削除するAPI
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;