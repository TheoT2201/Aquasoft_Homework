const express = require('express');
const router = express.Router();
const { getOffersByHotel } = require('../controllers/priceofferController');

// GET /api/priceoffers/:hotelId - Public
router.get('/:hotelId', getOffersByHotel);

const { updatePriceOffer } = require('../controllers/priceofferController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// PUT /api/priceoffers/:offerId
router.put('/:offerId', authenticate, authorize('HotelManager', 'Administrator'), updatePriceOffer);
module.exports = router;