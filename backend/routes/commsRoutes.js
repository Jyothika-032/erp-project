const express = require('express');
const router = express.Router();
const { getCommsLogs, createCommsLog, getCommsLogById, sendAlert } = require('../controllers/communicationController');

router.route('/')
  .get(getCommsLogs)
  .post(createCommsLog);

router.route('/send')
  .post(sendAlert);

router.route('/:id')
  .get(getCommsLogById);

module.exports = router;
