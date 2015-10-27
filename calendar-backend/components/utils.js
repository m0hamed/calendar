/* Generic module with some utility functions */

var Promise = require('bluebird');

var mongo = Promise.promisifyAll(require('mongoskin'));
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');
var calendars = db.collection('calendars');

// check if user is authorized to access the requested calendar
// functon is promisified to access 
exports.auth_user = function(user_id, calendar_id) {
  return new Promise(function(resolve, reject) {
    calendars.find({"_id": ID(calendar_id)}).toArray(function(err, result) {
      if (err || !result.length) reject("Calendar not found");
      else resolve(result[0].user_id.toString() == user_id.toString());
    })
  });
}

// find user belonging to the session of the given authentication
// token
exports.get_user_from_token = function (auth_token) {
  return db.collection('sessions').
    findOneAsync({token: auth_token}).then(
      function(result) {
        if(!result) throw 'Invalid authentication token used! ' +
           'Are you trying something nasty?';
        return result;
      }).then((token) => {
        return db.collection('users').findOneAsync({_id: ID(token.user_id)}).
          then((result)=> {
            if(!result) throw 'Invalid authentication token used! ' +
               'Are you trying something nasty?';
            return result;
        })
      });
}
