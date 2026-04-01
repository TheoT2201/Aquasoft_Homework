const { fn, col, literal } = require('sequelize');
const Hotel = require('../models/Hotel');
const Review = require('../models/Review');
const Amenity = require('../models/Amenity');
const Rating = require('../models/Rating');


const MIN_REVIEWS = 5;

const WEIGHTS = {
    // Reviews - 60%
    overallrating: 0.15,
    cleanliness:   0.12,
    service:       0.10,
    sleepquality:  0.10,
    location:      0.08,
    rooms:         0.05,
    // Metadata - 40%
    sabrerating:   0.15,
    amenitycount:  0.12,
    distance:      0.08,
    roomcount:     0.05,
};

// Helpers
const clamp = (val, min = 1, max = 5) => {
    if (val === null || val === undefined || isNaN(val)) return 3;
    return Math.min(max, Math.max(min, Number(val)));
};

const minMaxNormalize = (value, min, max, invert = false) => {
    const v = Number(value), mn = Number(min), mx = Number(max);
    if (isNaN(v) || isNaN(mn) || isNaN(mx) || mx === mn) return 3;
    const normalized = (v - mn) / (mx - mn);
    return clamp(invert ? 1 + (1 - normalized) * 4 : 1 + normalized * 4);
};

const safeAvg = (arr) => arr.length === 0 ? 3 : arr.reduce((a, b) => a + Number(b), 0) / arr.length;

const safeStats = (arr) => {
    const nums = arr.map(Number).filter(v => !isNaN(v) && isFinite(v));
    if (nums.length === 0) return { min: 3, max: 3, avg: 3 };
    return { min: Math.min(...nums), max: Math.max(...nums), avg: safeAvg(nums) };
};

