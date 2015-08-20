// # Custom Middleware
// The following custom middleware functions cannot yet be unit tested, and as such are kept separate from
// the testable custom middleware functions in middleware.js

var api            = require('../api'),
    bodyParser     = require('body-parser'),
    config         = require('../config'),
    crypto         = require('crypto'),
    errors         = require('../errors'),
    express        = require('express'),
    jsxCompile     = require('express-jsx'),
    fs             = require('fs'),
    logger         = require('morgan'),
    middleware     = require('./middleware'),
    path           = require('path'),
    routes         = require('../routes'),
    slashes        = require('connect-slashes'),
    // storage        = require('../storage'),
    _              = require('lodash'),
    passport       = require('passport'),
    oauth          = require('./oauth'),
    oauth2orize    = require('oauth2orize'),
    // authStrategies = require('./auth-strategies'),
    utils          = require('../utils'),
    // sitemapHandler = require('../data/xml/sitemap/handler'),
    // decideIsAdmin  = require('./decide-is-admin'),
    uncapitalise   = require('./uncapitalise'),

    app,
    setupMiddleware;


setupMiddleware = function setupMiddleware(appInstance) {
  var logging = config.logging,
      corePath = config.paths.corePath,
      oauthServer = oauth2orize.createServer();
  
  // Cache express server instance
  app = appInstance;
  middleware.cacheApp(appInstance);
  middleware.api.cacheOauthServer(oauthServer);
  oauth.init(oauthServer, middleware.spamPrevention.resetCounter);
  
  // Make sure 'req.secure' is valid for proxied requests
  // (X-Forwarded-Proto header will be checked, if present)
  app.enable('trust proxy');
  
  // Logging configuration
  if (logging !== false) {
    if (app.get('env') !== 'development') {
      app.use(logger('combined', logging));
    } else {
      app.use(logger('dev', logging));
    }
  }
  
  // Force SSL
  app.use(middleware.checkSSL);
  
  // Add in all trailing slashes
  app.use(slashes(true, {
    headers: {
      'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_S
    }
  }));
  app.use(uncapitalise);
  
  // Convert all jsx to readable javascript
  app.use(jsxCompile(config.paths.clientPath));
  
  // ### Routing
  // Set up API Routes
  app.use(routes.apiBaseUri, routes.api(middleware));
  
  // Set up Frontend routes
  app.use(routes.frontend(middleware));
  
  // ### Error handling
  // 404 Handler
  app.use(errors.error404);
  
  // 500 Handler
  app.use(errors.error500);
};

module.exports = setupMiddleware;
// Export middleware functions directly
module.exports.middleware = middleware;