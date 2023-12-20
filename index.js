const express = require('express');
const app = express();

// ルータのインポート
const usersRouter = require('./users');
const systemsRouter = require('./systems');
const userSystemAssignmentsRouter = require('./userSystemAssignments');
const incidentsRouter = require('./incidents');
const acknowledgeRouter = require('./acknowledge');

// モック用のルータのインポート
const callToAssigneeRouter = require('./mock/callToAssignee');

// ポーリングのインポート
const POLLING_INTERVAL = 10000; // 10秒ごとに設定
const { pollingIncidents } = require('./polling/pollingIncidents');
const { pollingStatus } = require('./polling/pollingStatus');


// ミドルウェアの設定
app.use(express.json());

// ルータを特定のパスにマウント
app.use('/users', usersRouter);
app.use('/systems', systemsRouter);
app.use('/userSystemAssignments', userSystemAssignmentsRouter);
app.use('/incidents', incidentsRouter);
app.use('/acknowledge', acknowledgeRouter);

// モック用のルータを特定のパスにマウント
app.use('/mock/callToAssignee', callToAssigneeRouter);

// ポーリングプロセスの開始
setInterval(pollingIncidents, POLLING_INTERVAL);
setInterval(pollingStatus, POLLING_INTERVAL);

// サーバーの設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
