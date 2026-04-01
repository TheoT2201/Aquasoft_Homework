const { sequelize } = require('../config/database');
const User = require('../models/User');
const Request = require('../models/Request');


// Create a new request
const createRequest = async (req, res) => {
  try {
    const { requestedRole, description, documentUrl } = req.body;
    const userId = req.user.id;

    const newRequest = await Request.create({
        UserID: userId,
        RequestedRole: requestedRole,
        Status: 'Pending',
        Description: description,
        DocumentURL: documentUrl
    });

    return res.status(201).json({ message: "Request created successfully!", request: newRequest });
  } catch (error) {
    console.error("Error creating request:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  } 
};

// Get Pending Requests
const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await Request.findAll({ 
        where: { Status: 'Pending' },
        include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'email']
        }]
    });

    return res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


const processRequest = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const requestId = req.params.id; 
        const { action } = req.body;

        if (!['Approved', 'Rejected'].includes(action)) {
            await t.rollback();
            return res.status(400).json({ message: "Action must be Approved or Rejected." });
        }

        const requestToProcess = await Request.findByPk(requestId, { transaction: t });

        if (!requestToProcess) {
            await t.rollback(); 
            return res.status(404).json({ message: "Request not found." });
        }

        if (requestToProcess.Status !== 'Pending') {
            await t.rollback();
            return res.status(400).json({ message: "This request has already been processed." });
        }

        
        requestToProcess.Status = action; 
        await requestToProcess.save({ transaction: t });

        if (action === 'Approved') {
            const userToUpgrade = await User.findByPk(requestToProcess.UserID, { transaction: t });
            
            if (!userToUpgrade) {
                await t.rollback();
                return res.status(404).json({ message: "The user who made the request no longer exists." });
            }

            userToUpgrade.role = requestToProcess.RequestedRole;
            await userToUpgrade.save({ transaction: t });
        }

        await t.commit();

        return res.status(200).json({ 
            message: `Request has been processed with status: ${action}` 
        });

    } catch (error) {
        await t.rollback();
        console.error("Error processing request:", error);
        return res.status(500).json({ message: "Error processing request. Changes have been rolled back." });
    }
};

module.exports = { createRequest, getPendingRequests, processRequest };