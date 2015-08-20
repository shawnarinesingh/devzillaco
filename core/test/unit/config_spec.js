/*globals describe, it, before, beforeEach, afterEach, after */
/*jshint expr:true*/
var should         = require('should'),
    sinon          = require('sinon'),
    Promise        = require('bluebird'),
    path           = require('path'),
    fs             = require('fs'),
    _              = require('lodash'),
    rewire         = require('rewire'),

    testUtils      = require('../utils'),

    // Thing we are testing
    defaultConfig  = require('../../../config.example')[process.env.NODE_ENV],
    config         = require('../../server/config'),
    origConfig     = _.cloneDeep(config),
    // storing current environment
    currentEnv     = process.env.NODE_ENV;

// To stop jshint complaining
should.equal(true, true);

function resetConfig() {
  config.set(_.merge({}, origConfig, defaultConfig));
}

describe('Config', function () {
  after(function () {
    resetConfig();
  });
  
  describe('Index', function () {
    afterEach(function () {
      // Make a copy of the default config file
      // so we can restore it after every test.
      // Using _.merge to recursively apply every property.
      resetConfig();
    });
    
    it('should have exactly the right keys', function () {
      var pathConfig = config.paths;
      
      // This will fail if there are nay extra keys
      pathConfig.should.have.keys(
        'appRoot',
        'subdir',
        'config',
        'configExample',
        'corePath',
        'storage',
        'contentPath',
        'clientPath',
        'buildPath',
        'serverPath',
        'templatesPath',
        'appPath',
        'imagesPath',
        'imagesRelPath',
        'adminViews',
        'helperTemplates',
        'exportPath',
        'lang',
        'availableTemplates',
        'availableApps',
        'clientAssets'
      );
    });
    
    it('should have the correct values for each key', function () {
      var pathConfig = config.paths,
          appRoot = path.resolve(__dirname, '../../../');
      
      pathConfig.should.have.property('appRoot', appRoot);
      pathConfig.should.have.property('subdir', '');
    });
    
    it('should not return a slash for subdir', function () {
      config.set({url: 'http://default.com'});
      config.paths.should.have.property('subdir', '');
      
      config.set({url: 'http://default.com'});
      config.paths.should.have.property('subdir', '');
    });
    
    it('should handle subdirectories properly', function () {
      config.set({url: 'http://default.com/about'});
      config.paths.should.have.property('subdir', '/about');
      
      config.set({url: 'http://default.com/about/'});
      config.paths.should.have.property('subdir', '/about');
      
      config.set({url: 'http://default.com/about/us'});
      config.paths.should.have.property('subdir', '/about/us');
      
      config.set({url: 'http://default.com/about/us/'});
      config.paths.should.have.property('subdir', '/about/us');
    });
    
    it('should allow specific properties to be user defined', function () {
      var contentPath = path.join(config.paths.appRoot, 'otherContent', '/'),
          configFile = 'configFile.js';
          
      config.set({
        config: configFile,
        paths: {
          contentPath: contentPath
        }
      });
      
      config.should.have.property('config', configFile);
      config.paths.should.have.property('contentPath', contentPath);
      config.paths.should.have.property('templatesPath', contentPath + 'templates');
      config.paths.should.have.property('appPath', contentPath + 'apps');
      config.paths.should.have.property('imagesPath', contentPath + 'images');
    });
  });
  
  describe('Storage', function () {
    afterEach(function () {
      resetConfig();
    });
    
    it('should default to local-file-store', function () {
      var storagePath = path.join(config.paths.corePath, '/server/storage/', 'local-file-store');
      
      config.paths.should.have.property('storage', storagePath);
      config.storage.should.have.property('active', 'local-file-store');
    });
    
    it('should allow setting a custom active storage', function () {
      var storagePath = path.join(config.paths.contentPath, 'storage', 's3');
      
      config.set({
        storage: {
          active: 's3',
          s3: {}
        }
      });
      
      config.paths.should.have.property('storage', storagePath);
      config.storage.should.have.property('active', 's3');
      config.storage.should.have.property('s3', {});
    });
  });
  
  describe('Url', function () {
    describe('urlJoin', function () {
      before(function () {
        resetConfig();
      });
      
      afterEach(function () {
        resetConfig();
      });
      
      it('should deduplicate slashes', function () {
        config.set({url: 'http://default.com/'});
        config.urlJoin('/', '/about/', '/us/').should.equal('/about/us/');
        config.urlJoin('/', '//about/', '/us/').should.equal('/about/us/');
        config.urlJoin('/', '/', '/').should.equal('/');
      });
      
      it('should not deduplicate slashes in protocol', function () {
        config.set({url: 'http://default.com/'});
        config.urlJoin('http://url.com', '/rss').should.equal('http://url.com/rss');
        config.urlJoin('http://url.com/', '/rss').should.equal('http://url.com/rss');
      });
      
      it('should permit schemeless protocol', function () {
        config.set({url: 'http://default.com/'});
        config.urlJoin('/', '/').should.equal('/');
        config.urlJoin('//url.com', '/rss').should.equal('//url.com/rss');
        config.urlJoin('//url.com/', '/rss').should.equal('//url.com/rss');
        config.urlJoin('//url.com//', 'rss').should.equal('//url.com/rss');
        config.urlJoin('', '//url.com', 'rss').should.equal('//url.com/rss');
      });
      
      it('should deduplicate subdir', function () {
        config.set({url: 'http://default.com/about'});
        config.urlJoin('about', 'about/us').should.equal('about/us');
        config.urlJoin('about/', 'about/us').should.equal('about/us');
      });
    });
    
    describe('urlFor', function () {
      before(function () {
        resetConfig();
      });
      
      afterEach(function () {
        resetConfig();
      });
      
      it('should return the home url with no options', function () {
        config.urlFor().should.equal('/');
        config.set({url: 'http://default.com/about'});
        config.urlFor().should.equal('/about/');
        config.set({url: 'http://default.com/about/'});
        config.urlFor().should.equal('/about/');
      });
      
      it('should return home url when asked for', function () {
        var testContext = 'home';
        
        config.set({url: 'http://default.com'});
        config.urlFor(testContext).should.equal('/');
        config.urlFor(testContext, true).should.equal('http://default.com/');
        
        config.set({url: 'http://default.com/'});
        config.urlFor(testContext).should.equal('/');
        config.urlFor(testContext, true).should.equal('http://default.com/');
        
        config.set({url: 'http://default.com/about'});
        config.urlFor(testContext).should.equal('/about/');
        config.urlFor(testContext, true).should.equal('http://default.com/about/');

        config.set({url: 'http://default.com/about/'});
        config.urlFor(testContext).should.equal('/about/');
        config.urlFor(testContext, true).should.equal('http://default.com/about/');
      });
      
      it('should return url for a random path when asked for', function () {
        var testContext = {relativeUrl: '/about/'};
        
        config.set({url: 'http://default.com'});
        config.urlFor(testContext).should.equal('/about/');
        config.urlFor(testContext, true).should.equal('http://default.com/about/');
        
        config.set({url: 'http://default.com/contact'});
        config.urlFor(testContext).should.equal('/contact/about/');
        config.urlFor(testContext, true).should.equal('http://default.com/contact/about/');
      });
      
      it('should deduplicate subdirectories in paths', function () {
        var testContext = {relativeUrl: '/about/us/'};

        config.set({url: 'http://default.com'});
        config.urlFor(testContext).should.equal('/about/us/');
        config.urlFor(testContext, true).should.equal('http://default.com/about/us/');

        config.set({url: 'http://default.com/about'});
        config.urlFor(testContext).should.equal('/about/us/');
        config.urlFor(testContext, true).should.equal('http://default.com/about/us/');

        config.set({url: 'http://default.com/about/'});
        config.urlFor(testContext).should.equal('/about/us/');
        config.urlFor(testContext, true).should.equal('http://default.com/about/us/');
      });
      
      it('should return url for an image when asked for', function () {
        var testContext = 'image',
            testData;
        
        config.set({url: 'http://default.com'});
        
        testData = {image: '/content/images/my-image.jpg'};
        config.urlFor(testContext, testData).should.equal('/content/images/my-image.jpg');
        config.urlFor(testContext, testData, true).should.equal('http://default.com/content/images/my-image.jpg');
        
        testData = {image: 'http://placekitten.com/500/200'};
        config.urlFor(testContext, testData).should.equal('http://placekitten.com/500/200');
        config.urlFor(testContext, testData, true).should.equal('http://placekitten.com/500/200');
      });
      
      it('should return other known paths when requested', function () {
        
      });
    });
    
  });
  
  describe('File', function () {
    var sandbox,
        originalConfig,
        readFileStub,
        overrideConfig = function (newConfig) {
          readFileStub.returns(
            _.extend({}, defaultConfig, newConfig)
          );
        },
        expectedError = new Error('expected bootstrap() to throw error but none thrown');
    
    before(function () {
      originalConfig = _.cloneDeep(rewire('../../server/config')._config);
    });
    
    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      readFileStub = sandbox.stub(config, 'readFile');
    });
    
    afterEach(function () {
      config = rewire('../../server/config');
      resetConfig();
      sandbox.restore();
    });
    
    it('loads the config file if one exists', function (done) {
      // We actually want the real method here.
      readFileStub.restore();
      
      // the test infrastructure is setup so that there is always config present,
      // but we want to overwrite the test to actually load config.example.js, so that any local changes
      // don't break the tests
      config.set({
        paths: {
          appRoot: path.join(originalConfig.paths.appRoot, 'config.example.js')
        }
      });
      
      config.load().then(function (config) {
        config.url.should.equal(defaultConfig.url);
        config.database.client.should.equal(defaultConfig.database.client);
        config.database.connection.should.eql(defaultConfig.database.connection);
        config.server.host.should.equal(defaultConfig.server.host);
        config.server.port.should.equal(defaultConfig.server.port);
        
        done();
      }).catch(done);
    });
    
    it('uses the passed in config file location', function (done) {
      // We actually want the real method here.
      readFileStub.restore();

      config.load(path.join(originalConfig.paths.appRoot, 'config.example.js')).then(function (config) {
        config.url.should.equal(defaultConfig.url);
        config.database.client.should.equal(defaultConfig.database.client);
        config.database.connection.should.eql(defaultConfig.database.connection);
        config.server.host.should.equal(defaultConfig.server.host);
        config.server.port.should.equal(defaultConfig.server.port);

        done();
      }).catch(done);
    });
    
    it('creates the config file if one does not exist', function (done) {
      // trick bootstrap into thinking that the config file doesn't exist yet
      var existsStub = sandbox.stub(fs, 'stat', function (file, cb) { return cb(true); }),
          // ensure that the file creation is a stub, the tests shouldn't really create a file
          writeFileStub = sandbox.stub(config, 'writeFile').returns(Promise.resolve()),
          validateStub = sandbox.stub(config, 'validate').returns(Promise.resolve());

      config.load().then(function () {
        existsStub.calledOnce.should.be.true;
        writeFileStub.calledOnce.should.be.true;
        validateStub.calledOnce.should.be.true;
        done();
      }).catch(done);
    });
    
    it('accepts urls with a valid scheme', function (done) {
      // replace the config file with invalid data
      overrideConfig({url: 'http://testurl.com'});

      config.load().then(function (localConfig) {
        localConfig.url.should.equal('http://testurl.com');

        // Next test
        overrideConfig({url: 'https://testurl.com'});
        return config.load();
      }).then(function (localConfig) {
        localConfig.url.should.equal('https://testurl.com');

        // Next test
        overrideConfig({url: 'http://testurl.com/blog/'});
        return config.load();
      }).then(function (localConfig) {
        localConfig.url.should.equal('http://testurl.com/blog/');

        // Next test
        overrideConfig({url: 'http://testurl.com/dev/'});
        return config.load();
      }).then(function (localConfig) {
        localConfig.url.should.equal('http://testurl.com/dev/');

        done();
      }).catch(done);
    });
    
    it('rejects a fqdn without a scheme', function (done) {
      overrideConfig({url: 'example.com'});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('rejects a hostname without a scheme', function (done) {
      overrideConfig({url: 'example'});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('rejects a hostname with a scheme', function (done) {
      overrideConfig({url: 'https://example'});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('rejects a url with an unsupported scheme', function (done) {
      overrideConfig({url: 'ftp://example.com'});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('rejects a url with a protocol relative scheme', function (done) {
      overrideConfig({url: '//example.com'});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('does not permit database config to be falsy', function (done) {
      // replace the config file with invalid data
      overrideConfig({database: false});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('does not permit database config to be empty', function (done) {
      // replace the config file with invalid data
      overrideConfig({database: {}});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('requires server to be present', function (done) {
      overrideConfig({server: false});

      config.load().then(function (localConfig) {
        /*jshint unused:false*/
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('allows server to use a socket', function (done) {
      overrideConfig({server: {socket: 'test'}});

      config.load().then(function () {
        var socketConfig = config.getSocket();

        socketConfig.should.be.an.Object;
        socketConfig.path.should.equal('test');
        socketConfig.permissions.should.equal('660');

        done();
      }).catch(done);
    });
    
    it('allows server to use a socket and user-defined permissions', function (done) {
      overrideConfig({
        server: {
          socket: {
            path: 'test',
            permissions: '666'
          }
        }
      });

      config.load().then(function () {
        var socketConfig = config.getSocket();

        socketConfig.should.be.an.Object;
        socketConfig.path.should.equal('test');
        socketConfig.permissions.should.equal('666');

        done();
      }).catch(done);
    });
    
    it('allows server to have a host and a port', function (done) {
      overrideConfig({server: {host: '127.0.0.1', port: '5000'}});

      config.load().then(function (localConfig) {
        should.exist(localConfig);
        localConfig.server.host.should.equal('127.0.0.1');
        localConfig.server.port.should.equal('5000');

        done();
      }).catch(done);
    });
    
    it('rejects server if there is a host but no port', function (done) {
      overrideConfig({server: {host: '127.0.0.1'}});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('rejects server if there is a port but no host', function (done) {
      overrideConfig({server: {port: '5000'}});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
    
    it('rejects server if configuration is empty', function (done) {
      overrideConfig({server: {}});

      config.load().then(function () {
        done(expectedError);
      }).catch(function (err) {
        should.exist(err);
        err.should.be.an.Error;

        done();
      }).catch(done);
    });
  });
  
  describe('Check for deprecation messages:', function () {
    var logStub,
        // Can't use afterEach here, because mocha uses console.log to output the checkboxes
        // which we've just stubbed, so we need to restore it before the test ends to see ticks.
        resetEnvironment = function () {
          logStub.restore();
          process.env.NODE_ENV = currentEnv;
        };
    
    beforeEach(function () {
      logStub = sinon.stub(console, 'log');
      process.env.NODE_ENV = 'development';
    });
    
    afterEach(function () {
      logStub.restore();
      config = rewire('../../server/config/');
    });
    
    it('doesn\'t display warning when deprecated options not set', function () {
      config.checkDeprecated();
      logStub.calledOnce.should.be.false;

      // Future tests: This is important here!
      resetEnvironment();
    });
    
    it('displays warning when updateCheck exists and is truthy', function () {
      config.set({
        updateCheck: 'foo'
      });
      // Run the test code
      config.checkDeprecated();

      logStub.calledOnce.should.be.true;

      logStub.calledWithMatch('updateCheck').should.be.true;

      // Future tests: This is important here!
      resetEnvironment();
    });
    
    it('displays warning when updateCheck exists and is falsy', function () {
      config.set({
        updateCheck: false
      });
      // Run the test code
      config.checkDeprecated();

      logStub.calledOnce.should.be.true;

      logStub.calledWithMatch('updateCheck').should.be.true;

      // Future tests: This is important here!
      resetEnvironment();
    });
    
    it('displays warning when mail.fromaddress exists and is truthy', function () {
      config.set({
        mail: {
          fromaddress: 'foo'
        }
      });
      // Run the test code
      config.checkDeprecated();

      logStub.calledOnce.should.be.true;

      logStub.calledWithMatch('mail.fromaddress').should.be.true;

      // Future tests: This is important here!
      resetEnvironment();
    });
    
    it('displays warning when mail.fromaddress exists and is falsy', function () {
      config.set({
        mail: {
          fromaddress: false
        }
      });
      // Run the test code
      config.checkDeprecated();

      logStub.calledOnce.should.be.true;

      logStub.calledWithMatch('mail.fromaddress').should.be.true;

      // Future tests: This is important here!
      resetEnvironment();
    });
    
    it('doesn\'t display warning when only part of a deprecated option is set', function () {
      config.set({
        mail: {
          notfromaddress: 'foo'
        }
      });

      config.checkDeprecated();
      logStub.calledOnce.should.be.false;

      // Future tests: This is important here!
      resetEnvironment();
    });
    
    it('can not modify the deprecatedItems on the config object', function () {
      config.set({
        deprecatedItems: ['foo']
      });

      config.deprecatedItems.should.not.equal(['foo']);
      resetEnvironment();
    });
  });
});