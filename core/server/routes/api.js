// # API routes
var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function apiRoutes(middleware) {
  var router = express.Router();
  // alias delete with del
  router.del = router.delete;
  
  // ## Configuration
  router.get('/configuration', api.http(api.configuration.browse));
  router.get('/configuration/:key', api.http(api.configuration.read));
  
  // ## Settings
  router.get('/settings', api.http(api.settings.browse));
  router.get('/settings/:key', api.http(api.settings.read));
  router.put('/settings', api.http(api.settings.edit));

  // ## Users
  router.get('/users', api.http(api.users.browse));
  router.get('/users/:id', api.http(api.users.read));
  router.get('/users/slug/:slug', api.http(api.users.read));
  router.get('/users/email/:email', api.http(api.users.read));
  router.put('/users/password', api.http(api.users.changePassword));
  router.put('/users/owner', api.http(api.users.transferOwnership));
  router.put('/users/:id', api.http(api.users.edit));
  router.post('/users', api.http(api.users.add));
  router.del('/users/:id', api.http(api.users.destroy));
  
  // ## Roles
  router.get('/roles/', api.http(api.roles.browse));

  // ## Slugs
  router.get('/slugs/:type/:name', api.http(api.slugs.generate));
  
  // ## Notifications
  router.get('/notifications', api.http(api.notifications.browse));
  router.post('/notifications', api.http(api.notifications.add));
  router.del('/notifications/:id', api.http(api.notifications.destroy));

  // ## DB
  router.get('/db', api.http(api.db.exportContent));

  // ## Mail
  router.post('/mail', api.http(api.mail.send));
  router.post('/mail/test', api.http(api.mail.sendTest));
  
  // ## Uploads
  router.post('/uploads', middleware.busboy, api.http(api.uploads.add));
  
  return router;
};

module.exports = apiRoutes;