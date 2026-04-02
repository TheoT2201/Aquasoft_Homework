const express = require('express');
const router = express.Router();
const { getOffersByHotel } = require('../controllers/priceofferController');

// GET /api/priceoffers/:hotelId - Public
router.get('/:hotelId', getOffersByHotel);

module.exports = router;