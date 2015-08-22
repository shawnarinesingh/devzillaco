var hbs             = require('express-hbs'),
    Promise         = require('bluebird'),
    errors          = require('../errors'),
    utils           = require('./utils'),
    coreHelpers     = {},
    registerHelpers;

// Pre-load settings data:

if (!utils.isProduction) {
    hbs.handlebars.logger.level = 0;
}

coreHelpers.helperMissing = function (arg) {
    if (arguments.length === 2) {
        return undefined;
    }
    errors.logError('Missing helper: "' + arg + '"');
};

registerHelpers = function (adminHbs) {
    // Expose hbs instance for admin
    coreHelpers.adminHbs = adminHbs;
};

module.exports.loadCoreHelpers = registerHelpers;