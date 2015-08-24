var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    
    App = require('./components/App'),
    Admin = require('./components/admin/Admin');

var routes = (
  <Route name="app" path="/">
    <Route name="admin" path="admin/" handler={Admin} />
    <DefaultRoute handler={App} />
  </Route>
);

module.exports = routes;