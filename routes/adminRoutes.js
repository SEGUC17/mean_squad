/**
 * Business Operator routes.
 */
var AdminController = require('../controllers/adminController');
var UserController = require('../controllers/userController');
var AdminMiddleware = require('../middlewares/adminMiddleware');
var AuthMiddleware = require('../middlewares/authMiddleware');
var express = require('express');
var router = express.Router();


/**
* A POST route responsible for registering an admin.
* @var /admin/register POST
* @name /admin/register POST
* @example The user requesting the route has to be logged in.
* @example The user requesting the route has to be of type 'Site Admin'.
* @example The route expects a body Object in the following format
* {
*     email,
*     username,
*     password,
*     confirmPassword
* }
* @example The route returns as a response an object in the following format
* {
*     msg: String showing a descriptive text,
*     errors: TODO
* }
*/
router.post('/register', AuthMiddleware, AdminMiddleware, AdminController.addType, UserController.register, AdminController.create);


/**
* A GET route responsible for viewing businesses waiting to be approved by admins.
* @var /admin/viewBusinessRequests GET
* @name /admin/viewBusinessRequests GET
* @example The user requesting the route has to be logged in.
* @example The user requesting the route has to be of type 'Site Admin'.
* @example The route expects a body Object in the following format
* {
*     TODO
* }
* @example The route returns as a response an object in the following format
* {
*     msg: String showing a descriptive text,
*     errors: TODO
* }
*/
router.get('/viewBusinessRequests', AuthMiddleware, AdminMiddleware, AdminController.viewBusinessRequests);

module.exports = router;
