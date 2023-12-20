const pool = require('../db'); // データベース設定をインポート
const axios = require('axios');

async function pollingIncidents() {
    try {
        // ステータスがOPENで最も古いタイムスタンプのレコードを取得
        const res = await pool.query('SELECT * FROM incidents WHERE state = $1 ORDER BY created_at ASC LIMIT 1', ['OPEN']);
        const incident = res.rows[0];
        console.log('Incident info:', incident); // 対象のインシデント情報をログに出力

        if (incident) {
            // ステータスをESCALATINGに更新
            await pool.query('UPDATE incidents SET state = $1 WHERE incident_id = $2', ['ESCALATING', incident.incident_id]);

            // 最終送電時刻が最も新しい担当者を除外し、最終送電時刻がNULLまたは最も古い担当者を取得
            const assigneeRes = await pool.query(
                'SELECT u.email, u.phone_number, usa.* FROM user_system_assignments usa ' +
                'LEFT JOIN users u ON usa.user_id = u.user_id ' +
                'WHERE system_id = $1 AND usa.assignment_id NOT IN (' +
                '  SELECT assignment_id FROM user_system_assignments ' +
                '  WHERE system_id = $1 ORDER BY last_received_time DESC NULLS LAST LIMIT 1' +
                ') ORDER BY usa.last_sent_time IS NULL DESC, usa.last_sent_time ASC LIMIT 1',
                [incident.system_id]
            );
            const assignee = assigneeRes.rows[0];

            if (assignee) {
                // acknowledge_url の追加
                const acknowledgeUrl = `http://localhost:3000/acknowledge?incident_id=${incident.incident_id}`;
            
                // localhostの/mock/callToAssigneeにPOSTリクエストを送信
                try {
                    const response = await axios.post('http://localhost:3000/mock/callToAssignee', { 
                        incident, 
                        assignee, 
                        acknowledge_url: acknowledgeUrl 
                    });
                    console.log('Assignee info:', assignee); // 担当者の情報をログに出力
                    if (response.status === 200) {
                        // 担当者のlast_sent_timeを更新し、インシデントのステータスをWAITINGに更新し、担当者情報を追加
                        await pool.query('UPDATE user_system_assignments SET last_sent_time = CURRENT_TIMESTAMP WHERE assignment_id = $1', [assignee.assignment_id]);
                        await pool.query('UPDATE incidents SET state = $1, assignee_user_id = $2 WHERE incident_id = $3', ['WAITING', assignee.user_id, incident.incident_id]);
                    }
                } catch (error) {
                    console.error('Error sending POST request to /mock/callToAssignee:', error);
                }
            }
        }
    } catch (err) {
        console.error('Error during polling incidents:', err);
    }
}

module.exports = { pollingIncidents };
