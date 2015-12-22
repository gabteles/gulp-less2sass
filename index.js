/**
 * gulp-less2sass
 *
 * Translate LESS to SASS using Gulp
 *
 * @author Gabriel Teles <gab.teles@hotmail.com>
 * @since 0.0.1
 */

'use strict';

// --------------------
//    I M P O R T S
// --------------------
var es = require('event-stream'),
	gutil = require('gulp-util'),
	through = require('through2');

// --------------------
//      C O N S T
// --------------------
var PLUGIN_NAME = 'gulp-less2sass';
var REPLACES = [
	// Variables, excluding css at-rules
	[/@((?!media|include|charset|document|font-face|import|keyframes|page|supports)[a-zA-Z_]+)/gi, "$$$1"],
	
	// mixins
	[/[\.#]([\w\-]*)(\s*)\((.*)\)(\s*)\{/gi, "@mixin $1$2($3)$4{"],

	// mixins w/ simicolons on parameters 
	[/;(?=((?!\().)*?\))/gi, ","],

	// @include 
	[/[^:\{]*(@include\W(\W*))([.#][^(;\{]*;)/gi, "@extend $2$3"],

	// parameterized @include
	[/[^:\{]*(@include\W+)[.#]([^(;]*\()/gi, "$1$2"],

	// short-hand @include
	[/((?:\n|{)\W*)(?:[^\{\n]*@extend\W+)?([.#][^(;\{]*;)/gi, "$1@extend $2"],
		
	// short-hand parameterized @include
	[/([^:\{]*)[.#]([^(;\{]*\()/gi, "$1@include $2"],

	// Literal strings
	[/~"(.*)"/gi, "#{\"$1\"}"],

	// spin function to adjust-hue
	[/spin\(/gi, "adjust-hue("],
];

// --------------------
//     P L U G I N
// --------------------

// Actual parsing
var less2sassParse = function(content) {
	// Replaces regular expressions
	for (var x = 0; x < REPLACES.length; x++) {
		content = content.replace(REPLACES[x][0], REPLACES[x][1]);
	}

	/**
	 * @TODO: Parse `when` statement on mixins definitions
	 */
 	/**
	 * @TODO: Handle multiple mixins with same name, with different `when` statements
	 */

	return content;
}

// Streaming data
var less2sassStreamer = function() {
	return through(function(chunk, enc, callback) {
		// Initializes the buffer
		if (this.buffer == undefined)
			this.buffer = "";

		// Received string
		var received = chunk.toString();

		// Wait line-break
		var lines = received.split("\n");

		// No new line
		if (lines.length == 1) {
			this.buffer += lines.shift();

		// One new line
		} else if (lines.length >= 2) {
			// Adds the final of the buffer line
			this.buffer += lines.shift();

			// Fowards the buffered line
			this.push(less2sassParse(this.buffer));

			// Foreach new line
		 	while (lines.length > 1) {
				// Forwards the line
				this.push(less2sassParse(lines.shift));
			};

			// Buffer the new line
			this.buffer = lines.shift();
		};

		// Done 
		callback();
	});
}

// Handles the calls to the plugin
module.exports = function (opts) {
	return through.obj(function(file, enc, callback) {
		// Checks file type and parse its content
		if (file.isStream()) {
			// create streamer
			var streamer = less2sassStreamer();
			// catch errors from the streamer and emit a gulp plugin error
      		streamer.on('error', this.emit.bind(this, 'error'));
      		// transform
      		file.contents = file.contents.pipe(streamer);
		} else if (file.isBuffer()) {
			// Parses actual buffer content and re-create a buffer from parsed
			file.contents = new Buffer(less2sassParse(file.contents.toString()));
		} else if (file.isNull()) {
			// Do nothing
		} else {
			this.emit('error', new PluginError(PLUGIN_NAME, 'File type not supported'));
		}
		
		// Changes the file extension if we can
		if (file.path != undefined)
			file.path = gutil.replaceExtension(file.path,  (opts && opts.extension) ? opts.extension : '.scss');

		// Pass file foward
		this.push(file);

		// Done
		callback();
	});
};
