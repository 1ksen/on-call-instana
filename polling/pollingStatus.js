const pool = require('../db'); // データベース設定をインポート

async function pollingStatus() {
    try {
        // WAITING状態のインシデントを取得し、last_sent_timeが5分以上経過しているものを確認
        const res = await pool.query(
            'SELECT i.* FROM incidents i ' +
            'JOIN user_system_assignments u ON i.assignee_user_id = u.assignment_id ' + // 修正: u.user_id -> u.assignment_id
            'WHERE i.state = $1 AND (u.last_sent_time IS NULL OR u.last_sent_time < NOW() - INTERVAL \'5 minutes\')', // 修正: 600 minutes -> 5 minutes
            ['WAITING']
        );

        // 該当するインシデントがあれば、ステータスをOPENに更新
        for (let incident of res.rows) {
            await pool.query('UPDATE incidents SET state = $1 WHERE incident_id = $2', ['OPEN', incident.incident_id]);
            console.log(`Updated incident ${incident.incident_id} to OPEN`);
        }
    } catch (err) {
        console.error('Error during polling incidents:', err);
    }
}

module.exports = { pollingStatus };
