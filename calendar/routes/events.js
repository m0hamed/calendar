"use strict"

var express = require('express');
var router = express.Router({mergeParams:true});

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');

var _ = require('lodash');

var calendar_id;
// added this to make create event work but why.
var body;

router.all('*', function(req, res, next) {
  console.log("In the pre action filter");
  calendar_id = ID(req.params.cal_id);
  db.collection('calendars').find({_id: calendar_id})
    .toArray(function(err, result) {
      if(result.length==0) res.status(404).send('Calendar not found');
      else next();
    });
});

router.post('/', function(req, res, next) {
  console.log(req.params);
  console.log(req.body);
  db.collection('events').insert(_.extend(req.body, {"calendar_id": calendar_id}),
                                          function(err, result) {
    if(result) res.send('Inserted ' + req.body.nickname+"\n result="+JSON.stringify(result));
  });
});

router.get('/', function(req, res, next) {
  db.collection('events').find({calendar_id: calendar_id})
    .toArray(function(err, result) {
      res.send(result);
    });
});

router.post('/search', function(req, res, next) {
  var query = parse(req.body);
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
  if (params.time) query.time = { $gte: params.time.after, $lte: params.time.before};
  return query
};


module.exports = router;
