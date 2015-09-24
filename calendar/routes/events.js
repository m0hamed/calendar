var express = require('express');
var router = express.Router();

var db = require('mongoskin').db('mongodb://localhost:27017/calendar');

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.collection('events').find().toArray(function(err, result) {
    res.send(result);
  });
});

router.get('/insert/:name', function(req, res, next) {
  db.collection('events').insert({name:req.params.name}, function(err, result) {
    if(result) res.send('Inserted ' + req.params.name+"\n result="+JSON.stringify(result));
  });
});

router.get('/:id', function(req, res, next) {
  db.collection('events').remove(
    {_id: db.ObjectID.createFromHexString(req.params.id)},
    function(err, result) {
      if(!err) res.send('Deleted ' + req.params.id+"\n result="+JSON.stringify(result));
    });
});

module.exports = router;
