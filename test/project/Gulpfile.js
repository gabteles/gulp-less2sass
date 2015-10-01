var gulp = require('gulp');
var less2sass = require('../../');

gulp.task('less2sass', function() {
	gulp.src('in.less')
		.pipe(less2sass())
		.pipe(gulp.dest('./output'))
});
