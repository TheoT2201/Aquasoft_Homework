const express = require('express');
const router = express.Router();
const { getAllHotels, getHotelByName, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/hotels - Public
router.get('/', getAllHotels);

// GET /api/hotels/name/:name - Public
router.get('/name/:name', getHotelByName);

// POST /api/hotels - Admin only
router.post('/', authenticate, authorize('Administrator'), createHotel);

// PUT /api/hotels/:id - Admin only
router.put('/:id', authenticate, authorize('Administrator'), updateHotel);

// DELETE /api/hotels/:id - Admin only
router.delete('/:id', authenticate, authorize('Administrator'), deleteHotel);

module.exports = router;