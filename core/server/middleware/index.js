// # Custom Middleware
// The following custom middleware functions cannot yet be unit tested, and as such are kept separate from
// the testable custom middleware functions in middleware.js

var api            = require('../api'),
    bodyParser     = require('body-parser'),
    config         = require('../config'),
    crypto         = require('crypto'),
    errors         = require('../errors'),
    express        = require('express'),
    fs             = require('fs'),
    logger         = require('morgan'),
    middleware     = require('./middleware'),
    path           = require('path'),
    routes         = require('../routes'),
    slashes        = require('connect-slashes'),
    storage        = require('../storage'),
    _              = require('lodash'),
    passport       = require('passport'),
    oauth          = require('./oauth'),
    oauth2orize    = require('oauth2orize'),
    authStrategies = require('./auth-strategies'),
    utils          = require('../utils'),
    sitemapHandler = require('../data/xml/sitemap/handler'),
    decideIsAdmin  = require('./decide-is-admin'),
    uncapitalise   = require('./uncapitalise'),

    blogApp,
    setupMiddleware;


setupMiddleware = function setupMiddleware(clientApp, apiApp) {
  var logging = config.logging,
      corePath = config.paths.corePath,
      oauthServer = oauth2orize.createServer();
  
  // silence JSHint without disabling unused check for the whole file
  authStrategies = authStrategies;
  
  // Cache express server instance
  
};