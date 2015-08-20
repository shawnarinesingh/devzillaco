/*globals describe, before, beforeEach, afterEach, it*/
/*jshint expr:true*/
var testUtils       = require('../utils'),
    should          = require('should'),
    sinon           = require('sinon'),
    Promise         = require('bluebird'),
    _               = require('lodash'),

    // Stuff we are testing
    Models          = require('../../server/models'),
    permissions     = require('../../server/permissions'),
//    effectivePerms  = require('../../server/permissions/effective'),
//    context         = testUtils.context.owner,

    sandbox         = sinon.sandbox.create();

// @todo: Move to integrations or stub

describe('Permissions', function () {
  before(function (done) {
    Models.init().then(done).catch(done);
  });
  
  afterEach(function () {
    sandbox.restore();
  });
  
  beforeEach(function () {
    var permissions = _.map(testUtils.DataGenerator.Content.permissions, function (testPerm) {
      return testUtils.DataGenerator.forKnex.createPermission(testPerm);
    });
    
    sandbox.stub(Models.Permission, 'findAll', function () {
      return Promise.resolve(Models.Permissions.forge(permissions));
    });
  });
  
  it('can load an actions map from existing permissions', function (done) {
    permissions.init().then(function (actionsMap) {
      should.exist(actionsMap);
      
      actionsMap.edit.sort().should.eql(['setting', 'user'].sort());
      
      actionsMap.should.equal(permissions.actionsMap);
      
      done();
    }).catch(done);
  });
})