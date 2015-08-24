var React = require('react'),

    Header = require('./Header');

var App = React.createClass({
  render: function render() {
    return (
      <div className="App">
        <Header />
        Hello, World!
      </div>
    );
  }
});

module.exports = App;