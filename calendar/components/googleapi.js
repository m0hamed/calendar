"use strict";

var google     = require('googleapis'),
    googleAuth = require('google-auth-library'),
    Promise    = require('bluebird'),
    fs         = require('fs'),
    _          = require('lodash'),
    db         = require('./db.js');

var SCOPE = 'https://www.googleapis.com/auth/calendar';

var CLIENT_ID     = "736239933078-gb14pldjeoklau6rptu1f30vmtnl8ov4.apps.googleusercontent.com", 
    CLIENT_SECRET = "hpp9EWJAggs6RYptSAhwDhCs",
    REDIRECT_URL  = "http://instacalendar.tz:3000/oauthcallback"

module.exports = {

  authorize: function(state, readonly) {
    var clientSecret = CLIENT_SECRET;
    var clientId = CLIENT_ID;
    var redirectUrl = REDIRECT_URL;
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    var promiseResult;

    return new Promise(function(resolve, reject) {
      if (state.user.token && !state.user.cred) {
        oauth2Client.getToken(state.user.token, function(err,tokens) {
          oauth2Client.setCredentials(tokens);
          updateCred(state.user, tokens).then(function () {
            resolve(oauth2Client);
          });
        });
      } else if (state.user.cred) {
        oauth2Client.setCredentials(JSON.parse(state.user.cred));
        resolve(oauth2Client);
      } else {
        var authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          state: JSON.stringify(state),
          scope: SCOPE,
        });
        reject({url: authUrl});
      }
    });
  },

  updateToken: function (user, token) {
    user.token = token;
    var id = user._id;
    delete user._id;
    return new Promise(function(resolve, reject) {
      db.users.updateById(id, user, function(err, result) {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  getEvents: function(auth) {
    var calendar = google.calendar('v3');
    return new Promise(function(resolve, reject) {
      calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        singleEvents: true
      }, function(err,response) {
        console.log(response);
        if (!err) resolve(response.items);
        else reject(err);
      });
    });
  },

  sendEvents: function(auth, events) {
    var calendar = google.calendar('v3');
    var promises = [];
    events.forEach(function(event) {
      promises.push(new Promise(function(resolve,reject) {
        var req = {
          auth: auth,
          calendarId: 'primary',
          resource: googlify(event)
        };
        var func = calendar.events.insert;
        if (event.google_id) {
          req.eventId = event.google_id;
          func = calendar.events.update;
        }
        func(req, function(err, googleEvent) {
          if (err) reject(err);
          else resolve({"data": degooglify(googleEvent), "_id": event._id});
        });
      }));
    });
    return Promise.all(promises);
  },

  degooglify: degooglify
};


function updateCred(user, cred) {
  user.cred = JSON.stringify(cred);
  var id = user._id;
  delete user._id;
  return new Promise(function(resolve, reject) {
    db.users.updateById(id, user, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  });
}


function googlify(event) {
  var googleEvent = {
    'start': {
      'dateTime': event.starts_at,
      'timeZone': 'Europe/Helsinki'
    },
    'end': {
      'dateTime': event.ends_at,
      'timeZone': 'Europe/Helsinki'
    },
    'location': event.place,
    'summary': event.name
  }
  return googleEvent;
}

function degooglify(googleEvent) {
  return {
    name: googleEvent.summary,
    place: googleEvent.location,
    starts_at: googleEvent.start.dateTime,
    ends_at: googleEvent.end.dateTime,
    google_id: googleEvent.id
  };
}

