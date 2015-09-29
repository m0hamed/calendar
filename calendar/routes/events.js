var express = require('express');
var router = express.Router();

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');

router.post('/', function(req, res, next) {
  console.log(req.params);
  console.log(req.body);
  db.collection('events').insert(req.body, function(err, result) {
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
