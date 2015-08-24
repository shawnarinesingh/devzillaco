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
    // authStrategies = require('./auth-strategies'),
    utils          = require('../utils'),
    // sitemapHandler = require('../data/xml/sitemap/handler'),
    // decideIsAdmin  = require('./decide-is-admin'),
    uncapitalise   = require('./uncapitalise'),

    app,
    setupMiddleware;

// Redirect to setup if no user exists
function redirectToSetup(req, res, next) {
    /*jslint unparam:true*/

    api.authentication.isSetup().then(function then(exists) {
        if (!exists.setup[0].status && !req.path.match(/\/setup\//)) {
            return res.redirect(config.paths.subdir + '/admin/setup/');
        }
        next();
    }).catch(function handleError(err) {
        return next(new Error(err));
    });
}

setupMiddleware = function setupMiddleware(appInstance) {
  var logging = config.logging,
      corePath = config.paths.corePath,
      buildPath = config.paths.buildPath,
      oauthServer = oauth2orize.createServer();
  
  // silence JSHint without disabling unused check for the whole file
  // authStrategies = authStrategies
  
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
  
  // Static assets
  app.use('/shared', express['static'](path.join(corePath, '/shared'), {maxAge: utils.ONE_HOUR_MS}));
  app.use('/content/images', storage.getStorage().serve());
  app.use('/public', express['static'](path.join(buildPath + '/public'), {maxAge: utils.ONE_YEAR_MS}));
  
  // Admin only config
  app.use('*', express['static'](config.paths.clientAssets, {maxAge: utils.ONE_YEAR_MS}));
  
  // Force SSL
  app.use(middleware.checkSSL);
  
  app.set('views', config.paths.templateViews);
  
  // Add in all trailing slashes
  app.use(slashes(true, {
    headers: {
      'Cache-Control': 'public, max-age=' + utils.ONE_YEAR_S
    }
  }));
  app.use(uncapitalise);
  
  // Body parsing
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  
  // ### Caching
  // Frontend is cacheable
  app.use(middleware.cacheControl('public'));
  // API shouldn't be cached
  app.use(routes.apiBaseUri, middleware.cacheControl('private'));
  
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
// Expose middleware functions in this file as well
module.exports.middleware.redirectToSetup = redirectToSetup;