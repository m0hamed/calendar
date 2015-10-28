"use strict"

var express = require('express'),
  utils   = require('../../components/utils.js'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  google = require('../../components/googleapi.js'),
  db = require('../../components/db.js');

var router = express.Router({mergeParams:true});

var BASE_ROUTE = 'http://instacalendar.tz';

var calendar_id;
var user;

//TODO promisify this file

// pre action handler to check authentication token for the
// user for all end points
// authentication token is expected as a query string auth_token
router.all('*', function(req, res, next) {
  var auth_token = req.query.auth_token;
  utils.get_user_from_token(auth_token).then((result) => {
    user = result;
    next();
  }).catch((err) => {
    res.status(403).send({error: err});
  });
});

// pre action handler to check if the authenticated user is authorized
// to access the requested resource.
router.all('*', function(req, res, next) {
  calendar_id = req.params.cal_id;
  utils.auth_user(user._id, calendar_id).then(function(isAuth) {
    if (!isAuth) throw 'Access Forbidden';
  }).then(() => {
    db.calendars.find({_id: db.ID(calendar_id)})
    .toArray(function(err, result) {
      if(result.length==0) res.status(404).send({error: 'Calendar not found'});
      else next();
    });
  }).catch((err) => res.status(400).send({error: err}));
});

// end point to create a new event for the current calendar
router.post('/', function(req, res, next) {
  db.events.
    insert(_.extend(req.body, {"calendar_id": calendar_id}),
           function(err, result) {
             if(result)
               res.send(result);
             else res.send({error: 'Can not insert event' + req.body.name});
           });
});

// sync endpoint to sync to remote
router.all('/syncfromremote', function(req, res, next) {
  google.authorize({url: req.originalUrl, "user": user}, true).then(function(auth) {
    return google.getEvents(auth);
  }).then(function(events) {
    events.forEach(function(googleEvent) {
      var event = _.extend(google.degooglify(googleEvent), {"calendar_id":
                           calendar_id});
      db.events.find({"calendar_id": calendar_id, "google_id":
                     event.google_id}).toArray(function(err, result) {
        if (!result.length)
          db.events.insert(event, function(err, result) {});
        else
          db.events.updateById(result[0]._id, event, function(err, result) {});
      });
    });
    if (req.query.redir)
      res.render('calendar', { title: '', calendar_id: calendar_id });
    else
      res.status(200).send('calendar synced');
  }).catch(function(error) {
    if (error.url)
      res.status(307).send(error.url);
    else
      db.users.updateById(user._id, { "username": user.username, "password":
                           user.password }, function() {
        res.status(417).send('That didn\'t work! try again.');
      });
  });
});

// sync endpoint to sync to remote
router.all('/synctoremote', function(req, res, next) {
  var events = [];
  db.events.findAsync({"calendar_id": calendar_id}).then(function(result) {
    events = result;
    return google.authorize({url: req.originalUrl, "user": user}, false);
  }).then(function(auth) {
    return google.sendEvents(auth, events);
  }).then(function(events) {
    events.forEach(function(event) {
      db.events.updateById(event._id, _.extend(event.data, {calendar_id: calendar_id}),
                           function(err, result) {console.log('update result', err, result);});
    });
    if (req.query.redir)
      res.render('calendar', { title: '', calendar_id: calendar_id });
    else
      res.status(200).send('calendar synced');
  }).catch(function(error) {
    if (error.url)
      res.status(307).send(error.url);
    else
      db.users.updateById(user._id, { "username": user.username, "password":
                           user.password }, function() {
        res.status(417).send('That didn\'t work! try again.');
      });
  });
});

// end point to list the events for the current calendar
router.get('/', function(req, res, next) {
  db.events.findAsync({calendar_id: calendar_id}).then(function(result) {
    res.send(result);
  });
});

// end point to send search data to query events
router.post('/search', function(req, res, next) {
  var query = parse(req.body);
  db.events.find(query).toArray(function(err, result) {
    if (!err) res.send(result);
    else res.status(400).send({error: "search failed: " + err});
  });
});

// end point to update and event with :id
router.post('/:id', function(req, res, next) {
  console.log(req.params, req.body);
  db.events.update(
    {_id: db.ID(req.params.id), calendar_id: calendar_id},
    _.extend(req.body, {calendar_id: calendar_id}),
    function(err, result) {
      if (!err) res.send(result);
      else res.status(400).send({error: 'Error, Can\'t update: ' + err});
    })
});

// end point to delete an event with :id
router.delete('/:id', function(req, res, next) {
  db.events.remove(
    {_id: db.ID(req.params.id)},
    function(err, result) {
      if(!err) res.send(result);
      else res.status(400).send({error: 'Error, Can\'t delete: ' + err});
    });
});


// should be moved to helper functions component
// should be extended with other field. ex: time, place
// a parsing function to parse search query
function parse(params) {
  var query = {"calendar_id": calendar_id};
  if (params.name) query.name = {$regex: new RegExp(".*" + params.name + ".*")};
  if (params.place) query.place = {$regex: new RegExp(".*" + params.place + ".*")};
  if (params.starts_at) query.starts_at = { $gte: params.starts_at.from, $lte: params.starts_at.to};
  return query
};


module.exports = router;
