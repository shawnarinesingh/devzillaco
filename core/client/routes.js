var React = require('react'),
    {Route, DefaultRoute} = require('react-router'),
    App = require('./components/App.react');

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={App} />
  </Route>
);

module.exports = routes;