const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/students', attendanceController.getStudentsAttendance);
router.post('/students', attendanceController.markStudentAttendance);

router.get('/teachers', attendanceController.getStaffAttendance);
router.post('/teachers', attendanceController.markStaffAttendance);

module.exports = router;
