var _             = require('lodash'),
    uuid          = require('node-uuid'),
    globalUtils   = require('../../../server/utils'),
    DataGenerator = {};
/*jshint quotmark:false*/
// jscs:disable validateQuoteMarks, requireCamelCaseOrUpperCaseIdentifiers
DataGenerator.Content = {
  // Password = Sl1m3rson
  users: [
    {
      name: 'Joe Bloggs',
      slug: 'joe-bloggs',
      email: 'jbloggs@example.com',
      password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
    },
    {
      name: 'Smith Wellingsworth',
      slug: 'smith-wellingsworth',
      email: 'swellingsworth@example.com',
      password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
    },
    {
      name: 'Jimothy Bogendath',
      slug: 'jimothy-bogendath',
      email: 'jbOgendAth@example.com',
      password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
    },
    {
      name: 'Slimer McEctoplasm',
      slug: 'slimer-mcectoplasm',
      email: 'smcectoplasm@example.com',
      password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
    },
    {
      name: 'Ivan Email',
      slug: 'ivan-email',
      email: 'info@ghost.org',
      password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
    }
  ],
  
  permissions: [
    {
      name: 'Browse settings',
      action_type: 'browse',
      object_type: 'setting'
    },
    {
      name: 'test',
      action_type: 'edit',
      object_type: 'setting'
    },
    {
      name: 'test',
      action_type: 'edit',
      object_type: 'user'
    },
    {
      name: 'test',
      action_type: 'add',
      object_type: 'user'
    },
    {
      name: 'test',
      action_type: 'destroy',
      object_type: 'user'
    }
  ],
    
  roles: [
    {
      name:             'Administrator',
      description:      'Administrators'
    },
    {
      name:             'Staff',
      description:      'Staff'
    },
    {
      name:             'Subscriber',
      description:      'Subscribers'
    },
    {
      name:             'Owner',
      description:      'Owner'
    }
  ]
};

DataGenerator.forKnex = (function () {
  var roles,
      users,
      roles_users,
      clients;
  
  function createBasic(overrides) {
    return _.defaults(overrides, {
      uuid: uuid.v4(),
      created_by: 1,
      created_at: new Date(),
      updated_by: 1,
      updated_at: new Date()
    });
  }
  
  function createUser(overrides) {
    return _.defaults(overrides, {
      uuid: uuid.v4(),
      statis: 'active',
      created_by: 1,
      created_at: new Date()
    });
  }
  
  function createGenericUser(uniqueInteger) {
    return createUser({
      name: 'Josh Pager',
      slug: 'josh-pager',
      email: 'josh_' + uniqueInteger + '@default.com',
      password: '$2a$10$.pZeeBE0gHXd0PTnbT/ph.GEKgd0Wd3q2pWna3ynTGBkPKnGIKZL6'
    });
  }
  
  function createToken(overrides) {
    return _.defaults(overrides, {
      token: uuid.v4(),
      client_id: 1,
      expires: Date.now() + globalUtils.ONE_DAY_MS
    });
  }
  
  roles = [
    createBasic(DataGenerator.Content.roles[0]),
    createBasic(DataGenerator.Content.roles[1]),
    createBasic(DataGenerator.Content.roles[2]),
    createBasic(DataGenerator.Content.roles[3])
  ];

  users = [
    createUser(DataGenerator.Content.users[0]),
    createUser(DataGenerator.Content.users[1]),
    createUser(DataGenerator.Content.users[2]),
    createUser(DataGenerator.Content.users[3])
  ];

  clients = [
    createBasic({name: 'Admin', slug: 'admin', secret: 'not_available'})
  ];

  roles_users = [
    {user_id: 1, role_id: 4},
    {user_id: 2, role_id: 1},
    {user_id: 3, role_id: 2},
    {user_id: 4, role_id: 3}
  ];
  
  return {
    createUser: createUser,
    createGenericUser: createGenericUser,
    createBasic: createBasic,
    createRole: createBasic,
    createPermission: createBasic,
    createToken: createToken,
    
    roles: roles,
    users: users,
    roles_users: roles_users,
    clients: clients
  };
}());

DataGenerator.forModel = (function () {
  var users,
      roles;
  
  users = _.map(DataGenerator.Content.users, function (user) {
    user = _.pick(user, 'name', 'email');
    
    return _.defaults({
      password: 'Sl1m3rson'
    }, user);
  });
  
  roles = _.map(DataGenerator.Content.roles, function (role, id) {
    return _.extend({}, role, {id: id + 1});
  });
  
  return {
    users: users,
    roles: roles
  };
}());

module.exports = DataGenerator;