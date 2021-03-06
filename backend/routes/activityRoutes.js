var express = require('express');
var router = express.Router();
var passport = require("passport");
var activityController = require('../controllers/activityController');
var reservationController = require('../controllers/reservationController');


router.get('/reservation/:id', reservationController.getReservation);
/**
 * A GET route responsible for viewing an activity
 * @var /activity/{id} GET
 * @name /activity/{id} GET
 * @example The route returns as a response an object in the following format
 * {
 *     msg: String showing a descriptive text,
 *     data: {
 *         activity:
 *         {
 *             name: Activity title(String),
 *             description: Activity description(String),
 *             price: Activity price(Number),
 *             maxParticipants: Activity max participants(Number),
 *             minParticipants: Activity min participants(Number),
 *             minAge: Activity min age(Number),
 *             durationHours: Activity duration in hours(Number),
 *             durationMinutes: Activity duration in minutes(Number),
 *             avgRating: Activity average rating(Number),
 *             images: Activity images(String),
 *             activityType: Activity title(String),
 *             activitySlots: [
 *                         day: String,
 *                         slots: [{
 *                             time: String,
 *                             maxParticipants: Number,
 *                             currentParticipants: Number
 *                         }]] ,
 *             businessId:
 *             {
 *                 name: name of business(String),
 *                 description: description(String),
 *                 address: address(String),
 *                 latitude: location latitude(Number),
 *                 longitude: location longitude(Number),
 *                 contactInfo: contactInfo(String),
 *                 userId: User
 *             }
 *         }
 *     },
 *     errors: errors: [{type: String, msg: String}]
 * }
 */
router.get('/:id', activityController.show);

module.exports = router;
