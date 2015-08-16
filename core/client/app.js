var React = require('react'),
    App = require('./components/App'),
    
    container,
    context;

container = document.getElementById('app');

context = {
  onSetTitle: value => document.title = value,
  onSetMeta: function (name, content) {
    // Remove and create a new <meta /> tag in order to make it work
    // with bookmarks in Safari
    var elements = document.getElementsByTagName('meta'),
        meta = document.createElement('meta');
    
    [].slice.call(elements).forEach(function (element) {
      if (element.getAttribute('name') === name) {
        element.parentNode.removeChild(element);
      }
    });
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document.getElementsByTagName('head')[0].appendChild(meta);
  }
};

module.exports = React.renderToString(<App />, container);