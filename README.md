gulp-less2sass
==============

Translate LESS to SASS using Gulp

## Installation
```bash
npm install gulp-less2sass --save
```

## Usage
```javascript
var gulp = require('gulp');
var less2sass = require('gulp-less2sass');

gulp.task('less2sass', function() {
	gulp.src('in.less')
		.pipe(less2sass())
		.pipe(gulp.dest('./output'));

	// Check ./output/in.scss
});
```

## Tests

```bash
$  npm test
```

Also check test/project to see a simple application of gulp-less2sass, using gulp task to convert a less file to scss.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. 

## Release History

* 0.0.1 Beta version
