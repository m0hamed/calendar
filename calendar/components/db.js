"use strict";

var mongo = require('mongoskin'),
    db    = mongo.db('mongodb://127.0.0.1:27017/calendar');

module.exports = {
  calendars: db.collection('calendars'),
  users: db.collection('users'),
  sessions: db.collection('sessions'),
  events: db.collection('events'),
  ID: mongo.helper.toObjectID
};
