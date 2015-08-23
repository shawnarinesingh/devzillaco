var Iso = require('iso'),
    React = require('react'),
    Router = require('react-router'),
    routes = require('../routes');

function routerRenderer(alt) {
  if (typeof window === 'undefined') {
    return function (state, url) {
      var markup;
      Router.run(routes, url, function (Handler) {
        alt.bootstrap(state);
        var content = React.renderToString(React.createElement(Handler));
        markup = Iso.render(content, alt.takeSnapshot());
        alt.flush();
      });
      return markup;
    };
  } else {
    Iso.bootstrap(function (state, _, container) {
      alt.bootstrap(state);
      Router.run(routes, Router.HistoryLocation, function (Handler) {
        var node = React.createElement(Handler);
        React.render(node, container);
      });
    });
  }
}

module.exports = routerRenderer;