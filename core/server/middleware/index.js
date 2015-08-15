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
    // routes         = require('../routes'),
    slashes        = require('connect-slashes'),
    // storage        = require('../storage'),
    _              = require('lodash'),
    passport       = require('passport'),
    // oauth          = require('./oauth'),
    oauth2orize    = require('oauth2orize'),
    // authStrategies = require('./auth-strategies'),
    utils          = require('../utils'),
    // sitemapHandler = require('../data/xml/sitemap/handler'),
    // decideIsAdmin  = require('./decide-is-admin'),
    uncapitalise   = require('./uncapitalise'),

    clientApp,
    setupMiddleware;


setupMiddleware = function setupMiddleware(clientAppInstance, apiApp) {
  var logging = config.logging,
      corePath = config.paths.corePath,
      oauthServer = oauth2orize.createServer();
  
  // Cache express server instance
  clientApp = clientAppInstance;
  middleware.cacheApp(clientAppInstance);
  
  // Make sure 'req.secure' is valid for proxied requests
  // (X-Forwarded-Proto header will be checked, if present)
  clientApp.enable('trust proxy');
  
  // Logging configuration
  if (logging !== false) {
    if (clientApp.get('env') !== 'development') {
      clientApp.use(logger('combined', logging));
    } else {
      clientApp.use(logger('dev', logging));
    }
  }
};