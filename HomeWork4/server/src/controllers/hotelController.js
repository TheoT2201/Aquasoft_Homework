const { Op } = require('sequelize');
const Hotel = require('../models/Hotel');
const HotelGroup = require('../models/HotelGroup');
const User = require('../models/User');

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
            where: { HotelGroupID: group.get('hotelgroupid') }
        });
 
        return res.status(200).json({
            group: {
                id:        group.get('hotelgroupid'),
                groupName: group.get('groupname'),
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
                HotelGroupID: group.get('hotelgroupid'),
                ManagerID: { [Op.ne]: null }
            },
            include: [{
                model: User,
                as: 'HotelManager',
                attributes: ['id', 'firstName', 'lastName', 'email'],
            }],
        });
 
        const managers = hotels.map(h => ({
            hotelId:   h.get('globalpropertyid'),
            hotelName: h.get('globalpropertyname'),
            manager:   h.get('HotelManager'),
        }));
 
        return res.status(200).json({
            group:    group.get('groupname'),
            managers,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving managers', error });
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

module.exports = { getAllHotels, getHotelByName, getMyHotel, getMyGroupHotels, getMyGroupManagers, createHotel, updateHotel, deleteHotel };