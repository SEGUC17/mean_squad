var express = require('express');
var router = express.Router();
var clientController = require('../controllers/clientController');

// Posting a reservation
router.post('/reserve', clientController.getClient, clientController.ensureAuthenticated, clientController.makeReservation);

// Getting current Reservations
router.get('/reservations', clientController.getClient, clientController.ensureAuthenticated, clientController.viewReservations);

// Cancelling a reservation
router.post('/cancelReservation', clientController.getClient, clientController.ensureAuthenticated, clientController.cancelReservation);

module.exports = router; 