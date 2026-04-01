const Amenity = require('../models/Amenity');
const Hotel = require('../models/Hotel');

// GET /api/amenities/:id - Get all amenities for a hotel by globalpropertyid
const getAmenitiesByHotel = async (req, res) => {
    try {
        const globalpropertyid = parseInt(req.params.id, 10);

        if (isNaN(globalpropertyid)) {
            return res.status(400).json({ message: 'Invalid hotel ID' });
        }

        // Check the hotel exists
        const hotel = await Hotel.findByPk(globalpropertyid);
        if (!hotel) {
            return res.status(404).json({ message: `Hotel with ID ${globalpropertyid} not found` });
        }

        // Query amenities table directly by globalpropertyid
        const amenities = await Amenity.findAll({
            where: { GlobalPropertyID: globalpropertyid },
            attributes: ['AmenityID', 'AmenityName'],
        });

        return res.status(200).json({
            globalpropertyid,
            hotel_name:      hotel.get('GlobalPropertyName'),
            total_amenities: amenities.length,
            amenities:       amenities.map(a => ({
                amenityid:   a.get('AmenityID'),
                amenityname: a.get('AmenityName'),
            })),
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving amenities', error });
    }
};

module.exports = { getAmenitiesByHotel };