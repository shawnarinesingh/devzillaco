var React = require('react'),
    App = require('./components/App');

function run() {
  var app = React.render(<App />, document.getElementById('app'));
  
  return app;
}

run();

module.exports = run();