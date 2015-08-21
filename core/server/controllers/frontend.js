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

function renderChannel(channelOpts) {
  channelOpts = channelOpts || {};
  
  return function renderChannel(req, res, next) {
    var pageParam = req.params.page !== undefined ? parseInt(req.params.page, 10) : 1,
        options = {
          page: pageParam
        },
        hasSlug,
        filter,
        filterKey;
  }
}
frontendControllers = {
  homepage: renderChannel({
    name: 'home',
    route: '/',
    firstPageTemplate: 'home'
  })
};