// # Server
// Heandles the creation of an HTTP Server
var Promise = require('bluebird'),
    chalk = require('chalk'),
    fs = require('fs'),
    errors = require('./errors'),
    config = require('./config');

/**
 * ## appServer
 * @constructor
 * @param {Object} rootApp - parent express instance
 */
function appServer(rootApp) {
  this.rootApp = rootApp;
  this.httpServer = null;
  this.connections = {};
  this.connectionId = 0;
  
  // Expose config module for use externally.
  this.config = config;
}

/**
 * ## Public API Methods
 * 
 * ### Start
 * Starts the server listening on the configured port.
 * Alternatively you can pass in your own express instance and let the app
 * start listening for you.
 * @param {Object} externalApp - Optional express app instance.
 * @return {Promise} Resolves once the app has started
 */
appServer.prototype.start = function (externalApp) {
  var self = this,
      rootApp = externalApp ? externalApp : self.rootApp;
  
  return new Promise(function (resolve) {
    var socketConfig = config.getSocket();
    
    if (socketConfig) {
      // Make sure the socket is gone before trying to create another
      try {
        fs.unlinkSync(socketConfig.path);
      } catch (e) {
        // We can ignore this.
      }
      
      self.httpServer = rootApp.listen(socketConfig.path);
      
      fs.chmod(socketConfig.path, socketConfig.permissions);
    } else {
      self.httpServer = rootApp.listen(
        config.server.port,
        config.server.host
      );
    }
    
    self.httpServer.on('error', function (error) {
      if (error.errno === 'EADDRINUSE') {
        errors.logError(
          '(EADDRINUSE) Cannot start the app.',
          'Port ' + config.server.port + ' is already in use by another program.'
        );
      } else {
        errors.logError(
          '(Code: ' + error.errno + ')',
          'There was an error starting your server.',
          'Please use the error code above to search for a solution.'
        );
      }
      process.exit(-1);
    });
    self.httpServer.on('connection', self.connection.bind(self));
    self.httpServer.on('listening', function () {
      self.logStartMessages();
      resolve(self);
    });
  });
};

/**
 * ### Stop
 * Returns a promise that will be fulfilled when the server stops. If the server has not been started,
 * the promise will be fulfilled immediately
 * @returns {Promise} Resolves once the app has stopped
 */
appServer.prototype.stop = function () {
  var self = this;

  return new Promise(function (resolve) {
    if (self.httpServer === null) {
      resolve(self);
    } else {
      self.httpServer.close(function () {
        self.httpServer = null;
        self.logShutdownMessages();
        resolve(self);
      });

      self.closeConnections();
    }
  });
};

/**
 * ### Restart
 * Restarts the application
 * @returns {Promise} Resolves once the app has restarted
 */
appServer.prototype.restart = function () {
  return this.stop().then(this.start.bind(this));
};

/**
 * ## Private (internal) methods
 *
 * ### Connection
 * @param {Object} socket
 */
appServer.prototype.connection = function (socket) {
  var self = this;

  self.connectionId += 1;
  socket._appId = self.connectionId;

  socket.on('close', function () {
    delete self.connections[this._ghostId];
  });

  self.connections[socket._appId] = socket;
};

/**
 * ### Close Connections
 * Most browsers keep a persistent connection open to the server, which prevents the close callback of
 * httpServer from returning. We need to destroy all connections manually.
 */
appServer.prototype.closeConnections = function () {
  var self = this;

  Object.keys(self.connections).forEach(function (socketId) {
    var socket = self.connections[socketId];

    if (socket) {
      socket.destroy();
    }
  });
};


/**
 * ### Log Start Messages
 */
appServer.prototype.logStartMessages = function () {
  // Startup & Shutdown messages
  if (process.env.NODE_ENV === 'production') {
    console.log(
      chalk.green('App is running...'),
      '\nYour blog is now available on',
      config.url,
      chalk.gray('\nCtrl+C to shut down')
    );
  } else {
    console.log(
      chalk.green('App is running in ' + process.env.NODE_ENV + '...'),
      '\nListening on',
        config.getSocket() || config.server.host + ':' + config.server.port,
      '\nUrl configured as:',
      config.url,
      chalk.gray('\nCtrl+C to shut down')
    );
  }

  function shutdown() {
    console.log(chalk.red('\nGhost has shut down'));
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '\nYour blog is now offline'
      );
    } else {
      console.log(
        '\nApp was running for',
        Math.round(process.uptime()),
        'seconds'
      );
    }
    process.exit(0);
  }
  // ensure that Ghost exits correctly on Ctrl+C and SIGTERM
  process.
    removeAllListeners('SIGINT').on('SIGINT', shutdown).
    removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};

/**
 * ### Log Shutdown Messages
 */
appServer.prototype.logShutdownMessages = function () {
  console.log(chalk.red('App is closing connections'));
};

module.exports = appServer;