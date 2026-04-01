const { Op } = require('sequelize');
const Hotel = require('../models/Hotel');

// GET /hotels - Retrieve all hotels
const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.findAll();
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotels', error });
    }
};

// GET /hotels/:name - Retrieve a single hotel by GlobalPropertyName
const getHotelByName = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            where: {
                GlobalPropertyName: {
                    [Op.iLike]: `%${req.params.name}%`  // case-insensitive partial match
                }
            }
        });

        if (!hotel) {
            res.status(404).json({ message: 'Hotel not found' });
            return;
        }

        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotel', error });
    }
};

// POST /hotels - Create a new hotel
const createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error creating hotel', error });
    }
};

// PUT /hotels/:id - Update a hotel by GlobalPropertyID
const updateHotel = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const hotel = await Hotel.findByPk(id);

        if (!hotel) {
            res.status(404).json({ message: 'Hotel not found' });
            return;
        }

        await hotel.update(req.body);
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hotel', error });
    }
};

// DELETE /hotels/:id - Delete a hotel by GlobalPropertyID
const deleteHotel = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const hotel = await Hotel.findByPk(id);

        if (!hotel) {
            res.status(404).json({ message: 'Hotel not found' });
            return;
        }

        await hotel.destroy();
        res.status(200).json({ message: `Hotel ${req.params.id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hotel', error });
    }
};

module.exports = { getAllHotels, getHotelByName, createHotel, updateHotel, deleteHotel };