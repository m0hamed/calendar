"use strict"

var express = require('express');
var router = express.Router({mergeParams:true});
var utils = require('../components/utils.js');

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');

var _ = require('lodash');

var calendar_id;
var user;

router.all('*', function(req, res, next) {
  var auth_token = req.query.auth_token;
  console.log(auth_token);
  db.collection('sessions').find({token: auth_token})
    .toArray(function(err, result) {
      console.log(result);
      if(result.length==0) res.status(403).send('Invalid authentication token used!' + 
                                               'Are you trying something nasty?');
      else {
        user = result[0];
        next();
      }
    });
});

router.all('*', function(req, res, next) {
  console.log("In the pre action filter");
  calendar_id = ID(req.params.cal_id);
  utils.auth_user(user._id, calendar_id).then(function(isAuth) {
    if (isAuth) {
      db.collection('calendars').find({_id: calendar_id})
      .toArray(function(err, result) {
        console.log(result);
        if(result.length==0) res.status(404).send('Calendar not found');
        else next();
      });
    } else res.status(403).send('Access Forbidden');
    });
});

router.post('/', function(req, res, next) {
  console.log(req.params);
  console.log(req.body);
  db.collection('events').
    insert(_.extend(req.body, {"calendar_id": calendar_id}),
           function(err, result) {
             if(result)
               res.send('Inserted ' + req.body.nickname+"\n result="+JSON.stringify(result));
             else res.send('Can not insert event' + req.body.name);
           });
});

router.get('/', function(req, res, next) {
  db.collection('events').find({calendar_id: calendar_id})
    .toArray(function(err, result) {
      res.send(result);
    });
});

router.post('/search', function(req, res, next) {
  var query = parse(req.body.query);
  db.collection('events').find(query).toArray(function(err, result) {
    if (!err) res.send(result);
    else res.send("search failed: " + err);
  });
});

router.post('/:id', function(req, res, next) {
  console.log(req.params, req.body);
  db.collection('events').update(
    {_id: ID(req.params.id), calendar_id: calendar_id},
    _.extend(req.body, {calendar_id: calendar_id}),
    function(err, result) {
      if (!err) res.send('Updated ' + req.params.id + "\n result=" +
                         JSON.stringify(result));
      else res.send('Error, Can\'t update: ' + err);
    })
});

router.delete('/:id', function(req, res, next) {
  db.collection('events').remove(
    {_id: ID(req.params.id)},
    function(err, result) {
      if(!err) res.send('Deleted ' + req.params.id+"\n result="+JSON.stringify(result));
      else res.send('Error, Can\'t delete: ' + err);
    });
});


// should be moved to helper functions component
// should be extended with other field. ex: time, place
function parse(params) {
  var query = {"calendar_id": calendar_id};
  if (params.name) query.name = {$regex: new RegExp(".*" + params.name + ".*")};
  if (params.place) query.place = {$regex: new RegExp(".*" + params.place + ".*")};
  if (params.starts_at) query.starts_at = { $gte: params.starts_at.from, $lte: params.starts_at.to};
  return query
};


module.exports = router;
