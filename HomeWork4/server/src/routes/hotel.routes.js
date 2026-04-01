const express = require('express');
const router = express.Router();
const { getAllHotels, getHotelByName, getMyHotel, getMyGroupHotels, getMyGroupManagers, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/hotels - Public
router.get('/', getAllHotels);

// GET /api/hotels/name/:name - Public
router.get('/name/:name', getHotelByName);

// GET /api/hotels/my - Hotel Manager sees only their hotel
router.get('/my', authenticate, authorize('HotelManager'), getMyHotel);

// GET /api/hotels/my-group - Group Manager sees all hotels in their group
router.get('/my-group', authenticate, authorize('GroupManager'), getMyGroupHotels);

// GET /api/hotels/my-group/managers - Group Manager sees all hotel managers in their group
router.get('/my-group/managers', authenticate, authorize('GroupManager'), getMyGroupManagers);

// POST /api/hotels - Admin only
router.post('/', authenticate, authorize('Administrator'), createHotel);

// PUT /api/hotels/:id - Admin only
router.put('/:id', authenticate, authorize('Administrator'), updateHotel);

// DELETE /api/hotels/:id - Admin only
router.delete('/:id', authenticate, authorize('Administrator'), deleteHotel);

module.exports = router;