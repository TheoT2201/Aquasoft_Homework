const Hotel = require('../models/Hotel');
const HotelGroup = require('../models/HotelGroup');

// Checks if the logged-in hotel manager is the manager for the requested hotel

const isHotelManager = async (req, res, next) => {
    try {
        const hotelId = parseInt(req.params.id, 10);
        const hotel = await Hotel.findByPk(hotelId);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        if (hotel.get('managerid') !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not the manager of this hotel' });
        }

        req.hotel = hotel;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// Checks if the logged-in group manager is the manager for the requested hotel group and that the hotel belongs to that group
const isGroupManager = async (req, res, next) => {
    try {
        const group = await HotelGroup.findOne({
            where: { ManagerID: req.user.id }
        });

        if (!group) {
            return res.status(403).json({ message: 'Forbidden: You are not a group manager' });
        }

        req.hotelGroup = group;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { isHotelManager, isGroupManager };