const express = require('express');
const router = express.Router();
const { getAmenitiesByHotel, addAmenity } = require('../controllers/amenityController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/amenities/:id - Public
router.get('/:id', getAmenitiesByHotel);

// POST /api/amenities - Hotel Manager or Administrator
router.post('/', authenticate, authorize('HotelManager', 'Administrator'), addAmenity);

module.exports = router;