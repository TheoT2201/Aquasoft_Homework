const User= require('../models/User');

// Get user by ID
exports.getUserById= async (req, res) => {
    try {
        const user= await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); 
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Change permissions by ID
exports.changePermissionsById= async (req, res) => {
    try {
        const user= await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.permissions= req.body.permissions;
        await user.save();
        res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
};