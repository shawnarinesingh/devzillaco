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
    React       = require('react'),
    Router      = require('react-router'),
    
    frontendControllers;

var buildPath = config.paths.buildPath;
var routes = require(config.paths.buildPath + 'routes');
var App = React.createFactory(require(buildPath + '/components/App'));

frontendControllers = {
  // Route: index
  // Path: /
  // Method: GET
  index: function index(req, res, next) {
    /*jslint unparam:true*/
    function renderIndex() {
      return api.configuration.browse().then(function then(data) {
        var router = Router.create({location: req.url, routes: routes});
        router.run(function (Handler, state) {
          var html = React.renderToString(React.createElement(Handler));
          return res.render('index', {
            body: html
          });
        });
      });
    }
    
    renderIndex();
  }
};

module.exports = frontendControllers;