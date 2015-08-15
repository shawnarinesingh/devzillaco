// # Settings API
// RESTful API for the Setting resource
var _            = require('lodash'),
    dataProvider = require('../models'),
    Promise      = require('bluebird'),
    config       = require('../config'),
    canThis      = require('../permissions').canThis,
    errors       = require('../errors'),
    utils        = require('./utils'),

    docName      = 'settings',
    settings,

    updateSettingsCache,
    settingsFilter,
    filterPaths,
    readSettingsResult,
    settingsResult,
    canEditAllSettings,
    populateDefaultSetting,
    hasPopulatedDefaults = false,

    /**
     * ## Cache
     * Holds cached settings
     * @private
     * @type {{}}
     */
    settingsCache = {};

/**
 * ### Update Settings Cache
 * Maintain the internal cache of the settings object
 * @public
 * @param {Object} settings
 * @returns {Settings}
 */
updateSettingsCache = function (settings) {
  settings = settings || {};
  
  if (!_.isEmpty(settings)) {
    _.map(settings, function (setting, key) {
      settingsCache[key] = setting;
    });
    
    return Promise.resolve(settingsCache);
  }
  
  return dataProvider.Settings.findAll()
    .then(function (result) {
      settingsCache = readSettingsResult(result.models);
      
      return settingsCache;
    });
};

// ## Helpers

/**
 * ### Settings Filter
 * Filters an object based on a given filter object
 * @private
 * @param {Object} settings
 * @param {String} filter
 * @returns {*}
 */
settingsFilter = function (settings, filter) {
  return _.object(_.filter(_.pairs(settings), function (setting) {
    if (filter) {
      return _.some(filter.split(','), function (f) {
        return setting[1].type === f;
      });
    }
    return true;
  }));
};

/**
 * ### Filter Paths
 * @private
 * @param {object} paths
 * @param {array/string} active
 * @returns {Array}
 */
filterPaths = function (paths, active) {
  var pathKeys = Object.keys(paths),
      res = [],
      item;
  
  // turn active into an array (so themes and apps can be checked the same)
  if (!Array.isArray(active)) {
    active = [active];
  }
  
  _.each(pathKeys, function (key) {
    // do not include hidden files or _messages
    if (key.indexOf('.') !== 0 &&
        key !== '_messages' &&
        key !== 'README.md') {
      item = {
        name: key
      };
      if (paths[key].hasOwnProperty('package.json')) {
        item.package = paths[key]['package.json'];
      } else {
        item.package = false;
      }
      
      if (_.indexOf(active, key) !== -1) {
        item.active = true;
      }
      res.push(item);
    }
  });
  return res;
};

/**
 * ### Read Settings Result
 * @private
 * @param {Array} settingsModels
 * @returns {Settings}
 */
readSettingsResult = function (settingsModels) {
  var settings = _.reduce(settingsModels, function (memo, member) {
        if (!memo.hasOwnProperty(member.attributes.key)) {
          memo[member.attributes.key] = member.attributes;
        }
        
        return memo;
      }, {}),
      res;
  
  return settings;
};


/**
 * ### Settings Result
 * @private
 * @param {Object} settings
 * @param {String} type
 * @returns {{settings: *}}
 */
settingsResult = function (settings, type) {
  var filteredSettings = _.values(settingsFilter(settings, type)),
      result = {
        settings: filteredSettings,
        meta: {}
      };
  
  if (type) {
    result.meta.filters = {
      type: type
    };
  }
  
  return result;
};

/**
 * ### Populate Default Setting
 * @private
 * @param {String} key
 * @returns Promise(setting)
 */
populateDefaultSetting = function (key) {
  // Call populateDefault and update the settings cache
  return dataProvider.Settings.populateDefault(key).then(function (defaultSetting) {
    // Process the default result and add the settings cache
    var readResult = readSettingsResult([defaultSetting]);
    
    // Add to the settings cache
    return updateSettingsCache(readResult).then(function () {
      // Get the result from the cache with permission checks
    });
  }).catch(function (err) {
    // Pass along NotFoundError
    if (typeof err === errors.NotFoundError) {
      return Promise.reject(err);
    }
    
    // @todo: Different kind of error?
    return Promise.reject(new errors.NotFoundError('Problem finding setting: ' + key));
  });
};


