var frontend      = require('../controllers/frontend'),
    config        = require('../config'),
    express       = require('express'),
    utils         = require('../utils'),
    
    frontendRoutes;

frontendRoutes = function frontendRoutes(middleware) {
  var router = express.Router();
  
  router.get('*', frontend.index);
  
  return router;
};

module.exports = frontendRoutes;