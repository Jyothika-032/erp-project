const express = require('express');
const router = express.Router();
const { getRoles, createRole } = require('../controllers/roleController');

router.route('/').get(getRoles).post(createRole);

module.exports = router;
