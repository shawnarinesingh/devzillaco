var React = require('react'),
    Link = require('react-router').Link,

    Header = require('./Header');

var App = React.createClass({
  render: function render() {
    return (
      <div className="App">
        <Header />
        Page not found!!
      </div>
    );
  }
});

module.exports = App;