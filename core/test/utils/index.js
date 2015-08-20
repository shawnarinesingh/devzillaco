var Promise       = require('bluebird'),
    sequence      = require('../../server/utils/sequence'),
    _             = require('lodash'),
    fs            = require('fs-extra'),
    path          = require('path'),
    migration     = require('../../server/data/migration/'),
    Models        = require('../../server/models'),
    SettingsAPI   = require('../../server/api/settings'),
    permissions   = require('../../server/permissions'),
    permsFixtures = require('../../server/data/fixtures/permissions/permissions.json'),
    DataGenerator = require('./fixtures/data-generator'),
    API           = require('./api'),
    fork          = require('./fork'),
    config        = require('../../server/config'),

    fixtures,
    getFixtureOps,
    toDoList,
    postsInserted = 0,

    teardown,
    setup,
    doAuth,
    login,
    togglePermalinks,

    initFixtures,
    initData,
    clearData;

/** TEST FIXTURES **/
fixtures = {
  insertRoles: function insertRoles() {
    var knex = config.database.knex;
    return knex('roles').insert(DataGenerator.forKnex.roles);
  },
  
  initOwnerUser: function initOwnerUser() {
    var user = DataGenerator.Content.users[0],
        knex = config.database.knex;
    
    user = DataGenerator.forKnex.createBasic(user);
    user = _.extend({}, user, {status: 'inactive'});
    
    return knex('roles').insert(DataGenerator.forKnex.roles).then(function () {
      return knex('users').insert(user);
    }).then(function () {
      return knex('roles_users').insert(DataGenerator.forKnex.roles_users[0]);
    });
  },
  
  overrideOwnerUser: function overrideOwnerUser() {
    var user,
        knex = config.database.knex;
        
    user = DataGenerator.forKnex.createUser(DataGenerator.Content.users[0]);
    
    return knex('users')
      .where('id', '=', '1')
      .update(user);
  },
  
  createUsersWithRoles: function createUsersWithRoles() {
    var knex = config.database.knex;
    return knex('roles').insert(DataGenerator.forKnex.roles).then(function () {
      return knex('users').insert(DataGenerator.forKnex.users);
    }).then(function () {
      return knex('roles_users').insert(DataGenerator.forKnex.roles_users);
    });
  },
  
  createExtraUsers: function createExtraUsers() {
    var knex = config.database.knex,
        // grab 3 more users
        extraUsers = DataGenerator.Content.users.slice(2, 5);

    extraUsers = _.map(extraUsers, function (user) {
      return DataGenerator.forKnex.createUser(_.extend({}, user, {
        email: 'a' + user.email,
        slug: 'a' + user.slug
      }));
    });

    return knex('users').insert(extraUsers).then(function () {
      return knex('roles_users').insert([
        {user_id: 5, role_id: 1},
        {user_id: 6, role_id: 2},
        {user_id: 7, role_id: 3}
      ]);
    });
  },
  
  // Creates a client, and access and refresh tokens for user 3 (author)
  createTokensForUser: function createTokensForUser() {
    var knex = config.database.knex;
    return knex('clients').insert(DataGenerator.forKnex.clients).then(function () {
      return knex('accesstokens').insert(DataGenerator.forKnex.createToken({user_id: 3}));
    }).then(function () {
      return knex('refreshtokens').insert(DataGenerator.forKnex.createToken({user_id: 3}));
    });
  },
  
  createInvitedUsers: function createInvitedUser() {
    var knex = config.database.knex,
        // grab 3 more users
        extraUsers = DataGenerator.Content.users.slice(2, 5);

    extraUsers = _.map(extraUsers, function (user) {
      return DataGenerator.forKnex.createUser(_.extend({}, user, {
        email: 'inv' + user.email,
        slug: 'inv' + user.slug,
        status: 'invited-pending'
      }));
    });

    return knex('users').insert(extraUsers).then(function () {
      return knex('roles_users').insert([
        {user_id: 8, role_id: 1},
        {user_id: 9, role_id: 2},
        {user_id: 10, role_id: 3}
      ]);
    });
  },
  
  insertOne: function insertOne(obj, fn) {
    var knex = config.database.knex;
    return knex(obj)
      .insert(DataGenerator.forKnex[fn](DataGenerator.Content[obj][0]));
  },
  
  // getImportFixturePath: function (filename) {
  //   return path.resolve(__dirname + '/fixtures/import/' + filename);
  // },

  // getExportFixturePath: function (filename) {
  //   return path.resolve(__dirname + '/fixtures/export/' + filename + '.json');
  // },
  
  permissionsFor: function permissionsFor(obj) {
    var knex = config.database.knex,
        permsToInsert = permsFixtures.permissions[obj],
        permsRolesToInsert = permsFixtures.permissions_roles,
        actions = [],
        permissionsRoles = [],
        roles = {
          Administrator: 1,
          Staff: 2,
          Subscriber: 3,
          Owner: 4
        };

    permsToInsert = _.map(permsToInsert, function (perms) {
      perms.object_type = obj;
      actions.push(perms.action_type);
      return DataGenerator.forKnex.createBasic(perms);
    });

    _.each(permsRolesToInsert, function (perms, role) {
      if (perms[obj]) {
        if (perms[obj] === 'all') {
          _.each(actions, function (action, i) {
            permissionsRoles.push({permission_id: (i + 1), role_id: roles[role]});
          });
        } else {
          _.each(perms[obj], function (action) {
            permissionsRoles.push({permission_id: (_.indexOf(actions, action) + 1), role_id: roles[role]});
          });
        }
      }
    });

    return knex('permissions').insert(permsToInsert).then(function () {
      return knex('permissions_roles').insert(permissionsRoles);
    });
  }
};

