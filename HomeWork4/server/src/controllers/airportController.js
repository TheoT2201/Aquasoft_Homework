const Airport = require('../models/Airport');
const Hotel = require('../models/Hotel');
const PriceOffer = require('../models/PriceOffer');

// Haversine formula
// Calculates the distance in km between two lat/lng coordinate pairs
const toRad = (value) => (value * Math.PI) / 180;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R    = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a    =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ---------------------------------------------------------------------------
// GET /airports/:iata_code/best-offers
// Returns hotels sorted by distance from the airport,
// each with their best (lowest) available price offer
// ---------------------------------------------------------------------------
const getBestOffersNearAirport = async (req, res) => {
    try {
        const iata_code = req.params['iata_code'];

        const airport = await Airport.findOne({
            where: { iata_code: iata_code.toUpperCase() }
        });

        if (!airport) {
            res.status(404).json({
                message: `Airport with IATA code '${iata_code}' not found`
            });
            return;
        }

        const airportLat = parseFloat(airport.get('Latitude'));
        const airportLon = parseFloat(airport.get('Longitude'));

        const hotels = await Hotel.findAll();

        const offers = await PriceOffer.findAll({
            where: { IsAvailable: true }
        });

        // Group offers by GlobalPropertyID and keep only the lowest price
        const bestOfferMap = new Map();
        for (const offer of offers) {
            const hotelId  = offer.get('GlobalPropertyID');
            const price    = parseFloat(offer.get('PricePerNight'));
            const existing = bestOfferMap.get(hotelId);

            if (!existing || price < parseFloat(existing.get('PricePerNight'))) {
                bestOfferMap.set(hotelId, offer);
            }
        }

        const results = hotels
            .filter(hotel => bestOfferMap.has(hotel.get('GlobalPropertyID')))
            .map(hotel => {
                const hotelLat  = parseFloat(hotel.get('PropertyLatitude'));
                const hotelLon  = parseFloat(hotel.get('PropertyLongitude'));
                const distance  = haversineDistance(airportLat, airportLon, hotelLat, hotelLon);
                const bestOffer = bestOfferMap.get(hotel.get('GlobalPropertyID'));

                return {
                    GlobalPropertyID:       hotel.get('GlobalPropertyID'),
                    GlobalPropertyName:     hotel.get('GlobalPropertyName'),
                    PropertyAddress1:       hotel.get('PropertyAddress1'),
                    PropertyLatitude:       hotelLat,
                    PropertyLongitude:      hotelLon,
                    DistanceFromAirport_km: parseFloat(distance.toFixed(2)),
                    BestOffer: {
                        OfferID:       bestOffer.get('OfferID'),
                        Category:      bestOffer.get('Category'),
                        PricePerNight: parseFloat(bestOffer.get('PricePerNight')),
                        Currency:      bestOffer.get('Currency'),
                    }
                };
            })
            .sort((a, b) => a.DistanceFromAirport_km - b.DistanceFromAirport_km);

        res.status(200).json({
            airport: {
                iata_code:    airport.get('iata_code'),
                airport_name: airport.get('airport_name'),
                Latitude:     airportLat,
                Longitude:    airportLon,
            },
            total_hotels_with_offers: results.length,
            hotels: results,
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving best offers near airport',
            error
        });
    }
};

module.exports = { getBestOffersNearAirport };