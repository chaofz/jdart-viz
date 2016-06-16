var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function() {
  gulp.src(['./sass/**/*.scss', '!./sass/**/_*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(gulp.dest('./css'));
});

gulp.task('js', function() {
  gulp.src('./src/demo0.js')
    .pipe(minify())
    .pipe(gulp.dest('./tmp'));
});

gulp.task('sass:watch', function() {
  gulp.watch('./sass/**/*.scss', ['sass']);
});
