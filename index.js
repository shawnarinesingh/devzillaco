// # Startup
// Orchestrates the startup when run from command line.
var express,
    core,
    app,
    errors;
    
// Make sure dependencies are installed and file system permissions are correct.
require('./core/server/utils/startup-check').check();

// Proceed with startup
express = require('express');
core = require('./core');
errors = require('./core/server/errors');

// Create our parent express app instance.
app = express();

// Call Core to get an instance of the server
core().then(function (server) {
  // Mount our instance on our desired subdirectry path if it exists.
  app.use(server.config.paths.subdir, server.rootApp);
  
  // Let the app handle starting our server instance.
  server.start(app);
}).catch(function (err) {
  errors.logErrorAndExit(err, err.context, err.help);
});