const express = require('express');
const router = express.Router();
const pool = require('./db'); // データベース設定をインポート

// 新しいインシデントを追加するAPI
router.post('/', async (req, res) => {
  const { issue } = req.body;
  try {
    const newIncident = await pool.query(
      'INSERT INTO incidents (external_id, type, state, start_time, end_time, severity, text, suggestion, link, zone, fqdn, entity, entity_label, tags, container, system_id, system_env) VALUES ($1, $2, $3, TO_TIMESTAMP($4 / 1000.0), TO_TIMESTAMP($5 / 1000.0), $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *',
      [issue.id, issue.type, issue.state, issue.start, issue.end, issue.severity, issue.text, issue.suggestion, issue.link, issue.zone, issue.fqdn, issue.entity, issue.entityLabel, issue.tags, issue.container, issue.system_id, issue.system_env]
    );
    res.json(newIncident.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// すべてのインシデントを取得するAPI
router.get('/', async (req, res) => {
  try {
    const allIncidents = await pool.query('SELECT * FROM incidents');
    res.json(allIncidents.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 特定のインシデントを取得するAPI
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await pool.query('SELECT * FROM incidents WHERE incident_id = $1', [id]);
    if (incident.rows.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// インシデント情報を更新するAPI
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, state, start_time, end_time, severity, text, suggestion, link, zone, fqdn, entity, entity_label, tags, container } = req.body;
  try {
    const updatedIncident = await pool.query(
      'UPDATE incidents SET type = $1, state = $2, start_time = TO_TIMESTAMP($3 / 1000.0), end_time = TO_TIMESTAMP($4 / 1000.0), severity = $5, text = $6, suggestion = $7, link = $8, zone = $9, fqdn = $10, entity = $11, entity_label = $12, tags = $13, container = $14 WHERE incident_id = $15 RETURNING *',
      [type, state, start_time, end_time, severity, text, suggestion, link, zone, fqdn, entity, entity_label, tags, container, id]
    );
    if (updatedIncident.rows.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(updatedIncident.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// インシデントを削除するAPI
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedIncident = await pool.query('DELETE FROM incidents WHERE incident_id = $1 RETURNING *', [id]);
    if (deletedIncident.rows.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
