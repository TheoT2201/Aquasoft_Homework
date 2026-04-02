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

const updatePriceOffer = async (req, res) => {
    try {
        const { offerId } = req.params; // Luăm ID-ul ofertei din link
        const { Category, PricePerNight, Currency } = req.body; // Datele noi de la utilizator

        // Căutăm oferta
        const offer = await PriceOffer.findOne({
            where: { OfferID: offerId } // Adaptează numele coloanei ID-ului ofertei
        });

        if (!offer) {
            return res.status(404).json({ message: 'Oferta nu a fost găsită.' });
        }

        // Actualizăm valorile (folosim fallback la valorile vechi dacă nu se trimite ceva)
        offer.Category = Category || offer.Category;
        offer.PricePerNight = PricePerNight || offer.PricePerNight;
        offer.Currency = Currency || offer.Currency;

        await offer.save();

        return res.status(200).json({
            message: 'Ofertă actualizată cu succes!',
            offer
        });

    } catch (error) {
        console.error('Eroare la modificarea ofertei:', error);
        return res.status(500).json({ message: 'Eroare internă a serverului.' });
    }
};

module.exports = { getOffersByHotel, updatePriceOffer };