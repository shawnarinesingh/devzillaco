var appBookshelf = require('./base'),

    Permission,
    Permissions;
    
Permission = appBookshelf.Model.extend({
  
  tableName: 'permissions',
  
  roles: function roles() {
    return this.belongsToMany('Role');
  },
  
  users: function users() {
    return this.belongsToMany('User');
  }
});

Permissions = appBookshelf.Collection.extend({
  model: Permission
});

module.exports = {
  Permission: appBookshelf.model('Permission', Permission),
  Permissions: appBookshelf.collection('Permissions', Permissions)
};