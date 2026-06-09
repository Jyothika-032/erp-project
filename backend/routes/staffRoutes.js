const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.route('/')
  .get(staffController.getStaff)
  .post(staffController.createStaff);

router.route('/:id')
  .get(staffController.getStaffById)
  .put(staffController.updateStaff)
  .delete(staffController.deleteStaff);

module.exports = router;
