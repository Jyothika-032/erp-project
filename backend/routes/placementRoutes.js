const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');

router.get('/',      placementController.getPlacements);
router.get('/:id',   placementController.getPlacementById);
router.post('/',     placementController.createPlacement);
router.put('/:id',   placementController.updatePlacement);
router.delete('/:id',placementController.deletePlacement);

module.exports = router;
