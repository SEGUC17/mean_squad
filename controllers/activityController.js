var mongoose = require('mongoose');
var Activity = mongoose.model('Activity');

/**
 * @return array of all activities
 */
module.exports.viewActivities =
    function(req, res) {

        Activity.find().exec((err, activities) => {

            var activitiesList = {};
            var i = 0;
            if (err) {
                return res.json({
                    error: "Error"
                });
            }

            activities.forEach((activity) => {

                activitiesList[i++] = activity;

            });

            res.json({
                activitiesList,
                message: "Success"
            });
        });
    }