const express = require('express');
const router = express.Router();
const { refreshRatings, getAllRatings, getHotelRating } = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// POST /api/ratings/refresh - Recompute and persist all scores (Admin + DataOperator)
router.post('/refresh', authenticate, authorize('Administrator', 'DataOperator'), refreshRatings);

// GET /api/ratings - Read full ranking table from DB
router.get('/', authenticate, authorize('Administrator', 'HotelManager', 'GroupManager', 'DataOperator'), getAllRatings);

// GET /api/ratings/:id - Single hotel score for hotel page badge
router.get('/:id', authenticate, authorize('Administrator', 'HotelManager', 'GroupManager', 'DataOperator'), getHotelRating);

module.exports = router;