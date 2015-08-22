var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    App = require('./components/App');

var routes = (
  <Route name="app" path="/admin" handler={App}>
    <DefaultRoute handler={App} />
  </Route>
);

module.exports = routes;