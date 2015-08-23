var React = require('react'),
    Route = require('react-router').Route,
    DefaultRoute = require('react-router').DefaultRoute,
    App = require('./components/App');

var routes = (
  React.createElement(Route, {name: "app", path: "/admin", handler: App}, 
    React.createElement(DefaultRoute, {handler: App})
  )
);

module.exports = routes;