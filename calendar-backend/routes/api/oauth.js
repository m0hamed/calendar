"use strict";

var express = require('express'),
    _       = require('lodash'),
    db      = require('../../components/db.js'),
    google  = require('../../components/googleapi.js');
    Promise = require('bluebird');

var router  = express.Router({mergeParams: true});

router.get('/', function(req, res, next) {
  var state = JSON.parse(req.query.state);
  var user = state.user;
  google.updateToken(user, req.query.code);
  res.redirect(state.url + '&redir=true');
});

module.exports = router;
