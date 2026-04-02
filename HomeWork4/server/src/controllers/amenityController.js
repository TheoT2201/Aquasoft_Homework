const Amenity = require('../models/Amenity');
const Hotel = require('../models/Hotel');

// GET /api/amenities/:id - Get all amenities for a hotel by globalpropertyid
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
            amenities:       amenities.map(a => ({
                amenityid:   a.get('AmenityID'),
                amenityname: a.get('AmenityName'),
            })),
        });

    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving amenities', error });
    }
};

const addAmenity = async (req, res) => {
    try {
        // 1. Extragem exact denumirile pe care le trimite frontend-ul
        const { hotelId, amenityName } = req.body;

        // 2. Validare folosind variabilele definite mai sus
        if (!hotelId || !amenityName) {
            return res.status(400).json({ message: 'Missing Hotel or Amenity' });
        }

        // 3. Creăm înregistrarea în DB folosind denumirile corecte ale coloanelor
        const newAmenity = await Amenity.create({
            GlobalPropertyID: hotelId, // Am aliniat cu denumirea din funcția GET
            AmenityName: amenityName   // Am aliniat cu denumirea din funcția GET
        });

        return res.status(201).json({
            message: 'Amenity Added!',
            amenity: newAmenity
        });

    } catch (error) {
        console.error('Error Adding Amenity:', error);
        return res.status(500).json({ message: 'Server Internal Error' });
    }
};
module.exports = { getAmenitiesByHotel, addAmenity };