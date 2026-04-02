const express = require('express');
const router  = express.Router();
const HotelGroup = require('../models/HotelGroup');

// GET /api/hotelgroups - Public, used for role request dropdown
router.get('/', async (req, res) => {
    try {
        const groups = await HotelGroup.findAll({
            attributes: ['HotelGroupID', 'GroupName', 'GlobalChainCode'],
            order: [['GroupName', 'ASC']],
        });
        return res.status(200).json(groups);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving hotel groups', error });
    }
});

module.exports = router;