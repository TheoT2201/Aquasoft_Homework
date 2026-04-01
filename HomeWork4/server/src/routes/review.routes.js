const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth.middleware');

// Ruta pentru a aduce recenziile unui anumit hotel
router.get('/:hotelId', reviewController.getReviewsByHotelId);

// Ruta pentru a crea o recenzie nouă
router.post('/', authenticate, reviewController.createReview);

module.exports = router;