var express = require('express');
var router = express.Router();

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://127.0.0.1:27017/calendar');
var calendars = db.collection('calendars');

router.post('/', function(req, res, next) {
  console.log(req.params);
  console.log(req.body);
  calendars.insert(req.body, function(err, result) {
    if(!err) res.send('Inserted ' + req.body.name+"\n result="
                        +JSON.stringify(result));
    else res.send('Failed to insert ' + req.body.name+
                  '\n result='+JSON.stringify(err)+"\n");
  });
});

router.get('/', function(req, res, next) {
  calendars.find().toArray(function(err, result) {
    res.send(result);
  });
});

router.post('/:id', function(req, res, next) {
  console.log(req.params, req.body);
  calendars.update(
    {_id: ID(req.params.id)},
    req.body,
    function(err, result) {
      if (!err) res.send('Updated ' + req.params.id + "\n result=" +
                         JSON.stringify(result));
      else res.send('Error, Can\'t update: ' + err);
    })
});

router.delete('/:id', function(req, res, next) {
  calendars.remove(
    {_id: ID(req.params.id)},
    function(err, result) {
      if(!err) res.send('Deleted ' + req.params.id+"\n result="+JSON.stringify(result));
      else res.send('Error, Can\'t delete: ' + err);
    });
});


module.exports = router;
