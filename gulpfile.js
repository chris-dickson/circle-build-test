const gulp = require('gulp');
const gulpIf = require('gulp-if');
const fail = require('gulp-fail');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
  let failed = false;
  return gulp.src('src/**/*.js', {follow: true})
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.result((result) => {
      if (result.errorCount > 0 || result.warningCount > 0) {
        throw {
          name: 'ESLintError',
          message: 'Lint errors/warnings:'
        };
      }
    }));
});
