var mongoose = require('mongoose'),
    Reservation = mongoose.model('Reservation');
    Activity = mongoose.model('Activity');
    User = mongoose.model('User');
    BusinessOperator = mongoose.model('BuisnessOperator');
    Business = mongoose.model('Business');
    Payment = mongoose.model('Payment');
    Promotion = mongoose.model('Promotion');
    var ObjectId = require('mongoose').Schema.ObjectId;



/*
4.2
This fucntion returns all the reservations that is related to the business operator
@return json {errors: [error]} or [{reservationObject}]
@fawzy
 */
module.exports.viewReservations = 
function(req,res) {
    userAuthChecker(req,res,function(businessId){
        Business.findById(businessId,function(error, business){
            if(error){
                    res.send(JSON.stringify(error)); 
                }
            Activity.find({businessId:business._id}, function(error, activities){
                if(error){
                    res.send(JSON.stringify(error)); 
                }
                viewReservationsHelper(error, activities, res);
            })
        })

    })
}


/*
4.3
This fucntion returns all the Activities that is related to the business operator
@return json {errors: [error]} or [{ActivityObject}]
@fawzy
 */
module.exports.viewActivities = 
function(req, res){
    userAuthChecker(req,res,function(businessId){
        Business.findById(businessId,function(error, business){
            Activity.find({businessId:business._id}, function(error, activities){
                if(error){
                    res.send(JSON.stringify(error)); 
                } else{
                    res.send(JSON.stringify(activities)); 
                }
            })
        })

    })    
}


/*
4.4
This fucntion returns all the Payments that is related to the business operator's business
@return json {errors: [error]} or [{PaymentObject}]
@fawzy
 */
module.exports.viewPayments = 
function(req, res) {
    userAuthChecker(req,res,function(businessId){
         Business.findById(businessId,function(error, business){
            if(error){
                    res.send(JSON.stringify(error)); 
                }
            Activity.find({businessId:business._id}, function(error, activities){
                if(error){
                    res.send(JSON.stringify(error)); 
                }
                viewPaymentsHelper(error, activities, res);
            })
        })

    })
   
}


/*
4.5
This fucntion returns all the Promotions that is related to the business operator's business
@return json {errors: [error]} or [{Promotion}]
@fawzy
 */
module.exports.viewPromotions = 
function(req, res) {
    userAuthChecker(req,res,function(businessId){
         Business.findById(businessId,function(error, business){
            if(error){
                    res.send(JSON.stringify(error)); 
                }
            Activity.find({businessId:business._id}, function(error, activities){
                if(error){
                    res.send(JSON.stringify(error)); 
                }
                viewPromotionHelper(error, activities, res);
            })
        })

    })   
}


/*
4.6
This fucntion creates a reservation on behalf of the user
@params its takes a form that contains all fields of Reservation Object
@return json {errors: [error]} or {ReservationObjectCreated}
@fawzy
 */
module.exports.createReservation = 
function(req, res) {
    userAuthChecker(req,res,function(businessId){
        Reservation.create(req.body,function(error, reservation){
            if(error){
                res.send(JSON.stringify(error)); 
            }
            res.send(JSON.stringify(reservation)); 
        })
    })
}


/*
This fucntion get the the reservation belonging to the list of activities
@params error,activities,res
@return json {errors: [error]} or [{ReservationObject}]
@fawzy
 */
function viewReservationsHelper(error, activities, res){    
    if(error){
        res.send(JSON.stringify(error));
    }
    else{
        var activitiesId = returnIdsOnly(activities);
        Reservation.find(function(error, reservations){
            if(error){
                res.send(JSON.stringify(error)); 
            }
            var resertionsBelongToOperator = filterEntityByActivity(reservations, activitiesId);
            res.send(JSON.stringify(resertionsBelongToOperator)); 
        })
    }
}


/*
This fucntion joins any model with the model activity and returns the list values of 
the other model after joining
@params entity -Which is the model values- , activitiesId - List of activities Ids -
@return [modelObject]
@fawzy
 */
function filterEntityByActivity(entity, activitiesId){
    var entityBelongToOperator = Array();
    for (i = 0; i < entity.length; i++) { 
        var entityActivityId = entity[i].activityId;
        if(activitiesId.indexOf(String(entityActivityId))>=0){
            entityBelongToOperator.push(entity[i]);
        }
    }

    return entityBelongToOperator;
}


