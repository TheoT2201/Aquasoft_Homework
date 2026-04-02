const PriceOffer = require('../models/PriceOffer');
const Hotel = require('../models/Hotel');

// GET /api/priceoffers/:hotelId - Get all price offers for a hotel
const getOffersByHotel = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;

        const hotel = await Hotel.findByPk(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found.' });
        }

        const offers = await PriceOffer.findAll({
            where: {
                GlobalPropertyID: hotelId,
                IsAvailable: true,
            },
            order: [['PricePerNight', 'ASC']],
        });

        return res.status(200).json({
            globalpropertyid: hotelId,
            hotel_name: hotel.get('GlobalPropertyName'),
            offers,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving price offers', error });
    }
};

module.exports = { getOffersByHotel };