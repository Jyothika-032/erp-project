const express = require('express');
const router = express.Router();
const { getPermissions, updatePermissions } = require('../controllers/rolePermissionsController');

router.route('/:id')
  .get(getPermissions)
  .put(updatePermissions);

module.exports = router;
