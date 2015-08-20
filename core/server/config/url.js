// Contains all path information to be used throughout
// the codebase.

var moment        = require('moment'),
    _             = require('lodash'),
    appConfig     = '';

// ## setConfig
// Simple utility function to allow
// passing of the appConfig
// object here to be used locally
// to ensure clean dependency graph
// (i.e. no circular dependencies).
function setConfig(config) {
  appConfig = config;
}

function getBaseUrl(secure) {
  return (secure && appConfig.urlSSL) ? appConfig.urlSSL : appConfig.url;
}

function urlJoin() {
  var args = Array.prototype.slice.call(arguments),
      prefixDoubleSlash = false,
      subdir = appConfig.paths.subdir.replace(/\//g, ''),
      subdirRegex,
      url;
  
  // Remove empty item at the beginning
  if (args[0] === '') {
    args.shift();
  }
  
  // Handle schemeless protocols
  if (args[0].indexOf('//') === 0) {
    prefixDoubleSlash = true;
  }
  
  // join the elements using a slash
  url = args.join('/');
  
  // Fix multiple slashes
  url = url.replace(/(^|[^:])\/\/+/g, '$1/');
  
  // Put the double slash back at the beginning if this was a schemeless protocol
  if (prefixDoubleSlash) {
    url = url.replace(/^\//, '//');
  }
  
  // Deduplicate subdirectory
  if (subdir) {
    subdirRegex = new RegExp(subdir + '\/' + subdir);
    url = url.replace(subdirRegex, subdir);
  }
  
  return url;
}

// ## createUrl
// Simple url creation from a given path
// Ensures that our urls contain the subdirectory if there is one
// And are correctly formatted as either relative or absolute
// Usage:
// createUrl('/', true) -> http://default.com/
// E.g. /about/ subdir
// createUrl('/welcome/') -> /about/welcome/
// Parameters:
// - urlPath - string which must start and end with a slash
// - absolute (optional, default:false) - boolean whether or not the url should be absoltue
// - secure (optional, default:false) - boolean whether or not to use urlSSL or url config
// Returns:
// - a URL which always ends with a slash
function createUrl(urlPath, absolute, secure) {
  urlPath = urlPath || '/';
  absolute = absolute || false;
  var base;
  
  // create base of url, always ends without a slash
  if (absolute) {
    base = getBaseUrl(secure);
  } else {
    base = appConfig.paths.subdir;
  }
  
  return urlJoin(base, urlPath);
}

// ## urlFor
// Synchronous url creation for a given context
// Can generate a url for a named path, given path, or known object
function urlFor(context, data, absolute) {
  var urlPath = '/',
      secure,
      imagePathRe,
      knownObjects = ['image'],
      baseUrl,
      hostname,
      
      knownPaths = {
        home: '/',
        api: '/api/v0.1'
      };
  
  // Make data properly optional
  if (_.isBoolean(data)) {
    absolute = data;
    data = null;
  }
  
  // Can pass 'secure' flag in either context or data arg
  secure = (context && context.secure) || (data && data.secure);
  
  if (_.isObject(context) && context.relativeUrl) {
    urlPath = context.relativeUrl;
  } else if (_.isString(context) && _.indexOf(knownObjects, context) !== -1) {
    // trying to create a url for an object
    if (context === 'image' && data.image) {
      urlPath = data.image;
      imagePathRe = new RegExp('^' + appConfig.paths.subdir + '/' + appConfig.paths.imagesRelPath);
      absolute = imagePathRe.test(data.image) ? absolute : false;
      secure = data.image.secure;
      
      if (absolute) {
        // Remove the sub-directoy from the url because appConfig will add it back.
        urlPath = urlPath.replace(new RegExp('^' + appConfig.paths.subdir), '');
        baseUrl = getBaseUrl(secure).replace(/\/$/, '');
        urlPath = baseUrl + urlPath;
      }
      
      return urlPath;
    }
  } else if (_.isString(context) && _.indexOf(_.keys(knownPaths), context) !== -1) {
    // trying to create a url from a named path
    urlPath = knownPaths[context] || '/';
  }
  
  // This url already has a protocol so is likely an external url to be returned
  if (urlPath && (urlPath.indexOf(':/') !== -1 || urlPath.indexOf('mailto:') === 0)) {
    return urlPath;
  }
  
  return createUrl(urlPath, absolute, secure);
}

module.exports.setConfig = setConfig;
module.exports.urlJoin = urlJoin;
module.exports.urlFor = urlFor;