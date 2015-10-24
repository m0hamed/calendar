"use strict";

var express = require('express'),
    router  = express.Router();

router.get('/', function(req, res, next) {
  res.render('calendars', { title: 'calendars' });
});

module.exports = router;
