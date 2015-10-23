"use strict";

var express = require('express'),
    _       = require('lodash'),
    db      = require('../components/db.js'),
    google  = require('../components/googleapi.js');
    Promise = require('bluebird');

var router  = express.Router({mergeParams: true});

router.get('/', function(req, res, next) {
  var state = JSON.parse(req.query.state);
  console.log(req.query.code);
  var user = state.user;
  google.update_token(user, req.query.code);
  res.redirect('http://instacalendar.tz:3000' + state.url);
});

module.exports = router;
