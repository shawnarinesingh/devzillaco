var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    NotFoundRoute = require('react-router').NotFoundRoute,
    
    App = require('./components/App'),
    NotFound = require('./components/NotFound'),
    Admin = require('./components/admin/Admin'),
    Login = require('./components/admin/Login');

var routes = (
  <Route name="home" path="/">
    <DefaultRoute handler={App} />
    
    <Route name="admin" path="/admin/" handler={Admin} />
    <Route name="login" path="/admin/login/" handler={Login} />
    
    <NotFoundRoute handler={NotFound} />
  </Route>
);

module.exports = routes;