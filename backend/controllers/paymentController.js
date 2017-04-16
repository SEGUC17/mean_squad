var stripe = require("stripe")("sk_test_nmXoMnH2qvx1taOCMpDbZKSj");
var Payment = require("../models/payment");
var strings = require("./helpers/strings");
var Reservation = require("../models/reservation");
var nodemailer = require('nodemailer');
var email = require('../config/email');

var smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: email.email,
        pass: email.password
    }

});

/**
 * create a stripe charge, create a payment in the database
 * and update the reservation's status to Confirmed Then
 * send Payment details to the Client
 * 
 * @param {String} req.body.stripetoken
 * @param {Number} req.body.amount
 * @param {String} req.body.reservationId
 * 
 * @return {json} {errors:[{error}],msg}
 */

module.exports.charge = [

    updateReservationStatus,
    makeCharge,
    createPayment,
    sendPaymentDetailsToClient,
    getBusinessEmail,
    sendPaymentDetailsToBusiness
]

/**
 * Update reservation status to Confirmed
 * 
 * @param {any} reservationId 
 */
function updateReservationStatus(req, res, next) {
    // Token is created using Stripe.js or Checkout!
    // Get the payment token submitted by the form:
    var token = req.body.stripeToken;
    var amount = req.body.amount;
    var reservationId = req.body.reservationId;

    var query = {
        _id: reservationId,
        confirmed: "Pending"
    };

    var newData = {
        // Update
        confirmed: strings.RESERVATION_STATUS_CONFIRMED
    }

    Reservation.findById(reservationId, (err, reservation) => {
        if (err) {
            return res.json({
                errors: [{
                    type: strings.DATABASE_ERROR,
                    msg: err.message
                }]
            });
        }
        if (!reservation) {
            return res.json({
                errors: [{
                    type: strings.DATABASE_ERROR,
                    msg: "Nothing to Update."
                }]
            });
        }

        if (reservation.confirmed != strings.RESERVATION_STATUS_PENDING) {
            return res.json({
                errors: [{
                    type: strings.PAYMENT_ERROR,
                    msg: "Reservation is either Confirmed, Cancelled or Expired."
                }]
            });
        }
        reservation.confirmed = strings.RESERVATION_STATUS_CONFIRMED;
        reservation.save((err, reservation) => {
            if (err) {
                return res.json({
                    errors: [{
                        type: strings.DATABASE_ERROR,
                        msg: err.message
                    }]
                })
            }
            req.body.reservation = reservation;
            next()
        })
    });
}

function makeCharge(req, res, next) {

    var chargeInfo = {
        amount: req.body.amount,
        currency: "usd",
        description: "Example charge",
        source: req.body.stripeToken,
    }

    // Charge the user's card:
    var charge = stripe.charges.create(chargeInfo, (err, charge) => {
        if (err) {
            return res.json({
                errors: [{
                    type: strings.PAYMENT_ERROR,
                    msg: err.message,
                }]
            })

        } else {

            next();
        }

    });

}

/**
 * creates a database entry for the payment
 * 
 * @param {String} reservationId 
 * @param {Number} amount 
 * @param {function} callback 
 */
function createPayment(req, res, next) {
    var payment = new Payment({
        amount: req.body.amount,
        reservationId: req.body.reservationId
    });
    payment.save((err, payment) => {

        if (err) {
            return res.json({
                errors: [{
                    type: strings.DATABASE_ERROR,
                    msg: err.message
                }]
            });
        }

        if (!payment) {
            return res.json({
                errors: [{
                    type: strings.DATABASE_ERROR,
                    msg: 'Error Saving Payment.'
                }]
            });
        }

        req.body.payment = payment;
        next();

    });
}

/**
 * Send detials of the payment to the client
 * 
 * @param {any} req 
 * @param {any} res 
 */
function sendPaymentDetailsToClient(req, res, next) {



    var mailOptions = {
        to: req.user.email,
        from: 'payment@noreply.com',
        subject: 'Reservation Confirmation',
        text: 'Reservation Confirmed Successfully.\n\n' +
            'Amount Paid: ' + req.body.amount + '\n' +
            'Reservation Details: ' + req.body.reservation.details + '\n' +
            'Number of Participants: ' + req.body.reservation.countParticipants + '\n' +
            'Reservation Date: ' + req.body.reservation.date + '\n\n' +
            'Please keep this email as a proof of your payment.\n\n'

    };

    smtpTransport.sendMail(mailOptions, function (err) {

        if (err)
            return res.json({
                errors: [{
                    type: Strings.INTERNAL_SERVER_ERROR,
                    msg: 'Error sending Invoice mail. Please try again later.'
                }]
            });
        next();


    });
}

/**
 * Send detials of the payment to the client
 * 
 * @param {any} req 
 * @param {any} res 
 */
function sendPaymentDetailsToBusiness(req, res) {

    var mailOptions = {
        to: req.body.businessEmail, 
        from: 'payment@noreply.com',
        subject: 'Online Payment Added to your balance',
        text: 'An Online Payment has been added to your balance.\n\n' +
            'Amount Paid: ' + req.body.amount + '\n' +
            'Reservation Details: ' + req.body.reservation.details + '\n' +
            'Number of Participants: ' + req.body.reservation.countParticipants + '\n' +
            'Reservation Time: ' + req.body.reservation.time + '\n' +
            'Payment Id: ' + req.body.payment._id + '\n'+
            'Current Balance: ' + req.body.businessBalance+ '\n\n'

    };

    smtpTransport.sendMail(mailOptions, function (err) {

        if (err)
            return res.json({
                errors: [{
                    type: Strings.INTERNAL_SERVER_ERROR,
                    msg: 'Error sending Invoice mail. Please try again later.'
                }]
            });
        return res.json({
            msg: 'An email has been sent with the info of your payment.'
        })

    });
}

function getBusinessEmail(req, res, next) {

    Reservation.findById(req.body.reservationId).populate('activityId').exec((err, reservation) => {
        reservation.activityId.populate('businessId', (err) => {
            if (err) {
                return res.json({
                    errors: [{
                        type: strings.DATABASE_ERROR,
                        msg: err.message
                    }]
                });
            }
            reservation.activityId.businessId.populate('userId', (err) => {
                if (err) {
                    return res.json({
                        errors: [{
                            type: strings.DATABASE_ERROR,
                            msg: err.message
                        }]
                    });
                }

                req.body.businessEmail = reservation.activityId.businessId.userId.email;
                
                reservation.activityId.businessId.balance = reservation.activityId.businessId.balance + req.body.payment.amount;
                reservation.activityId.businessId.save((err) => {
                    if (err) {
                        return res.json({
                            errors: [{
                                type: strings.DATABASE_ERROR,
                                msg: err.message
                            }]
                        });
                    }
                    req.body.businessBalance = reservation.activityId.businessId.balance;
                    next();
                })

            })
        });
    })
}