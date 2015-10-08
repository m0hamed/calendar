var express = require('express');
var utils = require('../components/utils.js');
var router = express.Router();
var _ = require('lodash');

var Promise = require("bluebird");

var mongo = Promise.promisifyAll(require('mongoskin'));
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://127.0.0.1:27017/calendar');
var calendars = db.collection('calendars');
var user;

router.all('*', function(req, res, next) {
  var auth_token = req.query.auth_token;
  utils.get_user_from_token(auth_token).then((result) => {
    user = result;
    next();
  }).catch((err) => {
    res.status(403).send({error: err});
  });
});

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

router.post('/', function(req, res, next) {
  calendars.insertAsync(set_user(req.body, user)).then((result) =>{
    res.send(result);
  }).catch((err)=> {
    res.status(400).send({error: 'Failed to insert ' + req.body.name+
                  '\n result='+JSON.stringify(result)});
  });
});

router.get('/', function(req, res, next) {
  calendars.find({"user_id": user._id}).toArray(function(err, result) {
    res.send(result);
  });
});

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

router.delete('/:id', function(req, res, next) {
  calendars.remove(
    {_id: ID(req.params.id)},
    function(err, result) {
      if(!err) res.send(result);
      else res.status(400).send({error: 'Error, Can\'t delete: ' + err});
    });
});

function set_user(calendar, user) {
  return _.assign({}, calendar, {user_id: user._id});
}

module.exports = router;
