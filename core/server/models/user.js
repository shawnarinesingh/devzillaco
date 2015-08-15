var _              = require('lodash'),
    Promise        = require('bluebird'),
    errors         = require('../errors'),
    utils          = require('../utils'),
    bcrypt         = require('bcryptjs'),
    appBookshelf = require('./base'),
    crypto         = require('crypto'),
    validator      = require('validator'),
    request        = require('request'),
    validation     = require('../data/validation'),
    config         = require('../config'),
    events         = require('../events'),

    bcryptGenSalt  = Promise.promisify(bcrypt.genSalt),
    bcryptHash     = Promise.promisify(bcrypt.hash),
    bcryptCompare  = Promise.promisify(bcrypt.compare),

    tokenSecurity  = {},
    activeStates   = ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked'],
    invitedStates  = ['invited', 'invited-pending'],
    User,
    Users;

function validatePasswordLength(password) {
  return validator.isLength(password, 8);
}

function generatePasswordHash(password) {
  // Generate a new salt
  return bcryptGenSalt().then(function (salt) {
    // Hash the provided password with bcrypt
    return bcryptHash(password, salt);
  });
}

User = appBookshelf.Model.extend({
  
  tableName: 'users',
  
  emitChange: function emitChange(event) {
    events.emit('user' + '.' + event, this);
  },
  
  initialize: function initialize() {
    appBookshelf.Model.prototype.initialize.apply(this, arguments);
    
    this.on('created', function onCreated(model) {
      model.emitChange('added');
      
      // active is the default state, so if status isn't provided, this will be an active user
      if (!model.get('status') || _.contains(activeStates, model.get('status'))) {
        model.emitChange('activated');
      }
    });
    this.on('updated', function onUpdated(model) {
      model.statusChanging = model.get('status') !== model.updated('status');
      model.isActive = _.contains(activeStates, model.get('status'));
      
      if (model.statusChanging) {
        model.emitChange(model.isActive ? 'activated' : 'deactivated');
      } else {
        if (model.isActive) {
          model.emitChange('activated.edited');
        }
      }
      
      model.emitChange('edited');
    });
    this.on('destroyed', function onDestroyed(model) {
      if (_.contains(activeStates, model.previous('status'))) {
        model.emitChange('deactivated');
      }
      
      model.emitChange('deleted');
    });
  },
  
  saving: function saving(newPage, attr, options) {
    var self = this;
    
    appBookshelf.Model.prototype.saving.apply(this, arguments);
    
    if (this.hasChanged('slug') || !this.get('slug')) {
      // Generating a slug requires a db call to look for conflicting slugs
      return appBookshelf.Model.generateSlug(User, this.get('slug') || this.get('name'),
        {status: 'all', transacting: options.transacting, shortSlug: !this.get('slug')})
        .then(function then(slug) {
          self.set({slug: slug});
        });
    }
  },
  
  // For the user model ONLY it is possible to disable validations.
  // This is used to bypass validation during the credential check, and must never be done with user-provided data
  validate: function validate() {
    var opts = arguments[1];
    if (opts && _.has(opts, 'validate') && opts.validate === false) {
      return;
    }
    return validation.validateSchema(this.tableName, this.toJSON());
  },
  
  // Get the user from the options object
  contextUser: function contextUser(options) {
    // Default to context user
    if (options.context && options.context.user) {
      return options.context.user;
    // Otherwise use the internal override
    } else if (options.context && options.context.internal) {
      return 1;
    // This is the user object, so try using this user's id
    } else if (this.get('id')) {
      return this.get('id');
    } else {
      errors.logAndThrowError(new Error('missing context'));
    }
  },
  
  toJSON: function toJSON(options) {
    var attrs = appBookshelf.Model.prototype.toJSON.call(this, options);
    // remove password hash for security reasons
    delete attrs.password;
    
    if (!options || !options.context || (!options.context.user && !options.context.internal)) {
      delete attrs.email;
    }
    
    return attrs;
  },
  
  format: function format(options) {
    if (!_.isEmpty(options.website) &&
        !validator.isURL(options.website, {
        require_protocol: true,
        protocols: ['http', 'https']})) {
      options.website = 'http://' + options.website;
    }
    return appBookshelf.Model.prototype.format.call(this, options);
  },
  
  roles: function roles() {
    return this.belongsToMany('Role');
  },
  
  permissions: function permissions() {
    return this.belongsToMany('Permission');
  },
  
  hasRole: function hasRole(roleName) {
    var roles = this.related('roles');
    
    return roles.some(function getRole(role) {
      return role.get('name') === roleName;
    });
  }
});

Users = appBookshelf.Collection.extend({
  model: User
});

module.exports = {
  User: appBookshelf.model('User', User),
  Users: appBookshelf.collection('Users', Users)
};