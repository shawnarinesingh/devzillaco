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

    // busboy       = require('./ghost-busboy'),
    // cacheControl = require('./cache-control'),
    // spamPrevention   = require('./spam-prevention'),
    // clientAuth       = require('./client-auth'),
    // apiErrorHandlers = require('./api-error-handlers'),

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
        
    
  }
}

module.exports = middleware;
module.exports.cacheApp = cacheApp;

// SSL helper functions are exported primarily for unit testing.
module.exports.isSSLrequired = isSSLrequired;
module.exports.sslForbiddenOrRedirect = sslForbiddenOrRedirect;