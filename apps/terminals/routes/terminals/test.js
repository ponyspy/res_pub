var m3u8 = require('m3u8');

var Model = require(__glob_root + '/models/main.js');

var Ribbon = Model.Ribbon;

module.exports = function(Model) {
	var module = {};

	module.test1 = function(req, res) {
		res.send('test1 ok!');
	};

	module.ribbons = function(req, res) {
		Ribbon.findOne().sort('-date').skip(+req.params.num).populate('media.object').exec(function(err, ribbon) {
			if (err || !ribbon || !ribbon.media || ribbon.media.length == 0) return res.json({'msg': 'none'});

			var result = ribbon.media.map(function(item) {
				return {
					'type': item.object.type,
					'counter': item.object.meta.counter,
					'url': req.protocol + '://' + req.hostname + ':8002' + item.object.path.main
				}
			});

			res.json(result);
		});
	}

	module.m3u = function(req, res) {
		var m3u = m3u8.M3U.create();

		Ribbon.findOne().sort('-date').skip(+req.params.num).populate('media.object').exec(function(err, ribbon) {
			if (err || !ribbon || !ribbon.media || ribbon.media.length == 0) return res.send('none');

			ribbon.media.forEach(function(item, i) {
				m3u.addPlaylistItem({
					title: 'item_' + i,
					duration: 8,
					uri: req.protocol + '://' + req.hostname + ':8002' + item.object.path.main
				});
			});

			res.send(m3u.toString());
		});
	};

	return module;
};