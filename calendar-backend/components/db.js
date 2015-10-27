"use strict";

var mongo   = require('mongoskin'),
    Promise = require('bluebird'),
    db      = mongo.db('mongodb://127.0.0.1:27017/calendar');



module.exports = {
  calendars: promisifyFind('calendars'),
  users: promisifyFind('users'),
  sessions: promisifyFind('sessions'),
  events: promisifyFind('events'),
  ID: mongo.helper.toObjectID
};

function promisifyFind(col) {
  var collection = db.collection(col);
  collection.findAsync = function(data) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.find(data).toArray(function(err, result) {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
  return collection;
}
