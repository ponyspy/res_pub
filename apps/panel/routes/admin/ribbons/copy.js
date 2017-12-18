var shortid = require('shortid');
var rimraf = require('rimraf');
var moment = require('moment');

module.exports = function(Model) {
	var module = {};

	var Ribbon = Model.Ribbon;

	module.index = function(req, res, next) {
		var id = req.body.id;

		Ribbon.findById(id).exec(function(err, ribbon) {
			var c_ribbon = new Ribbon();

			c_ribbon._short_id = shortid.generate();
			c_ribbon.status = 'hidden';
			c_ribbon.media = ribbon.media.toObject();
			c_ribbon.date = moment();

			var locales = ribbon.hasPropertyLocale('title', 'en') ? ['ru', 'en'] : ['ru'];

			locales.forEach(function(locale) {
				c_ribbon.setPropertyLocalised('title', '(!!!) ' + ribbon.getPropertyLocalised('title', locale), locale);
			});


			c_ribbon.save(function(err) {
				res.send('ok');
			});
		});

	};


	return module;
};