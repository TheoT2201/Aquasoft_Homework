const Review = require('../models/Review');
const User = require('../models/User');     

// Get Reviews By Hotel ID
const getReviewsByHotelId = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const reviews = await Review.findAll({
            where: { GlobalPropertyID: hotelId }
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

// Create Review
const createReview = async (req, res) => {
    try {
        const {
            GlobalPropertyID,
            ReviewerName,
            ReviewTitle,
            ReviewContent,
            ReviewDate,
            OverallRating,
            Location,
            Rooms,
            Value,
            Cleanliness,
            Service,
            SleepQuality,
            TripType,
            Source
        } = req.body;

        if (!GlobalPropertyID || !ReviewDate) {
            return res.status(400).json({ message: 'GlobalPropertyID and ReviewDate are required.' });
        }

        let finalReviewerName = ReviewerName;
        
        if (req.user && req.user.id) {
            const loggedInUser = await User.findByPk(req.user.id);
            if (loggedInUser) {
                finalReviewerName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
            }
        }

        if (!finalReviewerName) {
            return res.status(400).json({ message: 'ReviewerName is required.' });
        }

        const newReview = await Review.create({
            GlobalPropertyID,
            ReviewerName: finalReviewerName,
            ReviewTitle,
            ReviewContent,
            ReviewDate,
            OverallRating,
            Location,
            Rooms,
            Value,
            Cleanliness,
            Service,
            SleepQuality,
            TripType,
            Source
        });

        return res.status(201).json({ 
            message: 'Review created successfully!', 
            review: newReview 
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = {
    getReviewsByHotelId,
    createReview
};