var api           = require('../api'),
    config        = require('../config'),
    express       = require('express'),
    utils         = require('../utils'),
    React         = require('react'),
    Router        = require('react-router'),
    
    frontendRoutes;

var buildPath = config.paths.buildPath;
var routes = require(buildPath + 'routes');

frontendRoutes = function frontendRoutes(middleware) {
  var router = express.Router();
  
  router.get('*', function (req, res, next) {
    return api.configuration.browse().then(function then(data) {
      var router = Router.create({location: req.url, routes: routes});
      router.run(function (Handler, state) {
        var html = React.renderToString(React.createElement(Handler));
        console.log(state);
        return res.render('index', {
          body: html
        });
      });
    });
  });
  
  return router;
};

module.exports = frontendRoutes;