const Airport = require('../models/Airport');
const Hotel = require('../models/Hotel');
const PriceOffer = require('../models/PriceOffer');

// Haversine formula - in MILES
const toRad = (value) => (value * Math.PI) / 180;

const haversineDistanceMiles = (lat1, lon1, lat2, lon2) => {
    const R    = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a    =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// GET /api/airports/hotel-distances - For every hotel find its primary airport and calculate the distance in miles
const getHotelDistancesToPrimaryAirport = async (req, res) => {
    try {
        // Load all airports into a map keyed by iata_code for fast lookup
        const airports = await Airport.findAll();
        const airportMap = new Map();
        for (const ap of airports) {
            airportMap.set(ap.get('iata_code'), ap);
        }
 
        const hotels = await Hotel.findAll();
 
        const results = [];
        const skipped = [];
 
        for (const hotel of hotels) {
            const iata = hotel.get('primaryairportcode');
            const airport = airportMap.get(iata);
 
            if (!airport) {
                skipped.push({
                    globalpropertyid: hotel.get('globalpropertyid'),
                    name: hotel.get('globalpropertyname'),
                    reason: `Airport '${iata}' not found in airports table`,
                });
                continue;
            }
 
            const hotelLat   = parseFloat(hotel.get('propertylatitude'));
            const hotelLon   = parseFloat(hotel.get('propertylongitude'));
            const airportLat = parseFloat(airport.get('latitude'));
            const airportLon = parseFloat(airport.get('longitude'));
 
            if (isNaN(hotelLat) || isNaN(hotelLon) || isNaN(airportLat) || isNaN(airportLon)) {
                skipped.push({
                    globalpropertyid: hotel.get('globalpropertyid'),
                    name: hotel.get('globalpropertyname'),
                    reason: 'Missing coordinates',
                });
                continue;
            }
 
            const distanceMiles = parseFloat(
                haversineDistanceMiles(hotelLat, hotelLon, airportLat, airportLon).toFixed(2)
            );
 
            results.push({
                GlobalPropertyID:    hotel.get('globalpropertyid'),
                GlobalPropertyName:  hotel.get('globalpropertyname'),
                PrimaryAirportCode:  iata,
                AirportName:         airport.get('airport_name'),
                DistanceMiles:       distanceMiles,
            });
        }
 
        // Sort by distance ascending
        results.sort((a, b) => a.DistanceMiles - b.DistanceMiles);
 
        return res.status(200).json({
            total:   results.length,
            skipped: skipped.length,
            hotels:  results,
            ...(skipped.length > 0 && { skipped_details: skipped }),
        });
 
    } catch (error) {
        return res.status(500).json({
            message: 'Error calculating hotel distances to airports',
            error,
        });
    }
};

module.exports = { getHotelDistancesToPrimaryAirport };