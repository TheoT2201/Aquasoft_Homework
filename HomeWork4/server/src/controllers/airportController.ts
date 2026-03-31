import { Request, Response } from 'express';
import Airport from '../models/Airport';
import Hotel from '../models/Hotel';
import PriceOffer from '../models/PriceOffer';

// Haversine formula
// Calculates the distance in km between two lat/lng coordinate pairs
const haversineDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
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

const toRad = (value: number): number => (value * Math.PI) / 180;


// ---------------------------------------------------------------------------
// GET /airports/:iata_code/best-offers
// Returns hotels sorted by distance from the airport,
// each with their best (lowest) available price offer
// ---------------------------------------------------------------------------
export const getBestOffersNearAirport = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const iata_code = req.params['iata_code'] as string;

        // ── 1. Find the airport ───────────────────────────────────────
        const airport = await Airport.findOne({
            where: { iata_code: iata_code.toUpperCase() }
        });

        if (!airport) {
            res.status(404).json({
                message: `Airport with IATA code '${iata_code}' not found`
            });
            return;
        }

        const airportLat = parseFloat(airport.get('Latitude') as string);
        const airportLon = parseFloat(airport.get('Longitude') as string);

        // ── 2. Get all hotels ─────────────────────────────────────────
        const hotels = await Hotel.findAll();

        // ── 3. Get all available price offers ─────────────────────────
        const offers = await PriceOffer.findAll({
            where: { IsAvailable: true }
        });

        // Group offers by GlobalPropertyID and keep only the lowest price
        const bestOfferMap = new Map<number, any>();
        for (const offer of offers) {
            const hotelId = offer.get('GlobalPropertyID') as number;
            const price   = parseFloat(offer.get('PricePerNight') as string);
            const existing = bestOfferMap.get(hotelId);

            if (!existing || price < parseFloat(existing.get('PricePerNight') as string)) {
                bestOfferMap.set(hotelId, offer);
            }
        }

        // ── 4. Calculate distance for each hotel and attach best offer ─
        const results = hotels
            .filter(hotel => bestOfferMap.has(hotel.get('GlobalPropertyID') as number))
            .map(hotel => {
                const hotelLat = parseFloat(hotel.get('PropertyLatitude') as string);
                const hotelLon = parseFloat(hotel.get('PropertyLongitude') as string);
                const distance = haversineDistance(airportLat, airportLon, hotelLat, hotelLon);
                const bestOffer = bestOfferMap.get(hotel.get('GlobalPropertyID') as number);

                return {
                    GlobalPropertyID:   hotel.get('GlobalPropertyID'),
                    GlobalPropertyName: hotel.get('GlobalPropertyName'),
                    PropertyAddress1:   hotel.get('PropertyAddress1'),
                    PropertyLatitude:   hotelLat,
                    PropertyLongitude:  hotelLon,
                    DistanceFromAirport_km: parseFloat(distance.toFixed(2)),
                    BestOffer: {
                        OfferID:        bestOffer.get('OfferID'),
                        Category:       bestOffer.get('Category'),
                        PricePerNight:  parseFloat(bestOffer.get('PricePerNight') as string),
                        Currency:       bestOffer.get('Currency'),
                    }
                };
            })
            // ── 5. Sort by distance ascending ─────────────────────────
            .sort((a, b) => a.DistanceFromAirport_km - b.DistanceFromAirport_km);

        // ── 6. Return results ─────────────────────────────────────────
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