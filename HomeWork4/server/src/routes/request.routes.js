const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

//Ruta pentru creat request uri
router.post('/', authenticate, requestController.createRequest);
//Ruta pentru obtinerea requesturilor in asteptare
router.get('/pending', authenticate, authorize('Administrator'), requestController.getPendingRequests);
//Ruta pentru procesarea unui request (acceptare sau respingere)
router.put('/:id/process', authenticate, authorize('Administrator'), requestController.processRequest);

module.exports = router;