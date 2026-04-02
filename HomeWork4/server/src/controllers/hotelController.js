const { Op } = require('sequelize');
const Hotel = require('../models/Hotel');
const HotelGroup = require('../models/HotelGroup');
const User = require('../models/User');

// GET /api/hotels?search=&limit=20&offset=0 - Retrieve hotels with pagination + search
const getAllHotels = async (req, res) => {
    try {
        const limit  = parseInt(req.query.limit)  || 20;
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search || '';

        const where = search
            ? { GlobalPropertyName: { [Op.iLike]: `%${search}%` } }
            : {};

        const { count, rows } = await Hotel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['GlobalPropertyName', 'ASC']],
        });

        res.status(200).json({
            total: count,
            limit,
            offset,
            hotels: rows,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotels', error });
    }
};

// GET /api/hotels/name/:name - Search hotel by name (public)
const getHotelByName = async (req, res) => {
    console.log('Searching for hotel with manager:', req.params.name);
    try {
        const hotel = await Hotel.findOne({
            where: {
                GlobalPropertyName: {
                    [Op.iLike]: `%${req.params.name}%`
                }
            }
        });

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving hotel', error });
    }
};

// GET /api/hotels/my - Hotel Manager sees only their hotel
const getMyHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({
            where: { ManagerID: req.user.id }
        });

        if (!hotel) {
            return res.status(404).json({ message: 'No hotel assigned to you yet.' });
        }

        return res.status(200).json(hotel);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving your hotel', error });
    }
};

// GET /api/hotels/my-group - Group Manager sees all hotels in their group
const getMyGroupHotels = async (req, res) => {
    try {
        const group = await HotelGroup.findOne({
            where: { ManagerID: req.user.id }
        });

        if (!group) {
            return res.status(404).json({ message: 'No hotel group assigned to you yet.' });
        }

        const hotels = await Hotel.findAll({
            where: { HotelGroupID: group.get('HotelGroupID') }
        });

        return res.status(200).json({
            group: {
                id:        group.get('HotelGroupID'),
                groupName: group.get('GroupName'),
            },
            total: hotels.length,
            hotels,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving group hotels', error });
    }
};

// GET /api/hotels/my-group/managers - Group Manager sees all hotel managers in their group
const getMyGroupManagers = async (req, res) => {
    try {
        const group = await HotelGroup.findOne({
            where: { ManagerID: req.user.id }
        });

        if (!group) {
            return res.status(404).json({ message: 'No hotel group assigned to you yet.' });
        }

        const hotels = await Hotel.findAll({
            where: {
                HotelGroupID: group.get('HotelGroupID'),
                ManagerID: { [Op.ne]: null }
            },
            include: [{
                model: User,
                as: 'Manager',
                attributes: ['id', 'firstName', 'lastName', 'email'],
            }],
        });

        const managers = hotels.map(h => ({
            hotelId:   h.get('GlobalPropertyID'),
            hotelName: h.get('GlobalPropertyName'),
            manager:   h.get('Manager'),
        }));

        return res.status(200).json({
            group:    group.get('GroupName'),
            managers,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving managers', error });
    }
};

// POST /api/hotels - Create a new hotel (Admin only)
const createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);
        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error creating hotel', error });
    }
};

// PUT /api/hotels/:id - Update a hotel (Admin only)
const updateHotel = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const hotel = await Hotel.findByPk(id);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        await hotel.update(req.body);
        res.status(200).json(hotel);
    } catch (error) {
        res.status(500).json({ message: 'Error updating hotel', error });
    }
};

// DELETE /api/hotels/:id - Delete a hotel (Admin only)
const deleteHotel = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const hotel = await Hotel.findByPk(id);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        await hotel.destroy();
        res.status(200).json({ message: `Hotel ${req.params.id} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hotel', error });
    }
};

//Get a hotel by ManagerID - for Manager dashboard


module.exports = { getAllHotels, getHotelByName, getMyHotel, getMyGroupHotels, getMyGroupManagers, createHotel, updateHotel, deleteHotel, };