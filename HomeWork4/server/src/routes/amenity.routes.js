const express = require('express');
const router = express.Router();
const { getAmenitiesByHotel } = require('../controllers/amenityController');

// GET /api/amenities/:id - Get all amenities for a hotel by globalpropertyid
router.get('/:id', getAmenitiesByHotel);

// POST /api/amenities - Add a new amenity (requires authentication and authorization)
const { addAmenity } = require('../controllers/amenityController');
const { authenticate, authorize } = require('../middleware/auth.middleware');
router.post('/', authenticate, authorize('HotelManager', 'Administrator'), addAmenity);
module.exports = router;