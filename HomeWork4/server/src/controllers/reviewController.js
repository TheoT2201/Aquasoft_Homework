const Review = require('../models/Review');
const User   = require('../models/User');
const Hotel  = require('../models/Hotel');
const { Op } = require('sequelize');

// GET /api/reviews/:hotelId - Get reviews for a hotel
const getReviewsByHotelId = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const reviews = await Review.findAll({
            where: { GlobalPropertyID: hotelId },
            order: [['ReviewDate', 'DESC']],
        });
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this hotel.' });
        }
        return res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /api/reviews - Get ALL reviews (DataOperator / Admin)
const getAllReviews = async (req, res) => {
    try {
        const limit  = parseInt(req.query.limit)  || 50;
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search || '';

        const where = search
            ? {
                [Op.or]: [
                    { ReviewerName:  { [Op.iLike]: `%${search}%` } },
                    { ReviewTitle:   { [Op.iLike]: `%${search}%` } },
                    { ReviewContent: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : {};

        const { count, rows } = await Review.findAndCountAll({
            where,
            limit,
            offset,
            order: [['ReviewDate', 'DESC']],
        });

        return res.status(200).json({ total: count, limit, offset, reviews: rows });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /api/reviews - Create a review (Traveler)
const createReview = async (req, res) => {
    try {
        const {
            GlobalPropertyID, ReviewTitle, ReviewContent, ReviewDate,
            OverallRating, Location, Rooms, Value, Cleanliness,
            Service, SleepQuality, TripType, Source
        } = req.body;

        if (!GlobalPropertyID || !ReviewDate) {
            return res.status(400).json({ message: 'GlobalPropertyID and ReviewDate are required.' });
        }

        let ReviewerName = req.body.ReviewerName;
        if (req.user?.id) {
            const loggedInUser = await User.findByPk(req.user.id);
            if (loggedInUser) {
                ReviewerName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
            }
        }

        if (!ReviewerName) {
            return res.status(400).json({ message: 'ReviewerName is required.' });
        }

        const newReview = await Review.create({
            GlobalPropertyID, ReviewerName, ReviewTitle, ReviewContent,
            ReviewDate, OverallRating, Location, Rooms, Value,
            Cleanliness, Service, SleepQuality, TripType, Source
        });

        return res.status(201).json({ message: 'Review added successfully!', review: newReview });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// DELETE /api/reviews/:reviewId - Delete a review (DataOperator / Admin)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }
        await review.destroy();
        return res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getReviewsByHotelId, getAllReviews, createReview, deleteReview };