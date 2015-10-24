var express = require('express');
var router = express.Router();

var Promise = require("bluebird");

var mongo = Promise.promisifyAll(require('mongoskin'));
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://127.0.0.1:27017/calendar');
var users = db.collection('users');
var sessions = db.collection('sessions');

var uuid = require('node-uuid');

var _ = require('lodash');

var USER_PARAMS = ['username', 'password']

// registeration end point to create a new user from a username and password
router.post('/', function(req, res, next) {
  users.insertAsync(_.pick(req.body, USER_PARAMS)).then(function(result) {
      res.send(result);}
    ).catch(function(err){
      res.status(400).send({error: 'Failed to insert with err' + err});
    });
});

// login end point that takes username and password and sends back
// an authentication token to be used for subsequent communication with
// with the api
router.post('/login', function(req, res, next) {
  users.findOneAsync(_.pick(req.body, USER_PARAMS)).then(function(result) {
    if (!result) throw "Username or password is wrong"
    get_token(result).then((token) => res.send({token: token}));
  }).catch(function (err) {
    res.status(403).send(err)
  });
});

// Generates a new token for each user session, authentication token is later
// expected as a query string auth_token
function get_token(params) {
  var token = uuid.v4();
  return sessions.insertAsync({user_id: params._id,
                       token: token, created_at: Date.now()}).then(() => token);
}

function create_token(params) {
}


module.exports = router;
