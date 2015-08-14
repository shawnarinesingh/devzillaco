// ## Server Loader
// Passes options through the boot process to get a server instance back
var server = require('./server');
var config = require('./server/config');

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function makeServer(options) {
  options = options || {};

  return server(options);
}

module.exports = makeServer;