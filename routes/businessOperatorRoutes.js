/**
 * Business Operator routes.
 */
var BusinessOperatorController = require('../controllers/businessOperatorController');
var UserController = require('../controllers/userController');
var BusinessMiddleware = require('../middlewares/businessMiddleware');
var AuthMiddleware = require('../middlewares/authMiddleware');
var express = require('express');
var router = express.Router();


/**
* A POST route responsible for register a new business operator.
* @var /businessOperator/register POST
* @name /businessOperator/register POST
* @example The user requesting the route has to be logged in.
* @example The user requesting the route has to be of type 'Business'.
* @example The route expects a body Object in the following format
* {
*  email,
*  username,
*  password,
*  confirmPassword
* }
* @example The route returns as a response an object in the following format
* {
*   status: succeeded/failed,
*   message: String showing a descriptive text,
*   errors:
*   [
*    {
*       param: the field that caused the error,
* 	    value: the value that was provided for that field,
* 	    msg: the type of error that was caused (one of these ['required', 'not valid'])
* 	 }, {...}, ...
*   ]
* }
*/
router.post('/register', AuthMiddleware, BusinessMiddleware, BusinessOperatorController.addType, UserController.register, BusinessOperatorController.create);

module.exports = router;
