var frontend      = require('../controllers/frontend'),
    config        = require('../config'),
    express       = require('express'),
    utils         = require('../utils'),
    
    frontendRoutes;

frontendRoutes = function frontendRoutes(middleware) {
  var router = express.Router(),
      subdir = config.paths.subdir,
      routeKeywords = config.routeKeywords,
      indexRouter = express.Router();
  
  return router;
};

module.exports = frontendRoutes;