const express = require('express');
const router = express.Router();
const { getInstitutions, createInstitution } = require('../controllers/institutionController');

router.route('/').get(getInstitutions).post(createInstitution);

module.exports = router;
