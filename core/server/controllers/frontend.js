/**
 * Main controller for Ghost frontend
 */

/*global require, module */

var _           = require('lodash'),
    api         = require('../api'),
    path        = require('path'),
    config      = require('../config'),
    errors      = require('../errors'),
    // filters     = require('../filters'),
    Promise     = require('bluebird'),
    // template    = require('../helpers/template'),
    routeMatch  = require('path-match')(),

    frontendControllers;
    

frontendControllers = {
  // Route: index
  // Path: /
  // Method: GET
  index: function index(req, res) {
    /*jslint unparam:true*/
    
    function renderIndex() {
      return api.configuration.browse().then(function then(data) {
        res.render('index', {
          
        });
      });
    }
    
    renderIndex();
  }
};

module.exports = frontendControllers;