const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/reviews/:hotelId - Get all reviews for a hotel by globalpropertyid
router.get('/:hotelId', reviewController.getReviewsByHotelId);

// POST /api/reviews - Create a new review
router.post('/', authenticate, reviewController.createReview);

module.exports = router;