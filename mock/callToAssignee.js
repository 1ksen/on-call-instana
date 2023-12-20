// mock/callToAssignee.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log('Received POST request at /mock/callToAssignee');
    console.log('Payload:', req.body); // ペイロードをログに出力

    res.status(200).send('Payload received');
});

module.exports = router;
