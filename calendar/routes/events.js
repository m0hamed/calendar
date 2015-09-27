var express = require('express');
var router = express.Router();

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://localhost:27017/calendar');

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.collection('events').find().toArray(function(err, result) {
    res.send(result);
  });
});

router.get('/insert/:name', function(req, res, next) {
  console.log(req.params)
  db.collection('events').insert({name:req.params.name}, function(err, result) {
    if(result) res.send('Inserted ' + req.params.name+"\n result="+JSON.stringify(result));
  });
});

router.get('/:id', function(req, res, next) {
  db.collection('events').remove(
    {_id: ID(req.params.id)},
    function(err, result) {
      if(!err) res.send('Deleted ' + req.params.id+"\n result="+JSON.stringify(result));
      else res.send('Error, Can\'t delete: ' + err);
    });
});

module.exports = router;
