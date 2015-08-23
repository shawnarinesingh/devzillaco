var gulp        = require('gulp'),
    $           = require('gulp-load-plugins')(),
    browserify  = require('browserify'),
    reactify    = require('reactify'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    del         = require('del'),
    config      = require('./core/server/config'),
    runSequence = require('run-sequence'),
    path        = require('path'),
    argv        = require('minimist')(process.argv.slice(2));

var RELEASE = !!argv.release;
var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DEST = config.paths.buildPath;
var publicPath = DEST + '/public/';
var clientPath = config.paths.clientPath;
var serverPath = config.paths.serverPath;
var src = {};
var watch = false;

// The default task
gulp.task('default', ['build']);

// Clean up
gulp.task('clean', del.bind(null, [DEST]));

// Styles 
gulp.task('styles', function () {
  src.styles = clientPath + 'styles/**/*.{css,scss}';
  return gulp.src(src.styles)
    .pipe($.plumber())
    .pipe($.sass({
      sourceMap: !RELEASE,
      sourceMapBasepath: __dirname
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.csscomb())
    .pipe($.minifyCss())
    .pipe(gulp.dest(publicPath + '/css'))
    .pipe($.size({title: 'styles'}));
});

// Bundle Client
gulp.task('bundle:client', function () {
  var b = browserify({
    entries: './core/client/app.js',
    debug: true,
    transform: [reactify]
  });
  
  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.concat('main.js'))
      .on('error', $.util.log)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(publicPath))
    .pipe($.size({title: 'client scripts'}));
});

// Bundle Server
gulp.task('bundle:server', function () {
  var b = browserify({
    entries: './index.js',
    debug: true,
    transform: [reactify]
  });
  
  return b.bundle()
    .pipe(source('server.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
      .pipe($.concat('server.js'))
      .on('error', $.util.log)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe($.size({title: 'server scripts'}));
});

// Build
gulp.task('build', ['clean'], function(cb) {
  runSequence(['styles', 'bundle:client', 'bundle:server'], cb);
});