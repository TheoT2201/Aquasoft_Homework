const PriceOffer = require('../models/PriceOffer');
const Hotel = require('../models/Hotel');

// GET /api/priceoffers/:hotelId - Get all available price offers for a hotel
const getOffersByHotel = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;

        const hotel = await Hotel.findByPk(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found.' });
        }

        const offers = await PriceOffer.findAll({
            where: { GlobalPropertyID: hotelId, IsAvailable: true },
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

// PUT /api/priceoffers/:offerId - Update a price offer (Hotel Manager)
const updatePriceOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { Category, PricePerNight, Currency } = req.body;

        const offer = await PriceOffer.findOne({ where: { OfferID: offerId } });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        // Verify the manager owns the hotel this offer belongs to
        const hotel = await Hotel.findOne({
            where: { GlobalPropertyID: offer.get('GlobalPropertyID'), ManagerID: req.user.id }
        });
        if (!hotel) {
            return res.status(403).json({ message: 'Forbidden: this offer does not belong to your hotel.' });
        }

        offer.Category     = Category     || offer.Category;
        offer.PricePerNight = PricePerNight || offer.PricePerNight;
        offer.Currency     = Currency     || offer.Currency;
        await offer.save();

        return res.status(200).json({ message: 'Offer updated successfully.', offer });
    } catch (error) {
        console.error('Error updating offer:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getOffersByHotel, updatePriceOffer };