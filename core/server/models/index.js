var _       = require('lodash'),
    Promise = require('bluebird'),
    requireTree   = require('../require-tree'),
    models;

models = {
  excludeFiles: ['_messages', 'base', 'index.js'],
  
  // ### init
  // Scan all files in this directoy and then require each one and cache
  // the objects exported onto this `models` object so that every other
  // module can safely access models without fear of introducing circular
  // dependency issues.
  // @returns {Promise}
  init: function init() {
    var self = this;
    
    // One off inclusion of Base file.
    self.Base = require('./base');
    
    // Require all files in this directory
    return requireTree.readAll(__dirname, {followSymlinks: false}).then(function then(modelFiles) {
      // For each found file, excluding those we don't want,
      // we will require it and cache it here.
      _.each(modelFiles, function each(path, fileName) {
        // Return early if this fileName is one of the ones we want
        // to exclude.
        if (_.contains(self.excludeFiles, fileName)) {
          return;
        }
        
        // Require the file.
        var file = require(path);
        
        // Cache it's `export` object onto this object.
        _.extend(self, file);
      });
      
      return;
    });
  }
};

module.exports = models;