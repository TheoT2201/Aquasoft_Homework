const Review = require('../models/Review');
const User = require('../models/User');     

// 1. Get Reviews By Hotel ID
const getReviewsByHotelId = async (req, res) => {
    try {
        // Extragem ID-ul hotelului din parametrii rutei (ex: /api/reviews/100204800)
        const { hotelId } = req.params;

        const reviews = await Review.findAll({
            where: { GlobalPropertyID: hotelId }
        });

        // Verificăm dacă hotelul are recenzii
        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'Nu s-au găsit recenzii pentru acest hotel.' });
        }

        return res.status(200).json(reviews);
    } catch (error) {
        console.error('Eroare la preluarea recenziilor:', error);
        return res.status(500).json({ message: 'Eroare internă a serverului.' });
    }
};

// 2. Create Review
const createReview = async (req, res) => {
    try {
        // Extragem datele din corpul cererii (Postman / Frontend)
        const {
            GlobalPropertyID,
            ReviewerName, // Poate fi trimis manual, sau suprascris de User
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

        // Validare de bază: ne asigurăm că avem câmpurile obligatorii (allowNull: false)
        if (!GlobalPropertyID || !ReviewDate) {
            return res.status(400).json({ message: 'GlobalPropertyID și ReviewDate sunt obligatorii.' });
        }

        // MAGIC TRICK: Dacă ai implementat autentificare și ai req.user 
        // (setat de un middleware), îi putem lua numele direct de acolo.
        // Altfel, folosim ce vine din req.body.
        let finalReviewerName = ReviewerName;
        
        if (req.user && req.user.id) {
            const loggedInUser = await User.findByPk(req.user.id);
            if (loggedInUser) {
                finalReviewerName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
            }
        }

        // Dacă nu avem nume nici din body, nici din userul logat, dăm eroare
        if (!finalReviewerName) {
            return res.status(400).json({ message: 'ReviewerName este obligatoriu.' });
        }

        // Creăm recenzia în baza de date
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
            message: 'Recenzia a fost adăugată cu succes!', 
            review: newReview 
        });

    } catch (error) {
        console.error('Eroare la crearea recenziei:', error);
        return res.status(500).json({ message: 'Eroare internă a serverului la crearea recenziei.' });
    }
};

module.exports = {
    getReviewsByHotelId,
    createReview
};