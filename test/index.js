'use strict';

// --------------------
//   R E Q U I R E S
// --------------------
var assert = require('assert');
var es = require('event-stream');
var File = require('vinyl');
var less2sass = require('../');

// --------------------
//        A U X
// --------------------
function executeTest(fakeFileContent, dataCallback) {
	// Create less2sass plugin stream
	var stream = less2sass();

	// Create fake file
	var fakeFile = new File({
		contents: fakeFileContent
	});
	
	// Wait finish
	stream.on('data', dataCallback);

	// Write data to it
	stream.write(fakeFile);
}

function expectTransformation(input, output, done) {
	executeTest(new Buffer(input), function(file) {
		// Verify buffer content
		file.pipe(es.wait(function(err, data) {
			assert.equal(data.toString(), output);
			done();
		}))
	});
}

// --------------------
//      T E S T S
// --------------------
describe('gulp-less2sass', function() {
	// Streaming mode
	describe('in streaming mode', function() {
		it('should keep working', function(done) {
			executeTest(es.readArray(["@color: re", "d;\n@color2: blue;"]), function(file) {
				// Make sure it outputs a steam
				assert(file.isStream());

				// Verify buffer content
				file.pipe(es.wait(function(err, data) {
					assert.equal(data.toString(), '$color: red;');
					done();
				}));
			});
		});
	});

	// Buffer mode
	describe('in buffer mode', function() {
		it('should keep working', function(done) {
			executeTest(new Buffer('@color: red;'), function(file) {
				// Make sure it outputs a buffer
				assert(file.isBuffer());

				// Verify buffer content
				file.pipe(es.wait(function(err, data) {
					assert.equal(data.toString(), '$color: red;');
					done();
				}))
			});
		});
	});

	// Variables converting
	it('should convert variables', function(done) {
		expectTransformation(
			'@color: red;', 
			'$color: red;', 
			done
		);
	});

	// at-rules not converting
	it('should not convert css at-rules', function(done) {
		expectTransformation(
			'@color: red; @media (max-width: 100px) { .foo { color: @color } }', 
			'$color: red; @media (max-width: 100px) { .foo { color: $color } }', 
			done
		);
	});

	// @include
	it('should convert @include to @extend', function(done) {
		expectTransformation(
			'.bar {@include .foo;}', 
			'.bar {@extend .foo;}', 
			done
		);
	});
	
	// parameterized @include
	it('should convert mixins (@include w/ parameters) to @include, removing dot or sharp', function(done) {
		expectTransformation(
			'@color: red; .bar {@include .foo(@color);}', 
			'$color: red; .bar {@include foo($color);}', 
			done
		);
	});

	// Short-hand @include
	it('should convert short-hand @include to @extend, if not parameterized', function(done) {
		expectTransformation(
			'.bar {.foo;}', 
			'.bar {@extend .foo;}', 
			done
		);
	});

	// Short-hand parameterized @include
	it('should convert short-hand @include, removing dot or sharp', function(done) {
		expectTransformation(
			'.bar {.foo(red);}', 
			'.bar {@include foo(red);}', 
			done
		);
	});

	// Hexadecimal vs ID selectors
	it('should not treat hexadecimal colors as short-hand ID selectors', function(done) {
		expectTransformation(
			'@base: #chucknorris;', 
			'$base: #chucknorris;', 
			done
		);
	});

	// Mixins
	it('should convert mixins functions', function(done) {
		expectTransformation(
			'.foo(@color) { color: @color; };', 
			'@mixin foo($color) { color: $color; };', 
			done
		);
	});

	// Literal strings
	it('should convert literal strings', function(done) {
		expectTransformation(
			'.foo { transition-duration: ~"50ms"; }',
			'.foo { transition-duration: #{"50ms"}; }',
			done
		);
	});

	// spin function to adjust-hue
	it('should convert spin function to adjust-hue function', function(done) {
		expectTransformation(
			'@color: spin(red, 200deg);', 
			'$color: adjust-hue(red, 200deg);', 
			done
		);
	});

	// line-breaks
	it('should not remove line-breaks', function(done) {
		expectTransformation(
			".foo(@alpha: 0.5) { \n .bar(@alpha); \n }", 
			"@mixin foo($alpha: 0.5) { \n @include bar($alpha); \n }", 
			done
		);
	});

	// Semicolon parameters on mixins
	it('should handle mixins with parameters divided by semicolons', function(done) {
		expectTransformation(
			".button-outline-variant(@color; @activeTextColor: #fff) {\n color: @color; \n}",
			"@mixin button-outline-variant($color, $activeTextColor: #fff) {\n color: $color; \n}",
			done
		);
	});
});
