var React = require('react'),

    Header = require('./Header');

var App = React.createClass({displayName: "App",
  render: function render() {
    return (
      React.createElement("div", {className: "App"}, 
        React.createElement(Header, null), 
        "Hello, World!"
      )
    );
  }
});

module.exports = App;