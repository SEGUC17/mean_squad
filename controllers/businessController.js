/**
 * @module Business Controller
 * @description The controller that is responsible of handling admin's requests
 */

var mongoose = require('mongoose');
var	Business = mongoose.model('Business');
var	Activity = mongoose.model('Activity');
var	Promotion = mongoose.model('Promotion');
var businessOperator = require('./businessOperatorController.js');


/**
  A function responsible for register a new business operator.
  @param email,username, password, confirmPassword
  @carsoli
 */
module.exports.addType = function(req, res, next)
{
  req.body.userType = 'Business';
  next();
}

/**
    a function responsible for creating a new business operator
    this gets called from the User.register
    @params user
    @carsoli
 */
module.exports.create = function(req, res, next)
{
    var user = req.body.newUser;
    var business = new Business(
    {
            userId: user._id,
            name: req.body.name,
            description: req.body.description,
            address: req.body.address,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            avgRating: req.body.avgRating, 
            contactInfo: req.body.contactInfo
    });
    business.save((err, result)=> {
        if(err)
        {
            console.log('Error: ' + err.message);
            return res.json({error: err}); 
        }
        if(!result)
        {
            console.log("None saved");
            return res.json({message : "no result saved"}); 
        }
        else 
        {
            console.log("Business Saved Successfully");
            return res.json({message: "Business Saved Successfully"});
        }
    }); 
};


/** 
    @description: queries on the userId passed in the body and returns it /    appends businessId in the body 
    @param req,res 
    @returns void
    @carsoli
*/
module.exports.appendBusiness = function(req, res) 
{
        var userId = req.user._id; 
        Business.findOne({userId: userId},(err, result)=> {
            if(err || (!result)) 
            {
                //console.error(err.stack);
                return res.json({error: err});
            }
            req.body.business = result; 
            next();
        });
} 

/*
    returns an array of the activities for that business or an err message if none exist
	@params req, res, next 
	@return json {success: bool, message: string} or object resulting from query 
	@carsoli
*/
module.exports.viewMyActivities = (req,res) =>{  
    var businessId= req.body.business._id; 
        Activity.getActivityByBusinessId(businessId, (err, result)=>{
            if(err)
            {
                console.error(err.stack);
                return res.json({error: err});
            }
            if(!result) 
            {
                return res.json({error: new Error("No Activties For your business")});
            }
            else 
            {
                console.log("list of activitites: " + result);
                return res.json(result);
            }
        });
}


/**
    @description: adds an activity to the Activity model using the business' id
	@param: req, res, next 
	@return json {message: string}
	@carsoli
*/
module.exports.addActivity = (req,res)=> {
   var businessId= req.body.business._id; 
   let newActivity = {
                businessId: businessId,
                name: req.body.name ,
                description: req.body.description , 
                price: req.body.price ,
                maxParticipants: req.body.maxParticipants ,
                minParticipants: req.body.minParticipants ,
                minAge: req.body.minAge, 
                durationHours: req.body.durationHours ,
                durationMinutes: req.body.durationMinutes ,
                avgRating: req.body.avgRating, 
                images: req.body.images ,
                activityType: req.body.activityType
            }

        Activity.createActivity(newActivity,(err, result)=> {
            if(err)
            {
                console.error(err.stack);
                return res.json({error: err});
            }
            if(!result){
                console.log("no object was retrieved from adding to the db");
                return res.json({error: new Error("No activity was added")});
            }
            else
            {
                console.log("Added Activity: " + result);
                return res.json({message: "Activity Added Successfully"}); 
            }
        });    
 }
 

/**
    @description: removes *one* specified activity that belongs to the business completely from the db
	@param: req, res, next 
	@return json {message: string}
	@carsoli
*/
module.exports.removeActivity = (req,res) =>{
    var activityId = req.body.activityId; //assuming that's what we call it --> Activity ObjectId 
    var businessId= req.body.business._id; 

    Activity.getActivityId(activityId, (err, result)=> 
        {
            if(err)
            {
                console.error(err.stack);
                return res.json({error: err});
            }
            if(!result) 
            {
                console.log("no activity exists with that id");
                return res.json({error: new Error("No Activity Object Retrieved")});
            }
            else 
            {
                console.log("activity that matches input activityId: " + result);
                if(businessId == result.businessId)
                {
                    Activity.deleteActivity(activityId, (err, result)=>{
                        if(err)
                        {
                            console.error(err.stack);
                            return res.json({error: err});
                        }

                        console.log("Removed activity: " + result);
                        return res.json({success: true, message: "Activity Removed Successfully"});     
                    });
                }
                else 
                {
                    console.log("user not authorized to perform this deletion");
                    return res.json({success: false, message: "Not authorized to Perform this deletion"});
                }
            }
        });
}


