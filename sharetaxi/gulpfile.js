var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify')
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var wiredep = require('wiredep').stream;
var useref = require('gulp-useref');
var ngAnnotate = require('gulp-ng-annotate');
var manifest = require('gulp-manifest');
var runSequence = require('run-sequence');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('update', function(){
  sh.exec("npm install");
  sh.exec("bower install");
});

gulp.task('bower', function () {
  gulp.src('./www/index.html')
    .pipe(wiredep({
            exclude: "www/lib/angular/angular.js"
        }))
    .pipe(gulp.dest('./www'));
});

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

/*
  Build tasks
*/
gulp.task('copybuild', function(){
  gulp.src(['www/**/*.html', 'www/**/*.css', 'www/**/*.ttf', 'www/**/*.woff'])
      .pipe(gulp.dest('build/'));

});

gulp.task('copyfonts', function(){
  gulp.src(['www/fonts/*'])
      .pipe(gulp.dest('build/fonts'));

});

gulp.task('copyimg', function(){
  gulp.src(['www/img/*'])
      .pipe(gulp.dest('build/img'));

});


gulp.task('combine', function(){
  var assets = useref.assets();
  return gulp.src('www/index.html')
            .pipe(assets)
            .pipe(assets.restore())
            .pipe(useref())
            .pipe(gulp.dest('build/'));
});


gulp.task('uglify-js', function() {
  return gulp.src('build/combined.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});

gulp.task('manifest', function(){
  gulp.src(['build/**'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['*'],
      filename: 'app.manifest',
      exclude: ['app.manifest', '*.iml', 'lib/*.html']
     }))
    .pipe(gulp.dest('build/'));
});

gulp.task('localmanifest', function(){
  gulp.src(['www/**'])
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['http://*', '*'],
      filename: 'app.manifest',
      exclude: ['app.manifest', '*.iml','lib/**']
     }))
    .pipe(gulp.dest('www/'));
});

gulp.task('runbuild', function () {
    runSequence('copybuild', 'copyfonts', 'copyimg', 'combine', 'manifest');
});
