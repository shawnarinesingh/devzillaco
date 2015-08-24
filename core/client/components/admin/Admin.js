var React = require('react'),
    Link = require('react-router').Link,

    Header = require('../Header');

var Admin = React.createClass({
  render: function render() {
    var path = this.props.path;
    return (
      <div className="Admin">
        <Header />
        Hello, Admin!!
        
        <Link to="login">Login</Link>
      </div>
    );
  }
});

module.exports = Admin;