/** 
    @description updates the details of *one* activity that belongs to the business
	@param req, res, next 
	@return json {success: bool, message: string}
	@carsoli
*/
module.exports.editActivity = (req,res) => {
    var activityId = req.body.activityId;

    businessOperator.userAuthChecker(req, res, (businessId)=> {
        Activity.getActivityId(activityId, (err, result)=> {
            if(err)
            {
                console.error(err.stack);
                return res.json({error: err});
            }
            if(!result)
            {
                console.log("no activity exists with that id");
                return res.json({error: new Error("No Activity To Edit")});
            }
            else 
            {
                console.log(result);
                if(businessId == result.businessId)
                {//edit this to be a set query 
                    let editedActivity = 
                    {
                        $set:{
                            name: req.body.name ,
                            description: req.body.description , 
                            price: req.body.price ,
                            maxParticipants: req.body.maxParticipants ,
                            minParticipants: req.body.minParticipants ,
                            minAge: req.body.minAge, 
                            durationHours: req.body.durationHours ,
                            durationMinutes: req.body.durationMinutes ,
                            avgRating: req.body.avgRating, 
                            images: req.body.images ,
                            activityType: req.body.activityType 
                        }
                    }
                
                    Activity.updateActivity(activityId, editedActivity, (updatedErr, updatedRes)=>
                    {
                        if(updatedErr)
                        {
                            console.error(updatedErr.stack);
                            return res.json({error: updatedErr});
                        }
                        if(!updatedRes)
                        {
                            console.log("Activity not updated");
                            return res.json({error: new Error("No Activity was updated")});
                        }
                        else 
                        {
                            console.log("Updated Activity: " + updatedRes);
                            return res.json({message: "Activity Updated Successfully"}); 
                        }
                    });
                }
                else 
                {
                    console.log("you're not authorized to perform this update");
                    return res.json({message: "Not authorized to Update this Activity"});
                }
            }
        });
    });
}


/**
    @description views a list of Promotions offered by the business
	@param req, res, next 
	@return json {success: bool, message: string} or object resulting from query 
	@carsoli
*/
module.exports.viewMyPromotions= (req, res) => {
    var output =[]; 
    var businessId= req.body.business._id; 
    
    Activity.getActivityByBusinessId(businessId, (err, activityList)=>
    {
        if(err)
        {
            return res.json({error: err});
        }
        if(!activityList)
        {
            return res.json({error: activityList , message: "No Activities Available"});
        }
        else 
        {
            console.log(activityList);
            var i =0;
            activityList.forEach((activity)=>
            {
                Promotion.findPromotionByActivityId(activity._id, (promotionErr, promotionRes) => {
                    if(promotionErr)
                    {
                        console.error(promotionErr.stack);
                        return res.json({error: promotionErr});
                    }
                    if(promotionRes)
                    {
                        console.log(promotionRes);
                        activity.promotions = promotionRes;
                        output.push(activity);
                    }
                    i++;
                    if(i>=activityList.length) 
                    {
                        return res.json(output); 
                    }
                }); // ends findPromotionByActivityId
            });
        }
    });
   }

/**
 * A function responsible for deleting a business.
 * @params id
 * @khattab
 */
module.exports.delete = function(req, res, next)
{
  req.checkParams('id', 'required').notEmpty();

  Business.findById(req.params.id).then(function(business)
  {
    if(business)
    {
      business.remove().then(function()
      {
        res.status(200).json
        ({
          status: 'succeeded',
          message: 'Business was successfully deleted'
        });

        next();
      }).catch(function(err)
      {
        res.status(500).json
        ({
          status:'failed',
          message: 'Internal server error'
        });

        next();
      });
    }
    else
    {
      res.status(404).json
      ({
        status:'failed',
        message: 'Business was not found'
      });

      next();
    }
  }).catch(function(err)
  {
    res.status(500).json
    ({
      status:'failed',
      message: 'Internal server error'
    });

    next();
  });
};
