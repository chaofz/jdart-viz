var gulp = require('gulp');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var webpack = require('gulp-webpack');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function() {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('asset/css'));
});

gulp.task('sass:watch', function() {
  gulp.watch('sass/*.scss', ['sass']);
});

gulp.task('webpack:watch', function() {
  return gulp.src('src/app.js')
    .pipe(webpack({
      output: {
        filename: 'bundle.js',
      },
      watch: true
    }))
    // .pipe(uglify())
    .pipe(gulp.dest('asset/js'));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
    port: 3010,
    notify: false
  });
});

gulp.task('browser:watch', ['browserSync'], function() {
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('asset/css/**/*.css', browserSync.reload);
  gulp.watch('asset/js/**/*.js', browserSync.reload);

  gulp.watch('gsoc/*', browserSync.reload);
});

gulp.task('dev', ['browser:watch', 'webpack:watch', 'sass:watch']);

// gulp.task('dev', ['browserSync', 'sass', 'webpack:watch'], function() {
//   gulp.watch('sass/*.scss', ['sass']);

//   gulp.watch('*.html', browserSync.reload);
//   gulp.watch('asset/css/*.css', browserSync.reload);
//   gulp.watch('asset/js/*.js', browserSync.reload);
// });
