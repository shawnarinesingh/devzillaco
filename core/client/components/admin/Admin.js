var React = require('react'),

    Header = require('../Header');

var Admin = React.createClass({
  render: function render() {
    return (
      <div className="Admin">
        <Header />
        Hello, Admin!
      </div>
    );
  }
});

module.exports = Admin;