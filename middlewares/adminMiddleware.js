/**
* This middleware validates that the user has a type 'Admin'
* @param  {HTTP}   req  The request object
* @param  {HTTP}   res  The response object
* @param  {Function} next Callback function that is called once the validation succeed
* @ignore
*/
module.exports = function(req, res, next)
{
   if(req.user.isAdmin())
   {
      next();
   }
   else
   {
      res.status(403).json
      ({
          status:'failed',
          message: 'Access denied'
      });
   }
};