// Core computation
const computeScores = async () => {

    // Hotels 
    const hotels = await Hotel.findAll();
    console.log(`[Ratings] Found ${hotels.length} hotels`);

    if (hotels.length === 0) return [];

    // Reviews
    const reviewAggs = await Review.findAll({
        attributes: [
            [col('globalpropertyid'),              'hotelId'],
            [fn('COUNT', col('reviewid')),         'reviewCount'],
            [fn('AVG', col('overallrating')),      'avgOverall'],
            [fn('AVG', col('cleanliness')),        'avgCleanliness'],
            [fn('AVG', col('service')),            'avgService'],
            [fn('AVG', col('sleepquality')),       'avgSleepQuality'],
            [fn('AVG', col('location')),           'avgLocation'],
            [fn('AVG', col('rooms')),              'avgRooms'],
        ],
        group: [col('globalpropertyid')],
        raw: true,
    });

    console.log(`[Ratings] Found review aggregations for ${reviewAggs.length} hotels`);

    const reviewMap = new Map();
    for (const r of reviewAggs) {
        const id = String(r.hotelId);
        reviewMap.set(id, {
            count:        parseInt(r.reviewCount) || 0,
            overall:      r.avgOverall      != null ? parseFloat(r.avgOverall)      : null,
            cleanliness:  r.avgCleanliness  != null ? parseFloat(r.avgCleanliness)  : null,
            service:      r.avgService      != null ? parseFloat(r.avgService)      : null,
            sleepquality: r.avgSleepQuality != null ? parseFloat(r.avgSleepQuality) : null,
            location:     r.avgLocation     != null ? parseFloat(r.avgLocation)     : null,
            rooms:        r.avgRooms        != null ? parseFloat(r.avgRooms)        : null,
        });
    }

    // Amenity counts
    const amenityCounts = await Amenity.findAll({
        attributes: [
            [col('globalpropertyid'),          'hotelId'],
            [fn('COUNT', col('amenityid')),    'amenityCount'],
        ],
        group: [col('globalpropertyid')],
        raw: true,
    });

    console.log(`[Ratings] Found amenity counts for ${amenityCounts.length} hotels`);

    const amenityMap = new Map();
    for (const a of amenityCounts) {
        amenityMap.set(String(a.hotelId), parseInt(a.amenityCount) || 0);
    }

    // Global stats for normalization
    const allDistances    = hotels.map(h => h.get('DistanceToTheAirport')).filter(v => v != null && !isNaN(Number(v)));
    const allRoomCounts   = hotels.map(h => h.get('NumberOfRooms')).filter(v => v != null && !isNaN(Number(v)));
    const allAmenities    = [...amenityMap.values()];
    const allSabreRatings = hotels.map(h => h.get('SabrePropertyRating')).filter(v => v != null && !isNaN(Number(v)));

    const stats = {
        distance:  safeStats(allDistances),
        rooms:     safeStats(allRoomCounts),
        amenities: safeStats(allAmenities),
        sabre:     safeStats(allSabreRatings),
    };

    console.log(`[Ratings] Stats — distance: ${JSON.stringify(stats.distance)}, rooms: ${JSON.stringify(stats.rooms)}`);

    // Score each hotel
    const scored = hotels.map(hotel => {
        const rawId = hotel.get('GlobalPropertyID');
        if (rawId == null) {
            console.warn('[Ratings] Hotel with null GlobalPropertyID skipped');
            return null;
        }
        const globalPropertyId = String(rawId);

        const revs = reviewMap.get(globalPropertyId);
        const hasEnoughReviews = revs && revs.count >= MIN_REVIEWS;

        // Review scores
        const reviewFields = [
            { key: 'overall',      weight: WEIGHTS.overallrating, value: revs?.overall      },
            { key: 'cleanliness',  weight: WEIGHTS.cleanliness,   value: revs?.cleanliness  },
            { key: 'service',      weight: WEIGHTS.service,        value: revs?.service      },
            { key: 'sleepquality', weight: WEIGHTS.sleepquality,   value: revs?.sleepquality },
            { key: 'location',     weight: WEIGHTS.location,       value: revs?.location     },
            { key: 'rooms',        weight: WEIGHTS.rooms,          value: revs?.rooms        },
        ];

        let reviewWeightTotal = 0;
        let reviewWeightedSum = 0;
        const reviewScores   = {};

        for (const f of reviewFields) {
            if (hasEnoughReviews && f.value != null && !isNaN(f.value)) {
                const score = clamp(f.value);
                reviewScores[f.key]  = parseFloat(score.toFixed(2));
                reviewWeightedSum   += score * f.weight;
                reviewWeightTotal   += f.weight;
            } else {
                reviewScores[f.key] = null;
            }
        }

        // Metadata scores
        const rawDistance  = hotel.get('DistanceToTheAirport');
        const rawRooms     = hotel.get('NumberOfRooms');
        const rawAmenities = amenityMap.get(globalPropertyId) ?? 0;
        const rawSabre     = hotel.get('SabrePropertyRating');

        const distVal    = rawDistance  != null ? Number(rawDistance)  : null;
        const roomVal    = rawRooms     != null ? Number(rawRooms)     : null;
        const sabreVal   = rawSabre     != null ? Number(rawSabre)     : null;

        const distScore    = distVal  != null && !isNaN(distVal)  ? minMaxNormalize(distVal,  stats.distance.min,  stats.distance.max,  true)  : minMaxNormalize(stats.distance.avg,  stats.distance.min,  stats.distance.max,  true);
        const roomScore    = roomVal  != null && !isNaN(roomVal)  ? minMaxNormalize(roomVal,  stats.rooms.min,     stats.rooms.max,     false) : minMaxNormalize(stats.rooms.avg,     stats.rooms.min,     stats.rooms.max,     false);
        const amenityScore = minMaxNormalize(rawAmenities, stats.amenities.min, stats.amenities.max, false);
        const sabreScore   = sabreVal != null && !isNaN(sabreVal) ? clamp(sabreVal) : clamp(stats.sabre.avg);

        const metaSum   = sabreScore * WEIGHTS.sabrerating + amenityScore * WEIGHTS.amenitycount + distScore * WEIGHTS.distance + roomScore * WEIGHTS.roomcount;
        const metaTotal = WEIGHTS.sabrerating + WEIGHTS.amenitycount + WEIGHTS.distance + WEIGHTS.roomcount;

        let compositeScore;
        if (reviewWeightTotal > 0) {
            compositeScore = (reviewWeightedSum + metaSum) / (reviewWeightTotal + metaTotal);
        } else {
            compositeScore = metaSum / metaTotal;
        }
        compositeScore = clamp(compositeScore);

        return {
            GlobalPropertyID:   globalPropertyId,
            GlobalPropertyName: hotel.get('GlobalPropertyName'),
            reviewCount:        revs?.count || 0,
            reviewsReliable:    hasEnoughReviews || false,
            scores: {
                overall:       reviewScores.overall,
                cleanliness:   reviewScores.cleanliness,
                service:       reviewScores.service,
                sleepQuality:  reviewScores.sleepquality,
                location:      reviewScores.location,
                rooms:         reviewScores.rooms,
                sabreScore:    parseFloat(sabreScore.toFixed(2)),
                amenityCount:  rawAmenities,
                amenityScore:  parseFloat(amenityScore.toFixed(2)),
                distanceMiles: distVal,
                distanceScore: parseFloat(distScore.toFixed(2)),
                roomCount:     roomVal,
                roomScore:     parseFloat(roomScore.toFixed(2)),
            },
            compositeScore: parseFloat(compositeScore.toFixed(2)),
        };
    }).filter(h => h !== null);

    scored.sort((a, b) => b.compositeScore - a.compositeScore);
    scored.forEach((h, i) => { h.rank = i + 1; });

    console.log(`[Ratings] Scored ${scored.length} hotels`);
    return scored;
};

