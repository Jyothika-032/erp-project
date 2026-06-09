const express = require('express');
const router = express.Router();
const { getMergeLogs, createMergeLog } = require('../controllers/mergeLogController');

// Map endpoints to the mergeLog controller functions
router.route('/')
  .get(getMergeLogs)
  .post(createMergeLog);

module.exports = router;
