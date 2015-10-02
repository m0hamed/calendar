"use strict"

var express = require('express');
var router = express.Router();

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');

router.post('/', function(req, res, next) {
  db.collection('events').insert(req.body, function(err, result) {
    if(result) res.send('Inserted ' + req.body.name+"\n result="+JSON.stringify(result));
  });
});

router.get('/', function(req, res, next) {
  db.collection('events').find().toArray(function(err, result) {
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
    {_id: ID(req.params.id)}, 
    req.body,
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
  var query = {};
  if (params.name) query.name = {$regex: new RegExp(".*" + params.name + ".*")};
  if (params.place) query.place = {$regex: new RegExp(".*" + params.place + ".*")};
  if (params.time) query.time = { $gte: params.time.after, $lte: params.time.before};
  return query
};


module.exports = router;
