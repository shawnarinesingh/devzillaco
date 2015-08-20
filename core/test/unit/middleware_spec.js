/*globals describe, beforeEach, afterEach, it*/
/*jshint expr:true*/
var assert          = require('assert'),
    crypto          = require('crypto'),
    should          = require('should'),
    sinon           = require('sinon'),
    Promise         = require('bluebird'),
    middleware      = require('../../server/middleware').middleware,
    api             = require('../../server/api'),
    errors          = require('../../server/errors'),
    fs              = require('fs');

function hash(password, salt) {
  var hasher = crypto.createHash('ha256');
  
  hasher.update(password + salt, 'utf8');
  
  return hasher.digest('hex');
}

describe('Middleware', function () {
  var sandbox,
      apiSettingsStub;
  
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });
  
  afterEach(function () {
    sandbox.restore();
  });
  
  describe('whenEnabled', function () {
    var cbFn, app;
    
    beforeEach(function () {
      cbFn = sinon.spy();
      app = {
        enabled: function (setting) {
          if (setting === 'enabled') {
            return true;
          } else {
            return false;
          }
        }
      };
      
      middleware.cacheApp(app);
    });
    
    it('should call function if setting is enabled', function (done) {
      var req = 1,
          res = 2, 
          next = 3;
      
      middleware.whenEnabled('enabled', function (a, b, c) {
        assert.equal(a, 1);
        assert.equal(b, 2);
        assert.equal(c, 3);
        done();
      })(req, res, next);
    });
    
    it('should call next() if setting is disabled', function (done) {
      middleware.whenEnabled('rando', cbFn)(null, null, function (a) {
        should.not.exist(a);
        cbFn.calledOnce.should.be.false;
        done();
      });
    });
  });
  
  describe('isSSLRequired', function () {
    var isSSLrequired = middleware.isSSLrequired;
    
    it('SSL is required if config.url starts with https', function () {
      isSSLrequired(undefined, 'https://default.com', undefined).should.be.true;
    });
    
    it('SSL is required if isAdmin and config.forceAdminSSL is set', function () {
      isSSLrequired(true, 'http://default.com', true).should.be.true;
    });
    
    it('SSL is not required if config.url starts with "http:/" and force AdminSSL is not set', function () {
      isSSLrequired(false, 'http://default.com', false).should.be.false;
    });
  });
  
  describe('sslForbiddenOrRedirect', function () {
    var sslForbiddenOrRedirect = middleware.sslForbiddenOrRedirect;
    
    it('Return forbidden if config forces admin SSL for AdminSSL redirect is false.', function () {
      var response = sslForbiddenOrRedirect({
        forceAdminSSL: {redirect: false},
        configUrl: 'http://default.com'
      });
      response.isForbidden.should.be.true;
    });
    
    it('If not forbidden, should produce SSL to redirect to when config.url ends with no slash', function () {
      var response = sslForbiddenOrRedirect({
        forceAdminSSL: {redirect: true},
        configUrl: 'http://default.com/config/path',
        reqUrl: '/req/path'
      });
      response.isForbidden.should.be.false;
      response.redirectUrl({}).should.equal('https://default.com/config/path/req/path');
    });
    
    it('If config ends is slash, potential double-slash in resulting URL is removed', function () {
      var response = sslForbiddenOrRedirect({
        forceAdminSSL: {redirect: true},
        configUrl: 'http://default.com/config/path/',
        reqUrl: '/req/path'
      });
      response.redirectUrl({}).should.equal('https://default.com/config/path/req/path');
    });
    
    it('If config.urlSSL is provided it is preferred over config.url', function () {
      var response = sslForbiddenOrRedirect({
        forceAdminSSL: {redirect: true},
        configUrl: 'http://default.com/config/path/',
        configUrlSSL: 'https://default.com/ssl/config/path/',
        reqUrl: '/req/path'
      });
      response.redirectUrl({}).should.equal('https://default.com/ssl/config/path/req/path');
    });
    
    it('query string in request is preserved in redirect URL', function () {
      var response = sslForbiddenOrRedirect({
        forceAdminSSL: {redirect: true},
        configUrl: 'http://default.com/config/path/',
        configUrlSSL: 'https://default.com/ssl/config/path/',
        reqUrl: '/req/path'
      });
      response.redirectUrl({a: 'b'}).should.equal('https://default.com/ssl/config/path/req/path?a=b');
    });
  });
});