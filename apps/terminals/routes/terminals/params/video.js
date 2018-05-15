var fs = require('fs');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var async = require('async');
var ffmpeg = require('fluent-ffmpeg');


var progressHandler = function(progress) {
	console.log('Processing: ' + progress.percent + '% done');
};


module.exports.videoCompile = function(ribbon, callback) {
	var public_path = __glob_root + '/public';
	var tmp_path = __glob_root + '/tmp';
	var build_path = '/cdn/ribbons/' + ribbon._id;

	async.series({

		// Transcode video
		video_transcode: function(call_transcode) {
			async.eachOfSeries(ribbon.media, function(item, i, call_item) {
				var command = ffmpeg();

				var counter = item.meta.counter
					? item.meta.counter
					: item.object.meta.counter;

				command = item.object.type == 'image'
					? command.input(public_path + item.object.path.main).loop(counter).output(tmp_path + '/' + i + '.mp4')
					: command.input(public_path + item.object.path.main).output(tmp_path + '/' + i + '.mp4');

				command
					.outputOptions('-threads 2')
					.outputOptions('-pix_fmt yuv420p')  // ffmpeg -pix_fmts
					// .outputOptions('-preset fast')
					// .outputOptions('-crf 20')
					.videoCodec('libx264')
					.noAudio()
					.outputFormat('mp4')
					.outputFPS(25)
					.size('1920x1080').autopad('black')
					.on('progress', progressHandler)
					.on('error', function(err) {
						command.kill();
						console.log(err.message);
						callback(err);
					})
					.on('end', function() {

						console.log('Transcode item complete!');

						call_item(null, 'ok');
					})
					.run();
				}, call_transcode);
		},

		// Merge video
		video_merge: function(call_merge) {
			var command = ffmpeg();

			mkdirp.sync(public_path + build_path);

			ribbon.media.forEach(function(item, i) {
				if (item.object.type == 'video') {

					var counter = item.meta.counter
						? item.meta.counter
						: item.object.meta.counter;

					Array.from({ length: counter }).forEach(function() {
						command.input(tmp_path + '/' + i + '.mp4');
					});
				} else {
					command.input(tmp_path + '/' + i + '.mp4');
				}
			});

			command
				.outputOptions('-threads 2')
				.on('progress', progressHandler)
				.on('error', function(err) {
					command.kill();

					console.log(err.message);

					callback(err);
				})
				.on('end', function() {
					console.log('Merge complete!');
					call_merge(null, 'ok');
				})
				.mergeToFile(public_path + build_path + '/new.mp4', tmp_path);
		}

	}, function(err, results) {
		fs.renameSync(public_path + build_path + '/new.mp4', public_path + build_path + '/build.mp4');
		rimraf.sync(tmp_path + '/*');
		rimraf.sync(public_path + build_path + '/new.mp4');

		console.log('Build complete!');

		callback(null, build_path + '/build.mp4');
	});
};