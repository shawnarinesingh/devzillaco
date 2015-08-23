var React = require('react'),
    App = require('./components/App');

function run() {
  var app = React.render(React.createElement(App, null), document.body);
  
  return app;
}

