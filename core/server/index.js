// # Bootup
// @todo: This file needs serious love & refactoring

// Module dependencies
var express     = require('express'),
    compress    = require('compression'),
    fs          = require('fs'),
    uuid        = require('node-uuid'),
    _           = require('lodash'),
    Promise     = require('bluebird'),
    i18n        = require('./i18n'),

    api         = require('./api'),
    config      = require('./config'),
    errors      = require('./errors'),
    helpers     = require('./helpers'),
    mailer      = require('./mail'),
    middleware  = require('./middleware'),
    migrations  = require('./data/migration'),
    models      = require('./models'),
    permissions = require('./permissions'),
    // apps        = require('./apps'),
    sitemap     = require('./data/xml/sitemap'),
    xmlrpc      = require('./data/xml/xmlrpc'),
    appServer   = require('./app-server'),

    dbHash;
    
function doFirstRun() {
  var firstRunMessage = [
    'Welcome to DevZilla.',
    'You\'re running under the <strong>',
    process.env.NODE_ENV,
    '</strong>environment.',
    
    'Your URL is set to',
    '<strong>' + config.url + '</strong>.'
  ];
  
  return api.notifications.add({notifactions: [{
    type: 'info',
    message: firstRunMessage.join(' ')
  }]}, {context: {internal: true}});
}

function initDbHashAndFirstRun() {
  return api.settings.read({key: 'dbHash', context: {internal: true}}).then(function (response) {
    var hash = response.settings[0].value,
        initHash;
        
    dbHash = hash;
    
    if (dbHash === null) {
      initHash = uuid.v4();
      return api.settings.edit({settings: [{key: 'dbHash', value: initHash}]}, {context: {internal: true}})
        .then(function (response) {
          dbHash = response.settings[0].value;
          return dbHash;
        }).then(doFirstRun);
    }
    
    return dbHash;
  });
}

// ## Intialize App
// Sets up the express server instances, runs init on a bunch of stuff, configures helpers, routes, and more
// Finally it returns an instance of appServer
function init(options) {
  // Get reference to an express app instance.
  var app = express();
  
  // ### Initialization 
  // The server and its dependencies require a populated config
  // It returns a promise that is resolved when the application
  // has finished starting up.
  
  // Load our config.js file from the local file system.
  return config.load(options.config).then(function () {
    return config.checkDeprecated();
  }).then(function () {
    // Initialise the models
    return models.init();
  }).then(function () {
    // Initialize migrations
    return migrations.init();
  }).then(function () {
    // Populate any missing default settings
    return models.Settings.populateDefaults();
  }).then(function () {
    // Initialize the settings cache
    return api.init();
  }).then(function () {
    // Initialize the permissions actions and objects
    // NOTE: Must be done before initDbHashAndFirstRun calls
    return permissions.init();
  }).then(function () {
    return Promise.join(
      // Check for or initialise a dbHash.
      initDbHashAndFirstRun(),
      // Initialize mail
      mailer.init()
    );
  }).then(function () {
    
    // enabled gzip compression by default
    if (config.server.compress !== false) {
      app.use(compress());
    }
    
    return new appServer(app);
  });
}

module.exports = init;