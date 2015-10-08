var express = require('express');
var router = express.Router();

var mongo = require('mongoskin');
var ID = mongo.helper.toObjectID;
var db = mongo.db('mongodb://127.0.0.1:27017/calendar');
var users = db.collection('users');
var sessions = db.collection('sessions');

var uuid = require('node-uuid');

var _ = require('lodash');

var USER_PARAMS = ['username', 'password']

router.post('/', function(req, res, next) {
  users.insert(_.pick(req.body, USER_PARAMS), function(err, result) {
    if(!err) res.send('Inserted ' + req.body.name+"\n result="
                        +JSON.stringify(result));
    else res.send('Failed to insert ' + req.body.name+
                  '\n result='+JSON.stringify(err)+"\n");
  });
});

router.post('/login', function(req, res, next) {
  users.find(_.pick(req.body, USER_PARAMS)).toArray(function(err, result) {
    console.log("result=", result);
    if(result.length==0)
      res.status(403).send("Username or password is wrong")
    else {
      get_token(result[0], function(token) {
        console.log("token", token);
        res.send(token);
      });
    }
  });
});

function get_token(params, callback) {
  sessions.findOne({user_id: params._id}, function(err, doc) {
    console.log("doc", doc)
    if(doc) {
      callback(doc.token);
    } else {
      create_token(params, function(token){
        callback(token);
      });
    }
  });
}

function create_token(params, callback) {
  var token = uuid.v4();
  sessions.insert({user_id: params._id, token: token, created_at: Date.now},
    function(err, result) {
      console.log(result);
    }
  );
  callback(token);
}


module.exports = router;
