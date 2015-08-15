// # DB API
// API for DB operations
var _                = require('lodash'),
    Promise          = require('bluebird'),
    dataExport       = require('../data/export'),
    models           = require('../models'),
    errors           = require('../errors'),
    canThis          = require('../permissions').canThis,
    utils            = require('./utils'),

    api              = {},
    db;

api.settings         = require('./settings');

/**
 * ## DB API Methods
 *
 */
db = {
  /**
   * ### Export Content
   * Generate the JSON to export
   * 
   * @public
   * @param {{context}} options
   * @return {Promise} Export JSON format
   */
  exportContent: function (options) {
    options = options || {};
    
    // Export data, otherwise send error 500
    return canThis(options.context).exportContent.db().then(function () {
      return dataExport().then(function (exportedData) {
        return {db: [exportedData]};
      }).catch(function (error) {
        return Promise.reject(new errors.InternalServerError(error.message || error));
      });
    }, function () {
      return Promise.reject(new errors.NoPermissionError('You do not have permission to export data (no rights).'));
    });
  }
};

module.exports = db;