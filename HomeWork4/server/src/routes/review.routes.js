const express = require('express');
const router  = express.Router();
const { getReviewsByHotelId, getAllReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/reviews - All reviews (DataOperator, Administrator)
router.get('/', authenticate, authorize('DataOperator', 'Administrator'), getAllReviews);

// GET /api/reviews/:hotelId - Reviews for a hotel (public)
router.get('/:hotelId', getReviewsByHotelId);

// POST /api/reviews - Create review (authenticated)
router.post('/', authenticate, createReview);

// DELETE /api/reviews/:reviewId - Delete review (DataOperator, Administrator)
router.delete('/:reviewId', authenticate, authorize('DataOperator', 'Administrator'), deleteReview);

module.exports = router;