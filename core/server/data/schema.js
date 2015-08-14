var db = {
  users: {
    id: {type: 'increments', nullable: false, primary: true},
    uuid: {type: 'string', maxlength: 36, nullable: false, validations: {isUUID: true}},
    name: {type: 'string', maxlength: 150, nullable: false},
    slug: {type: 'string', maxlength: 150, nullable: false, unique: true},
    password: {type: 'string', maxlength: 60, nullable: false},
    email: {type: 'string', maxlength: 254, nullable: false, unique: true, validations: {isEmail: true}},
    image: {type: 'text', maxlength: 2000, nullable: true},
    cover: {type: 'text', maxlength: 2000, nullable: true},
    bio: {type: 'string', maxlength: 200, nullable: true},
    website: {type: 'text', maxlength: 2000, nullable: true, validations: {isEmptyOrURL: true}},
    location: {type: 'text', maxlength: 65535, nullable: true},
    accessibility: {type: 'text', maxlength: 65535, nullable: true},
    status: {type: 'string', maxlength: 150, nullable: false, defaultTo: 'active'},
    language: {type: 'string', maxlength: 6, nullable: false, defaultTo: 'en_US'},
    meta_title: {type: 'string', maxlength: 150, nullable: true},
    meta_description: {type: 'string', maxlength: 200, nullable: true},
    last_login: {type: 'dateTime', nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'integer', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    updated_by: {type: 'integer', nullable: true}
  },
  roles: {
    id: {type: 'increments', nullable: false, primary: true},
    uuid: {type: 'string', maxlength: 36, nullable: false, validations: {isUUID: true}},
    name: {type: 'string', maxlength: 150, nullable: false},
    description: {type: 'string', maxlength: 200, nullable: true},
    created_at: {type: 'dateTime',  nullable: false},
    created_by: {type: 'integer',  nullable: false},
    updated_at: {type: 'dateTime',  nullable: true},
    updated_by: {type: 'integer',  nullable: true}
  },
  roles_users: {
    id: {type: 'increments', nullable: false, primary: true},
    role_id: {type: 'integer', nullable: false},
    user_id: {type: 'integer', nullable: false}
  },
  permissions: {
    id: {type: 'increments', nullable: false, primary: true},
    uuid: {type: 'string', maxlength: 36, nullable: false, validations: {isUUID: true}},
    name: {type: 'string', maxlength: 150, nullable: false},
    object_type: {type: 'string', maxlength: 150, nullable: false},
    action_type: {type: 'string', maxlength: 150, nullable: false},
    object_id: {type: 'integer', nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'integer', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    updated_by: {type: 'integer', nullable: true}
  },
  permissions_users: {
    id: {type: 'increments', nullable: false, primary: true},
    user_id: {type: 'integer', nullable: false},
    permission_id: {type: 'integer', nullable: false}
  },
  permissions_roles: {
    id: {type: 'increments', nullable: false, primary: true},
    role_id: {type: 'integer', nullable: false},
    permission_id: {type: 'integer', nullable: false}
  },
  settings: {
    id: {type: 'increments', nullable: false, primary: true},
    uuid: {type: 'string', maxlength: 36, nullable: false, validations: {isUUID: true}},
    key: {type: 'string', maxlength: 150, nullable: false, unique: true},
    value: {type: 'text', maxlength: 65535, nullable: true},
    type: {type: 'string', maxlength: 150, nullable: false, defaultTo: 'core', validations: {isIn: [['core', 'blog', 'theme', 'app', 'plugin']]}},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'integer', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    updated_by: {type: 'integer', nullable: true}
  },
  clients: {
    id: {type: 'increments', nullable: false, primary: true},
    uuid: {type: 'string', maxlength: 36, nullable: false},
    name: {type: 'string', maxlength: 150, nullable: false, unique: true},
    slug: {type: 'string', maxlength: 150, nullable: false, unique: true},
    secret: {type: 'string', maxlength: 150, nullable: false, unique: true},
    created_at: {type: 'dateTime', nullable: false},
    created_by: {type: 'integer', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    updated_by: {type: 'integer', nullable: true}
  },
  accesstokens: {
    id: {type: 'increments', nullable: false, primary: true},
    token: {type: 'string', nullable: false, unique: true},
    user_id: {type: 'integer', nullable: false, unsigned: true, references: 'users.id'},
    client_id: {type: 'integer', nullable: false, unsigned: true, references: 'clients.id'},
    expires: {type: 'bigInteger', nullable: false}
  },
  refreshtokens: {
    id: {type: 'increments', nullable: false, primary: true},
    token: {type: 'string', nullable: false, unique: true},
    user_id: {type: 'integer', nullable: false, unsigned: true, references: 'users.id'},
    client_id: {type: 'integer', nullable: false, unsigned: true, references: 'clients.id'},
    expires: {type: 'bigInteger', nullable: false}
  }
};

function isUser(jsonData) {
  return jsonData.hasOwnProperty('bio') && jsonData.hasOwnProperty('website') &&
    jsonData.hasOwnProperty('status') && jsonData.hasOwnProperty('location');
}

function isNav(jsonData) {
  return jsonData.hasOwnProperty('label') && jsonData.hasOwnProperty('url') &&
    jsonData.hasOwnProperty('slug') && jsonData.hasOwnProperty('current');
}

module.exports.tables = db;
module.exports.checks = {
  isUser: isUser,
  isNav: isNav
};
