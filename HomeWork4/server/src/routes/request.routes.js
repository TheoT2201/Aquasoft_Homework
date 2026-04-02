const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/requests - Get all requests (Administrator)
router.get('/', authenticate, authorize('Administrator'), requestController.getAllRequests);

// POST /api/requests - Create a new request (Hotel Manager or Group Manager)
router.post('/', authenticate, requestController.createRequest);

// GET /api/requests/pending - Get pending requests (Administrator)
router.get('/pending', authenticate, authorize('Administrator'), requestController.getPendingRequests);

// PUT /api/requests/:id/process - Process a request (Administrator)
router.patch('/:id/process', authenticate, authorize('Administrator'), requestController.processRequest);

module.exports = router;