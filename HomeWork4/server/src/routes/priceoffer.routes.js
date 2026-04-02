const express = require('express');
const router = express.Router();
const { getOffersByHotel, updatePriceOffer } = require('../controllers/priceofferController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/priceoffers/:hotelId - Public
router.get('/:hotelId', getOffersByHotel);

// PUT /api/priceoffers/:offerId - Hotel Manager or Administrator
router.put('/:offerId', authenticate, authorize('HotelManager', 'Administrator'), updatePriceOffer);

module.exports = router;