const Amenity = require('../models/Amenity');
const Hotel = require('../models/Hotel');

// GET /api/amenities/:id - Get all amenities for a hotel
const getAmenitiesByHotel = async (req, res) => {
    try {
        const globalpropertyid = parseInt(req.params.id, 10);

        if (isNaN(globalpropertyid)) {
            return res.status(400).json({ message: 'Invalid hotel ID' });
        }

        const hotel = await Hotel.findByPk(globalpropertyid);
        if (!hotel) {
            return res.status(404).json({ message: `Hotel with ID ${globalpropertyid} not found` });
        }

        const amenities = await Amenity.findAll({
            where: { GlobalPropertyID: globalpropertyid },
            attributes: ['AmenityID', 'AmenityName'],
        });

        return res.status(200).json({
            globalpropertyid,
            hotel_name:      hotel.get('GlobalPropertyName'),
            total_amenities: amenities.length,
            amenities: amenities.map(a => ({
                amenityid:   a.get('AmenityID'),
                amenityname: a.get('AmenityName'),
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving amenities', error });
    }
};

// POST /api/amenities - Add a new amenity (Hotel Manager)
const addAmenity = async (req, res) => {
    try {
        const { hotelId, amenityName } = req.body;

        if (!hotelId || !amenityName?.trim()) {
            return res.status(400).json({ message: 'hotelId and amenityName are required.' });
        }

        const hotel = await Hotel.findOne({
            where: { GlobalPropertyID: hotelId, ManagerID: req.user.id }
        });
        if (!hotel) {
            return res.status(403).json({ message: 'Forbidden: this hotel is not assigned to you.' });
        }

        const newAmenity = await Amenity.create({
            GlobalPropertyID: hotelId,
            AmenityName: amenityName.trim(),
        });

        return res.status(201).json({
            message: 'Amenity added successfully.',
            amenity: {
                amenityid:   newAmenity.get('AmenityID'),
                amenityname: newAmenity.get('AmenityName'),
            },
        });
    } catch (error) {
        console.error('Error adding amenity:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { getAmenitiesByHotel, addAmenity };