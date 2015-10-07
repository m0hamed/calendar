var Promise = require('bluebird');
var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');
var calendars = db.collection('calendars');

exports.auth_user = function(user_id, calendar_id) {
  return new Promise(function(resolve, reject) {
    calendars.find({"_id": calendar_id}).toArray(function(err, result) {
      if (err || !result.length) reject(err);
      else resolve(result[0].user_id == user_id);
    })
  });
}
