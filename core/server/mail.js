// # Mail
// Handles sending email
var _          = require('lodash'),
    Promise    = require('bluebird'),
    nodemailer = require('nodemailer'),
    validator  = require('validator'),
    config     = require('./config');

function appMailer(opts) {
  opts = opts || {};
  this.transport = opts.transport || null;
}

// ## E-mail transport setup
// *This promise should always resolve to avoid halting
appMailer.prototype.init = function () {
  var self = this;
  self.state = {};
  if (config.mail && config.mail.transport) {
    this.createTransport();
    return Promise.resolve();
  }
  
  self.transport = nodemailer.createTransport('direct');
  self.state.usingDirect = true;
  
  return Promise.resolve();
};

appMailer.prototype.createTransport = function () {
  this.transport = nodemailer.createTransport(config.mail.transport, _.clone(config.mail.options) || {});
};

appMailer.prototype.from = function () {
  var from = config.mail && (config.mail.from || config.mail.fromaddress);
  
  // If we don't have a from address at all
  if (!from) {
    // Default to noreply@[url]
    from = 'noreply@' + this.getDomain();
  }
  
  return from;
};

// Moved it to its own module
appMailer.prototype.getDomain = function () {
  var domain = config.url.match(new RegExp('^https?://([^/:?#]+)(?:[/:?#]|$)', 'i'));
  return domain && domain[1];
};

// Sends an e-mail message enforcing `to` (owner) and `from` fields 
// This assumes the api.settings.read('email') was already done on the API level
appMailer.prototype.send = function (message) {
  var self = this,
      to,
      sendMail;
  
  message = message || {};
  to = message.to || false;
  
  if (!this.transport) {
    return Promise.reject(new Error('Email Error: No e-mail transport configured.'));
  }
  if (!(message && message.subject && message.html && message.to)) {
    return Promise.reject(new Error('Email Error: Incomplete message data.')); 
  }
  sendMail = Promise.promisify(self.transport.sendMail.bind(self.transport));
  
  message = _.extend(message, {
    from: self.from(),
    to: to,
    generateTextFromHTML: true,
    encoding: 'base64'
  });
  
  return new Promise(function (resolve, reject) {
    sendMail(message, function (error, response) {
      if (error) {
        return reject(new Error(error));
      }
      
      if (self.transport.transportType !== 'DIRECT') {
        return resolve(response);
      }
      
      response.statusHandler.once('failed', function (data) {
        var reason = 'Email Error: Failed sending email';
        
        if (data.error && data.error.errno === 'ENOTFOUND') {
          reason += ': there is no mail server at this address: ' + data.domain;
        }
        reason += '.';
        return reject(new Error(reason));
      });
      
      response.statusHandler.once('requeue', function (data) {
        var errorMessage = 'Email Error: message was not sent, requeued. Probably will not be send. :(';
        
        if (data.error && data.error.message) {
          errorMessage += '\nMore info: ' + data.error.message;
        }
        
        return reject(new Error(errorMessage));
      });
      
      response.statusHandler.once('sent', function () {
        return resolve('Message was accepted by the mail server.  Make sure to check inbox and spam folders. :)');
      });
    });
  });
};

module.exports = new appMailer();