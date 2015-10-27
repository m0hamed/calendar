"use strict";

var express = require('express'),
    utils   = require('../components/utils.js'),
    router  = express.Router(),
    _       = require('lodash');

// endpoint to view one calendar
router.get('/:id', function(req, res, next) {
  res.render('calendar', { title: '', calendar_id: req.params.id });
});

module.exports = router;
