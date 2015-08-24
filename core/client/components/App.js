var React = require('react'),
    Link = require('react-router').Link,

    Header = require('./Header');

var App = React.createClass({
  render: function render() {
    return (
      <div className="App">
        <Header />
        Hello, World!
        <hr />
        <Link to="admin">Admin page</Link>
      </div>
    );
  }
});

module.exports = App;