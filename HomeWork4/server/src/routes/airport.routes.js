const express = require('express');
const router = express.Router();
const { getBestOffersNearAirport } = require('../controllers/airportController');

// GET /api/airports/:iata_code/best-offers - Public
router.get('/:iata_code/best-offers', getBestOffersNearAirport);

module.exports = router;