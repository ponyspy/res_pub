var jade = require('jade');

module.exports = function(Model) {
	var Place = Model.Place;
	var module = {};

	module.index = function(req, res) {
		Place.find({ 'type': 'city' }).exec(function(err, places) {
			res.render('terminals', { places: places });
		});
	};

	module.get_places = function(req, res) {
		var post = req.body;

		var get_locale = function(option, lang) {
			return ((option.filter(function(locale) {
				return locale.lg == lang;
			})[0] || {}).value || '');
		};

		Place.find({ 'meta.parent': post.parent }).exec(function(err, places) {
			var opts = {
				places: places,
				get_locale: get_locale,
				compileDebug: false, debug: false, cache: false, pretty: false
			};

			res.send(jade.renderFile(__app_root + '/apps/terminals/views/terminal/_places.jade', opts));
		});
	};

	return module;
};