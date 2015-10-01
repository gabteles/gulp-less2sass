var gulp = require('gulp');
var sass = require('gulp-sass');
var less2sass = require('../../');

gulp.task('less2sass', function() {
	gulp.src('in.less')
		.pipe(less2sass())
		.pipe(gulp.dest('./output'))
});

gulp.task('less2css-without-less', function() {
	gulp.src('in.less')
		.pipe(less2sass())
		.pipe(sass())
		.pipe(gulp.dest('./output'))
});