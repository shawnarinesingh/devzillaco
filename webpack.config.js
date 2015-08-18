var path = require('path'),
    config = require('./core/server/config'),
    // ExtractTextPlugin = require('extract-text-webpack-plugin'),
    webpack = require('webpack'),
    
    buildPath = config.paths.buildPath,
    commonLoaders = [
      { test: /(\.js$|\.jsx$)/, loader: 'jsx-loader?harmony' }
    ];

module.exports = [
  {
    // The configuration for the client
    name: 'browser',
    
    entry: {
      app: path.join(config.paths.clientPath, 'app.js')
    },
    output: {
      // The output directory
      path: buildPath,
      // THe filename of the entry chunk relative path inside the output.path
      filename: '[name].js',
      publicPath: buildPath
    },
    module: {
      preLoaders: [{
        test: /\.js$|.jsx$/,
        exclude: /node_modules/,
        loaders: ['eslint', 'jscs']
      }]
    }
  }, {
    // The configuration for the server-side rendering
    name: 'server-side rendering',
    entry: {
      app: path.join(config.paths.clientPath, 'app.js')
    },
    target: 'node',
    output: {
      // The output directory as absolute path
      path: buildPath,
      // The filename of the entry chunk as relative path inside the output.path
      filename: '[name].server.js',
      publicPath: buildPath,
      libraryTarget: 'commonjs2'
    },
    externals: /^[a-z\-0-9]+$/,
    module: {
      loaders: commonLoaders
    }
  }
];