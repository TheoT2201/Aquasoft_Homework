const express = require('express');
const router = express.Router();
const { getAmenitiesByHotel } = require('../controllers/amenityController');

// GET /api/amenities/:id - Get all amenities for a hotel by globalpropertyid
router.get('/:id', getAmenitiesByHotel);

module.exports = router;