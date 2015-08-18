var routerRenderer = require('./utils/routerRenderer'),
    alt = require('./alt'),
    routes = require('./routes');

module.exports = routerRenderer(alt, routes);