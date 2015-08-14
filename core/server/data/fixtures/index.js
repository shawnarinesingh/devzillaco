// # Fixtures
// This module handles populating or updating fixtures.
//
// Currently fixtures only change between data version 002 and 003, therefore the update login is hard coded 
// rather than abstracted into a migration system.  The upgrade function checks that its changes are safe before 
// making them.

var Promise     = require('bluebird'),
    sequence    = require('../../utils/sequence'),
    _           = require('lodash'),
    errors      = require('../../errors'),
    utils       = require('../../utils'),
    models      = require('../../models'),
    fixtures    = require('./fixtures'),
    permissions = require('./permissions'),

    // Private
    logInfo,
    convertAdminToOwner,
    createOwner,
    options = {context: {internal: true}},

    // Public
    populate,
    update;
    
logInfo = function logInfo(message) {
  errors.logInfo('Migrations', message);
};

/**
 * Convert admin to Owner
 * Changes an damin user to have the owner role
 * @returns {Promise|*}
 */
convertAdminToOwner = function () {
  var adminUser;
  
  return models.User.findOne({role: 'Administrator'}).then(function (user) {
    adminUser = user;
    return models.Role.findOne({name: 'Owner'});
  }).then(function (ownerRole) {
    if (adminUser) {
      logInfo('Converting admin to owner');
      return adminUser.roles().updatePivot({role_id: ownerRole.id});
    }
  });
};

/**
 * Create Owner
 * Creates the user fixtures and gives it the owner role
 * @returns {Promise|*}
 */
createOwner = function () {
  var user = fixtures.users[0];
  
  return models.Role.findOne({name: 'Owner'}).then(function (ownerRole) {
    user.roles = [ownerRole.id];
    user.password = utils.uid(50);
    
    logInfo('Creating owner');
    return models.User.add(user, options);
  });
};

populate = function () {
  var ops = [],
      relations = [],
      Role = models.Role;
  
  logInfo('Populating fixtures');
  
  _.each(fixtures.roles, function (role) {
    ops.push(Role.add(role, options));
  });
  
  return Promise.all(ops).then(function () {
    return sequence(relations);
  }).then(function () {
    return permissions.populate(options);
  }).then(function () {
    return createOwner();
  }).catch(function (errs) {
    errors.logError(errs);
  });
};

update = function (fromVersion, toVersion) {
  logInfo('Updating fixtures');
  // Updating fixtures logic goes here.
  return;
};

module.exports = {
  populate: populate,
  update: update
};