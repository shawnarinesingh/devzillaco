var React = require('react');

var App = React.createClass({displayName: "App",
  render: function render() {
    return (
      React.createElement("div", {className: "App"}, "Hello, World!")  
    );
  }
});

module.exports = App;