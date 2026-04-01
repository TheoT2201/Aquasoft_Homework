const express = require('express');
const router = express.Router();
const { getHotelDistancesToPrimaryAirport } = require('../controllers/airportController');

// GET /api/airports/hotel-distances - All hotels with their distance to their primary airport
router.get('/hotel-distances', getHotelDistancesToPrimaryAirport);

module.exports = router;