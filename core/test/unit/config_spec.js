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
      config.paths.should.have.property('themePath', contentPath + 'templates');
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
        config.set({url: 'http:default.com/about'});
        config.urlJoin('about', 'about/us').should.equal('about/us');
        config.urlJoin('about/', 'about/us').should.equal('about/us');
      });
    });
    
    describe('urlFor', function () {
      before(function () {
        resetConfig();
      });
      
      
    });
    
  });
  
  describe('File', function () {
    
  });
  
  describe('Check for deprecation messages:', function () {
    
  });
})