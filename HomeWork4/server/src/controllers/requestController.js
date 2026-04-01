const { sequelize } = require('../config/database');
const User = require('../models/User');
const Request = require('../models/Request');


// 1. Create a new request
const createRequest = async (req, res) => {
  try {
    // Extragem datele reale de care avem nevoie din frontend
    const { requestedRole, description, documentUrl } = req.body;
    const userId = req.user.id; // Asumând că middleware-ul de auth pune ID-ul aici

    // Sequelize folosește .create() direct
    const newRequest = await Request.create({
        UserID: userId,
        RequestedRole: requestedRole,
        Status: 'Pending', // Pus între ghilimele ca string, exact ca în ENUM
        Description: description,
        DocumentURL: documentUrl
    });

    return res.status(201).json({ message: "Cerere trimisă cu succes!", request: newRequest });
  } catch (error) {
    console.error("Eroare la creare request:", error);
    return res.status(500).json({ message: 'Eroare internă a serverului.' });
  } 
};

// 2. Get Pending Requests
const getPendingRequests = async (req, res) => {
  try {
    // În Sequelize, echivalentul lui .populate() este "include"
    const pendingRequests = await Request.findAll({ 
        where: { Status: 'Pending' },
        include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'email'] // Aducem doar ce ne interesează, nu și parola!
        }]
    });

    return res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Eroare la aducerea cererilor:", error);
    return res.status(500).json({ message: 'Eroare internă a serverului.' });
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
            return res.status(404).json({ message: "Cererea nu a fost găsită." });
        }

        if (requestToProcess.Status !== 'Pending') {
            await t.rollback();
            return res.status(400).json({ message: "Această cerere a fost deja procesată." });
        }

        
        requestToProcess.Status = action; 
        await requestToProcess.save({ transaction: t });

        if (action === 'Approved') {
            const userToUpgrade = await User.findByPk(requestToProcess.UserID, { transaction: t });
            
            if (!userToUpgrade) {
                await t.rollback();
                return res.status(404).json({ message: "Utilizatorul care a făcut cererea nu mai există." });
            }

            userToUpgrade.role = requestToProcess.RequestedRole;
            await userToUpgrade.save({ transaction: t });
        }

        await t.commit();

        return res.status(200).json({ 
            message: `Cererea a fost procesată cu statusul: ${action}` 
        });

    } catch (error) {
        await t.rollback();
        console.error("Eroare la procesarea cererii:", error);
        return res.status(500).json({ message: "Eroare la procesarea cererii. Modificările au fost anulate." });
    }
};

module.exports = { createRequest, getPendingRequests, processRequest };