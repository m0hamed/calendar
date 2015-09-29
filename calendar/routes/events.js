var express = require('express');
var router = express.Router({mergeParams:true});

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');

var _ = require('lodash');

var calendar_id;

router.all('*', function(req, res, next) {
  console.log("In the pre action filter");
  calendar_id = ID(req.params.cal_id);
  db.collection('calendars').find({_id: calendar_id})
    .toArray(function(err, result) {
      console.log(result);
      if(result.length==0) res.status(404).send('Calendar not found');
      else next();
    });
});

router.post('/', function(req, res, next) {
  console.log(req.params);
  console.log(req.body);
  body = req.body
  db.collection('events').insert(_.extend(body, {"calendar_id": calendar_id}),
                                          function(err, result) {
    if(result) res.send('Inserted ' + req.body.nickname+"\n result="+JSON.stringify(result));
  });
});

router.get('/', function(req, res, next) {
  db.collection('events').find().toArray(function(err, result) {
    res.send(result);
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


module.exports = router;
