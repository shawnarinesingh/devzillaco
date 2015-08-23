var React = require('react'),
    App = require('./components/App');

function run() {
  var app = React.render(<App />, document.body);
  
  return app;
}

module.exports = run();