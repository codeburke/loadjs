'use strict';

var del = require('del'),
    gulp = require('gulp'),
    injectString = require('gulp-inject-string'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');



// ============================================================================
// PUBLIC TASKS
// ============================================================================

gulp.task('examples:build', gulp.series(
  clean('./examples/assets/loadjs'),
  buildDistJs('./examples/assets/loadjs')
));


gulp.task('test:build', gulp.series(
  clean('./test/assets/loadjs'),
  buildDistJs('./test/assets/loadjs')
));


gulp.task('dist:build', gulp.series(
  clean('./packages/dist'),
  buildDistJs('./packages/dist')
));


gulp.task('npm:build', gulp.series(
  clean('./packages/npm/lib'),
  buildNpmJs
));


gulp.task('build-packages', gulp.parallel(
  'dist:build',
  'npm:build'
));


gulp.task('build-all', gulp.parallel(
  'examples:build',
  'test:build',
  'build-packages'
));



// ============================================================================
// PRIVATE TASKS
// ============================================================================

function makeTask(displayName, fn) {
  if (displayName) fn.displayName = displayName;
  return fn;
}


function clean(dirname) {
  return makeTask('clean: ' + dirname, function(done) {
    return del(dirname, done);
  });
}


function buildDistJs(dirname) {
  return makeTask('build-js: ' + dirname, function() {
    // replace module export with window export and wrap in closure
    return gulp.src('src/loadjs.js')
      .pipe(injectString.replace('module.exports', 'window.loadjs'))
      .pipe(injectString.wrap('(function() {\n', '})();\n'))
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(rename('loadjs.js'))
      .pipe(gulp.dest(dirname))
      .pipe(uglify())
      .pipe(rename('loadjs.min.js'))
      .pipe(gulp.dest(dirname));
  });
}


function buildNpmJs() {
  return gulp.src('src/loadjs.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./packages/npm'));
}
