"use strict";

var express = require('express'),
    router  = express.Router();

// endpoint to the list of calendars
router.get('/', function(req, res, next) {
  res.render('calendars', { title: 'calendars' });
});

module.exports = router;