/*
This fucntion takes a list of objects and returns it coresponding list of ids
@params modelArray
@return [idOfObject]
@fawzy
 */
function returnIdsOnly(modelArray){
    var ids = Array()
    for (i = 0; i < modelArray.length; i++) { 
        ids.push(String(modelArray[i]._id));
    }
    return ids;
}


/*
This fucntion is helper for the viewPayment function and returns payment belonging to
list of activities
@params error,activities,res
@return json {errors: [error]} or [{paymentObject}]
@fawzy
 */
function viewPaymentsHelper(error, activities, res){    
    if(error){
        res.send(JSON.stringify(error));
    } else{
        var activitiesId = returnIdsOnly(activities);
        Reservation.find(function(error, reservations){
            if(error){
                res.send(JSON.stringify(error)); 
            }
            var resertionsBelongToOperator = filterEntityByActivity(reservations, activitiesId);
            Payment.find(function(error, payments){
                if(error){
                    res.send(JSON.stringify(error)); 
                } else{
                    var reservationsId = returnIdsOnly(resertionsBelongToOperator);
                    var paymentsBelongToOperator = filterPaymentByResrvetions(payments, reservationsId);
                    res.send(JSON.stringify(paymentsBelongToOperator)); 
                }      
            })
        })
    }
}


/*
This function joins the payments with the reservation by the ids and returns list of payment object
@params error,activities,res
@return json {errors: [error]} or [{paymentObject}]
@fawzy
 */
function filterPaymentByResrvetions(payments, reservationsId){
    var paymentsBelongToOperator = Array();
    for (i = 0; i < payments.length; i++) { 
        var paymentReservationId = payments[i].reservationId;
        if(reservationsId.indexOf(String(paymentReservationId))>=0){
            paymentsBelongToOperator.push(payments[i]);           
        }
    }
    return paymentsBelongToOperator;
}


/*
This fucntion is helper for the viewPromotions function and returns promotions belonging to
list of activities
@params error,activities,res
@return json {errors: [error]} or [{promotionObject}]
@fawzy
 */
function viewPromotionHelper(error, activities, res){  
    if(error){
        res.send(JSON.stringify(error));
    } else{
        var activitiesId = returnIdsOnly(activities);
        Promotion.find(function(error, promotions){
            if(error){
                res.send(JSON.stringify(error)); 
            }
            var promotionsBelongToOperator = filterEntityByActivity(promotions, activitiesId);
            res.send(JSON.stringify(promotionsBelongToOperator)); 
        })
    }
}


/*This fucntion checks if user the Autherized as a BuisnessOperator and then preforms a callback function
@params req,res,callBack
@return json {errors: [error]} or void
@fawzy */
function userAuthChecker(req, res, callBack){
    var user = req.user;
    if(user != undefined){
        if(user.userType == "business operator"){
            BusinessOperator.findOne({userId:user._id},function(error, businessOperator){
                if(error){
                    res.send(JSON.stringify(error)); 
                }
                var bussinessId = businessOperator.businessId;
                callBack(bussinessId); 
            })
        } else{
            res.send(JSON.stringify({"error":"Unauthorized to access please login as businessOperator"})); 
        }
    } else{
        res.send(JSON.stringify({"error":"Unauthorized to access please login"})); 
    }
}













//function fillDatabase(){
    // var user = User();
    // user.username = "ThemePark"
    // user.email = "aa@h.ThemePark"
    // user.password = "12345"
    // user.name = "ThemePark"
    // User.create(user,function(error,user){
    //     if(error){
    //         console.log(error)
    //     }else{
    //     var business = Business()
    //     business.name = "ThemePark"
    //     business.userId = user._id
    //     Business.create(business,function(error,business){
    //         if(error){
    //             console.log(error)
    //         }else{  
    //                 var activity = Activity()
    //                 activity.name = "Activity3"
    //                 activity.businessId = business._id
    //                 Activity.create(activity,function(error,activity){
    //                     var reservation = Reservation()
    //                     reservation.totalPrice = 11
    //                     reservation.details = "Detail5"
    //                     reservation.activityId = activity._id
    //                     Reservation.create(reservation) 
    //                 })   

                
    //         }
            
    //     })
    //     }
        

    // }) 


    // var promotion = Promotion()
    //                     promotion.details = "promotions8"
    //                     promotion.activityId = "58dc32700ac711314c1567d2"
    //                     Promotion.create(promotion)   

//}
