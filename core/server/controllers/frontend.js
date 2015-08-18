/**
 * Main controller for Frontend
 */

/*global require, module */

var _           = require('lodash'),
    path        = require('path'),
    fs          = require('fs'),
    config      = require('../config'),

    templateFile,
    template,
    frontendControllers;

templateFile = path.join(config.paths.serverPath, 'views/index.html');
template = _.template(fs.readFileSync(templateFile, 'utf8'));

frontendControllers = {
  
};

module.exports = frontendControllers;