const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public monitoring routes
router.get('/stations', publicController.getPublicStations);
router.get('/stations/:stationId/summary', publicController.getPublicStationSummary);

module.exports = router;
