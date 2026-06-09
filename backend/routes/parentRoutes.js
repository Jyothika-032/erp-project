const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

router.get('/', parentController.getParents);
router.post('/', parentController.createParent);
router.put('/:id', parentController.updateParent);

module.exports = router;