// POST /api/ratings/refresh
const refreshRatings = async (req, res) => {
    try {
        const scored = await computeScores();

        for (const h of scored) {
            await Rating.upsert({
                GlobalPropertyID:  h.GlobalPropertyID,
                CompositeScore:    h.compositeScore,
                OverallScore:      h.scores.overall,
                CleanlinessScore:  h.scores.cleanliness,
                ServiceScore:      h.scores.service,
                SleepQualityScore: h.scores.sleepQuality,
                LocationScore:     h.scores.location,
                RoomsScore:        h.scores.rooms,
                SabreScore:        h.scores.sabreScore,
                AmenityScore:      h.scores.amenityScore,
                AmenityCount:      h.scores.amenityCount,
                DistanceScore:     h.scores.distanceScore,
                DistanceMiles:     h.scores.distanceMiles,
                RoomCountScore:    h.scores.roomScore,
                RoomCount:         h.scores.roomCount,
                ReviewCount:       h.reviewCount,
                ReviewsReliable:   h.reviewsReliable,
                Rank:              h.rank,
                ComputedAt:        new Date(),
            });
        }

        return res.status(200).json({
            message: `Ratings refreshed for ${scored.length} hotels.`,
            computedAt: new Date(),
            hotels: scored,
        });
    } catch (error) {
        console.error('[Ratings] Error refreshing:', error);
        return res.status(500).json({ message: 'Error refreshing ratings', error });
    }
};

// GET /api/ratings
const getAllRatings = async (req, res) => {
    try {
        const ratings = await Rating.findAll({
            include: [{ model: Hotel, attributes: ['GlobalPropertyName'] }],
            order: [['Rank', 'ASC']],
        });
        return res.status(200).json({ total: ratings.length, ratings });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving ratings', error });
    }
};

// GET /api/ratings/:id
const getHotelRating = async (req, res) => {
    try {
        const rating = await Rating.findByPk(req.params.id, {
            include: [{ model: Hotel, attributes: ['GlobalPropertyName'] }],
        });
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found. Run POST /api/ratings/refresh first.' });
        }
        return res.status(200).json(rating);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving rating', error });
    }
};

module.exports = { refreshRatings, getAllRatings, getHotelRating };