/**
 * ### Can Edit All Settings
 * Check that this edit request is allowed for all settings requested to be udpated
 * @private
 * @param {Object} settingsInfo
 * @returns {*}
 */
canEditAllSettings = function (settingsInfo, options) {
  var checkSettingPermissions = function (setting) {
        if (setting.type === 'core' && !(options.context && options.context.internal)) {
          return Promise.reject(
            new errors.NoPermissionError('Attempted to access core setting from external request')
          );
        }
        
        return canThis(options.context).edit.setting(setting.key).catch(function () {
          return Promise.reject(new errors.NoPermissionError('You do not have permission to edit settings.'));
        });
      },
      checks = _.map(settingsInfo, function (settingInfo) {
        var setting = settingsCache[settingInfo.key];
        
        if (!setting) {
          // Try to populate a default setting if not in the cache
          return populateDefaultSetting(settingInfo.key).then(function (defaultSetting) {
            // get the result from the cache with permission checks
            return checkSettingPermissions(defaultSetting);
          });
        }
        
        return checkSettingPermissions(setting);
      });
  
  return Promise.all(checks);
};

/**
 * ## Settings API Methods
 */
settings = {
  
  /**
   * ### Browse
   * @param {Object} options
   * @returns {*}
   */
  browse: function browse(options) {
    // First, check if we have populated the settings from default-settings yet
    if (!hasPopulatedDefaults) {
      return dataProvider.Settings.populateDefaults().then(function () {
        hasPopulatedDefaults = true;
        return settings.browse(options);
      });
    }
    
    options = options || {};
    
    var result = settingsResult(settingsCache, options.type);
    
    // Otherwise return whatever this context is allowed to browse
    return canThis(options.context).browse.setting().then(function () {
      // Omit core settings unless internal request
      if (!options.context.internal) {
        result.settings = _.filter(result.settings, function (setting) { return setting.type !== 'core'; });
      }
      
      return result;
    });
  },
  
  /**
   * ### Read
   * @param {Object} options
   * @returns {*}
   */
  read: function read(options) {
    if (_.isString(options)) {
      options = {key: options};   
    }
    
    var getSettingsResult = function () {
      var setting = settingsCache[options.key],
          result = {};
      
      result[options.key] = setting;
      
      if (setting.type === 'core' && !(options.context && options.context.internal)) {
        return Promise.reject(
          new errors.NoPermissionError('Attempted to access core setting from external request')
        );
      }
      
      return canThis(options.context).read.setting(options.key).then(function () {
        return settingsResult(result);
      }, function () {
        return Promise.reject(new errors.NoPermissionError('You do not have permission to read settings.'));
      });
    };
    
    // If the setting is not already in the cache
    if (!settingsCache[options.key]) {
      // Try to populate the seting from default-settings file
      return populateDefaultSetting(options.key).then(function () {
        // Get the result from the cache with permission checks
        return getSettingsResult();
      });
    }
    
    // Get the result from the cache with permission checks
    return getSettingsResult();
  },
  
  /**
   * ### Edit
   * Update properties
   * @param {{settings: }} object Setting or a single string name
   * @param {{id (required), include,...}} options (optional) or a single string value
   * @return {Promise(Setting)} Edited Setting
   */
  edit: function edit(object, options) {
    options = options || {};
    var self = this,
        type;
    
    // Allow shorthand syntax where a single key and value are passed to edit instead of object and options
    if (_.isString(object)) {
      object = {settings: [{key: object, value: options}]};
    }
    
    // clean data
    _.each(object.settings, function (setting) {
      if (!_.isString(setting.value)) {
        setting.value = JSON.stringify(setting.value);
      }
    });
    
    type = _.find(object.settings, function (setting) { return setting.key === 'type'; });
    if (_.isObject(type)) {
      type = type.value;
    }
    
    object.settings = _.reject(object.settings, function (setting) {
      return setting.key === 'type';
    });
    
    return canEditAllSettings(object.settings, options).then(function () {
      return utils.checkObject(object, docName).then(function (checkedData) {
        options.user = self.user;
        return dataProvider.Settings.edit(checkedData.settings, options);
      }).then(function (result) {
        var readResult = readSettingsResult(result);
        
        return updateSettingsCache(readResult).then(function () {
          return settingsResult(readResult, type);
        });
      });
    });
  }
};

module.exports = settings;
module.exports.updateSettingsCache = updateSettingsCache;