/** Test Utility Functions **/
initData = function initData() {
  return migration.init();
};

clearData = function clearData() {
  // we must always try to delete all tables
  return migration.reset();
};

toDoList = {
  permission: function insertPermission() { return fixtures.insertOne('permissions', 'createPermission'); },
  role: function insertRole() { return fixtures.insertOne('roles', 'createRole'); },
  roles: function insertRoles() { return fixtures.insertRoles(); },
  settings: function populateSettings() {
    return Models.Settings.populateDefaults().then(function () { return SettingsAPI.updateSettingsCache(); });
  },
  'users:roles': function createUsersWithRoles() { return fixtures.createUsersWithRoles(); },
  users: function createExtraUsers() { return fixtures.createExtraUsers(); },
  'user:token': function createTokensForUser() { return fixtures.createTokensForUser(); },
  owner: function insertOwnerUser() { return fixtures.insertOwnerUser(); },
  'owner:pre': function initOwnerUser() { return fixtures.initOwnerUser(); },
  'owner:post': function overrideOwnerUser() { return fixtures.overrideOwnerUser(); },
  'perms:init': function initPermissions() { return permissions.init(); },
  perms: function permissionsFor(obj) {
    return function permissionsForObj() { return fixtures.permissionsFor(obj); };
  }
};

/**
 * ## getFixtureOps
 * 
 * Takes the arguments from a setup function and turns them into an aray of promises to fulfill
 * @param {object} toDos
 */
getFixtureOps = function getFixtureOps(toDos) {
  // default = default fixtures, if it isn't present, init with tables only
  var tablesOnly = !toDos.default,
      fixtureOps = [];

  // Database initialisation
  if (toDos.init || toDos.default) {
    fixtureOps.push(function initDB() {
      return migration.init(tablesOnly);
    });
    delete toDos.default;
    delete toDos.init;
  }

  // Go through our list of things to do, and add them to an array
  _.each(toDos, function (value, toDo) {
    var tmp;
    if (toDo !== 'perms:init' && toDo.indexOf('perms:') !== -1) {
      tmp = toDo.split(':');
      fixtureOps.push(toDoList[tmp[0]](tmp[1]));
    } else {
      fixtureOps.push(toDoList[toDo]);
    }
  });

  return fixtureOps;
};

// ## Test Setup and Teardown

initFixtures = function initFixtures() {
  var options = _.merge({init: true}, _.transform(arguments, function (result, val) {
        result[val] = true;
      })),
      fixtureOps = getFixtureOps(options);
  
  return sequence(fixtureOps);
};

/**
 * ## Setup Integration Tests
 *
 * @returns {Function}
 */
setup = function setup() {
  var self = this,
      args = arguments;
  
  return function (done) {
    return Models.init().then(function () {
      return initFixtures.apply(self, args);
    }).then(function () {
      done();
    }).catch(done);
  };
};

/**
 * ## DoAuth For Route Tests
 * 
 * This function manages the work of ensuring we have an overridden owner user, and grabbing an access token
 * @returns {deferred.promise<AccessToken>}
 */
// @todo: Make this do the DB init as well
doAuth = function doAuth() {
  var options = arguments,
      request = arguments[0],
      fixtureOps;
  
  // Remove request from this list
  delete options[0];
  // No DB setup, but override the owner
  options = _.merge({'owner:post': true}, _.transform(options, function (result, val) {
    if (val) {
      result[val] = true;
    }
  }));
  
  fixtureOps = getFixtureOps(options);
  
  return sequence(fixtureOps).then(function () {
    return login(request);
  });
};

login = function login(request) {
  var user = DataGenerator.forModel.users[0];
  
  return new Promise(function (resolve, reject) {
    request.post('/api/v0.1/authentication/token/')
      .send({grant_type: 'password', username: user.email, password: user.password, client_id: 'admin'})
      .end(function (err, res) {
        if (err) {
          return reject(err);
        }
        
        resolve(res.body.access_token);
      });
  });
};

teardown = function teardown(done) {
  migration.reset().then(function () {
    done();
  }).catch(done);
};

module.exports = {
  teardown: teardown,
  setup: setup,
  doAuth: doAuth,
  login: login,

  initFixtures: initFixtures,
  initData: initData,
  clearData: clearData,

  fixtures: fixtures,

  DataGenerator: DataGenerator,
  API: API,

  fork: fork,

  // Helpers to make it easier to write tests which are easy to read
  context: {
    internal:   {context: {internal: true}},
    owner:      {context: {user: 1}},
    admin:      {context: {user: 2}},
    editor:     {context: {user: 3}},
    author:     {context: {user: 4}}
  },
  users: {
    ids: {
      owner: 1,
      admin: 2,
      staff: 3,
      subscriber: 4,
      admin2: 5,
      staff2: 6,
      subscriber2: 7
    }
  },
  roles: {
    ids: {
      owner: 4,
      admin: 1,
      staff: 2,
      subscriber: 3
    }
  },

  cacheRules: {
    public: 'public, max-age=0',
    hour:  'public, max-age=' + 3600,
    day: 'public, max-age=' + 86400,
    year:  'public, max-age=' + 31536000,
    private: 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  }
};
