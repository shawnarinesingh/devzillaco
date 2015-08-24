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
gulp.task('default', ['serve']);

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

// Bundle 
gulp.task('bundle', function () {
  src.scripts = clientPath + '**/*.js';
  return gulp.src(src.scripts)
    .pipe($.plumber())
    .pipe($.react())
    .pipe(gulp.dest(DEST))
    .pipe($.size({title: 'server scripts'}));
});

gulp.task('build', ['clean'], function (cb) {
  runSequence(['styles'], ['bundle'], cb);
});

gulp.task('serve', ['build'], function () {
  $.nodemon({
    script: 'index.js',
    ext: 'js hbs',
    env: { 'NODE_ENV': 'development' }
  });
  
  runSequence('build', function () {
    gulp.watch(src.styles, ['styles']);
    gulp.watch(src.scripts, ['bundle']);
  })
});