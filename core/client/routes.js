var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    NotFoundRoute = require('react-router').NotFoundRoute,
    
    App = require('./components/App'),
    NotFound = require('./components/NotFound'),
    Admin = require('./components/admin/Admin'),
    AdminLogin = require('./components/admin/Login');

var routes = (
  <Route name="home" path="/">
    <Route name="admin" path="admin/" handler={Admin}>
      <Route name="login" path="login/" handler={AdminLogin} />
    </Route>
    <NotFoundRoute handler={NotFound} />
    <DefaultRoute handler={App} />
  </Route>
);

module.exports = routes;