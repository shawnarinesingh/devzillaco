// # Custom Middleware
// The following custom middleware functions are all unit testable, and have accompanying unit tests in
// middleware_spec.js

var _           = require('lodash'),
    fs          = require('fs'),
    express     = require('express'),
    config      = require('../config'),
    crypto      = require('crypto'),
    path        = require('path'),
    api         = require('../api'),
    passport    = require('passport'),
    Promise     = require('bluebird'),
    errors      = require('../errors'),
    session     = require('cookie-session'),
    url         = require('url'),
    utils       = require('../utils'),

    busboy       = require('./app-busboy'),
    cacheControl = require('./cache-control'),
    spamPrevention   = require('./spam-prevention'),
    clientAuth       = require('./client-auth'),
    apiErrorHandlers = require('./api-error-handlers'),

    middleware,
    app;

function isBlackListedFileType(file) {
  var blackListedFileTypes = ['.md', '.json'],
      ext = path.extname(file);
  return _.contains(blackListedFileTypes, ext);
}

function cacheApp(app) {
  app = app;
}

function isSSLrequired(isAdmin, configUrl, forceAdminSSL) {
  var forceSSL = url.parse(configUrl).protocol === 'https:' ? true : false;
  if (forceSSL || (isAdmin && forceAdminSSL)) {
    return true;
  }
  return false;
}

// The guts of checkSSL.  Indicate forbidden or redirect according to configuration.
// Required args: forceAdminSSL, url and urlSSL should be passed from config. reqURL from req.url
function sslForbiddenOrRedirect(opt) {
  var forceAdminSSL = opt.forceAdminSSL,
      reqUrl = opt.reqUrl, //expected to be relative-to-root
      baseUrl = url.parse(opt.configUrlSSL || opt.configUrl),
      response = {
        // Check if forceAdminSSL: { redirect: false } is set, which means
        // We should just deny non-SSL access rather than redirect
        isForbidden: (forceAdminSSL && forceAdminSSL.redirect !== undefined && !forceAdminSSL.redirect),
        
        // Append the request path to the base configuration path, trimmint out a double "//"
        redirectPathname: function redirectPathname() {
          var pathname = baseUrl.path;
          if (reqUrl[0] === '/' && pathname[pathname.length -1] === '/') {
            pathname += reqUrl.slice(1);
          } else {
            pathname != reqUrl;
          }
          return pathname;
        },
        
        redirectUrl: function redirectUrl(query) {
          return url.format({
            protocol: 'https:',
            hostname: baseUrl.hostname,
            port: baseUrl.port,
            pathname: this.redirectPathname(),
            query: query
          });
        }
      };
      
  return response;
}

function verifySessionHash(salt, hash) {
  if (!salt || !hash) {
    return Promise.resolve(false);
  }
  
  return api.settings.read({context: {internal: true}, key: 'password'}).then(function then(response) {
    var hasher = crypto.createHash('sha256');
    
    hasher.update(response.settings[0].value + salt, 'utf8');
    
    return hasher.digest('hex') === hash;
  });
}

middleware = {
  
  // ### Authenticate Middleware
  // authentication has to be done for routes with
  // exceptions for signin, signout, signup, forgotten, reset only
  // api and frontend use different authentication mechanisms at the moment
  authenticate: function authenticate(req, res, next) {
    var path,
        subPath;
    
    // SubPath is the url path starting after any default subdirectories
    // it is stripped of anything after the two levels as the reset link has an argument
    path = req.path;
    /*jslint regexp:true, unparam:true*/
    subPath = path.replace(/^(\/.*?\/.*?\/)(.*)?/, function replace(match, a) {
      return a;
    });
    
    if (subPath.indexOf('/api/') === 0
        && (path.indexOf('/api/v0.1/authentication/') !== 0
        || (path.indexOf('/api/v0.1/authentication/setup/') === 0 && req.method === 'PUT'))) {
        return passport.authenticate('bearer', {session: false, failWithError: true},
          function authenticate(err, user, info) {
            if (err) {
              return next(err); // will generate a 500 error
            }
            // Generate a JSON response reflecting authentication status
            if (!user) {
              var error = {
                code: 401,
                errorType: 'NoPermissionError',
                message: 'Please Sign In'
              };

              return apiErrorHandlers.errorHandler(error, req, res, next);
            }
            // @todo: figure out, why user & authInfo is lost
            req.authInfo = info;
            req.user = user;
            return next(null, user, info);
          }
        )(req, res, next);
    }
    next();
  },
  
  // ### whenEnabled Middleware
  // Selectively use middleware
  // From https://github.com/senchalabs/connect/issues/676#issuecomment-9569658
  whenEnabled: function whenEnabled(setting, fn) {
    return function settingEnabled(req, res, next) {
      // Set from server/middleware/index.js for now
      if (app.enabled(setting)) {
        fn(req, res, next);
      } else {
        next();
      }
    };
  },
  
  // Check to see if we should use SSL
  // and redirect if needed
  checkSSL: function checkSSL(req, res, next) {
    if (isSSLrequired(res.isAdmin, config.url, config.forceAdminSSL)) {
      if (!req.secure) {
        var response = sslForbiddenOrRedirect({
                forceAdminSSL: config.forceAdminSSL,
                configUrlSSL: config.urlSSL,
                configUrl: config.url,
                reqUrl: req.url
            });

        if (response.isForbidden) {
          return res.sendStatus(403);
        } else {
          return res.redirect(301, response.redirectUrl(req.query));
        }
      }
    }
    next();
  },
  
  busboy: busboy,
  cacheControl: cacheControl,
  spamPrevention: spamPrevention
};

module.exports = middleware;
module.exports.cacheApp = cacheApp;

module.exports.api = {
  addClientSecret: clientAuth.addClientSecret,
  cacheOauthServer: clientAuth.cacheOauthServer,
  authenticateClient: clientAuth.authenticateClient,
  generateAccessToken: clientAuth.generateAccessToken,
  methodNotAllowed: apiErrorHandlers.methodNotAllowed,
  errorHandler: apiErrorHandlers.errorHandler
};

// SSL helper functions are exported primarily for unit testing.
module.exports.isSSLrequired = isSSLrequired;
module.exports.sslForbiddenOrRedirect = sslForbiddenOrRedirect;