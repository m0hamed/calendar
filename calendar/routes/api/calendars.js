"use strict";

var express = require('express'),
    utils   = require('../components/utils.js'),
    router  = express.Router(),
    _       = require('lodash'),
    google  = require('../components/googleapi.js'),
    Promise = require("bluebird");

// TODO change this to proper db access
var mongo = Promise.promisifyAll(require('mongoskin'));
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://127.0.0.1:27017/calendar');
var calendars = db.collection('calendars');
var user;

// pre action handler to check the user authentication token 
// before all end points
// authentication token is expected as a query string auth_token
router.all('*', function(req, res, next) {
  var auth_token = req.query.auth_token;
  utils.get_user_from_token(auth_token).then((result) => {
    user = result;
    next();
  }).catch((err) => {
    // if authentication token not found, respond with json
    // with error field
    res.status(403).send({error: err});
  });
});

// pre action handler to check if the authenticated user has
// right to access the requested resource
router.all('*', function(req, res, next) {
  if (!req.params.id) {
    next();
    return;
  }
  utils.auth_user(user._id, req.params.id).then(function(isAuth) {
    if (isAuth) next();
    else res.status(403).send({error: 'Access Forbidden'});
  });
});

// end point to create a calender for the authenticated user
router.post('/', function(req, res, next) {
  calendars.insertAsync(set_user(req.body, user)).then((result) =>{
    res.send(result);
  }).catch((err)=> {
    res.status(400).send({error: 'Failed to insert ' + req.body.name+
                  '\n result='+JSON.stringify(result)});
  });
});

// end point to list calenders for the authenticated user
router.get('/', function(req, res, next) {
  calendars.find({"user_id": user._id}).toArray(function(err, result) {
    res.send(result);
  });
});

// end point to update a calendar with :id for the authenticated user
router.post('/:id', function(req, res, next) {
  console.log(req.params, req.body);
  calendars.update(
    {_id: ID(req.params.id)},
    set_user(req.body, user),
    function(err, result) {
      if (!err) res.send(result);
        else res.status(400).send({error: 'Error, Can\'t update: ' + err});
    });
});

// end point to delete a calendar with :id for the authenticated user
router.delete('/:id', function(req, res, next) {
  calendars.remove(
    {_id: ID(req.params.id)},
    function(err, result) {
      if(!err) res.send(result);
      else res.status(400).send({error: 'Error, Can\'t delete: ' + err});
    });
});

// extend calendar with user id 
function set_user(calendar, user) {
  return _.assign({}, calendar, {user_id: user._id});
}

module.exports = router;
