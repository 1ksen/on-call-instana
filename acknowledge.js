const express = require('express');
const router = express.Router();
const pool = require('./db'); // データベース設定をインポート

router.get('/', async (req, res) => {
    const { incident_id } = req.query;

    if (!incident_id) {
        return res.status(400).send('Incident ID is required');
    }

    try {
        const result = await pool.query(
            'UPDATE incidents SET state = $1 WHERE incident_id = $2 RETURNING *',
            ['ACKNOWLEDGE', incident_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Incident not found');
        }
        
        // 新たに追加: Acknowledgeが成功した場合、user_system_assignmentsテーブルの該当ユーザのlast_received_timeを更新
        const incident = result.rows[0];
        await pool.query(
            'UPDATE user_system_assignments SET last_received_time = CURRENT_TIMESTAMP ' +
            'WHERE user_id = $1 AND system_id = $2',
            [incident.assignee_user_id, incident.system_id]
        );

        res.status(200).json({ message: 'Incident acknowledged', incident: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
