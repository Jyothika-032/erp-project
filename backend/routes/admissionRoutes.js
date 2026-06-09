const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');

router.get('/', admissionController.getAdmissions);
router.post('/', admissionController.createAdmission);

module.exports = router;
