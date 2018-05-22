var rimraf = require('rimraf');

module.exports = function(Model) {
	var module = {};

	var Ribbon = Model.Ribbon;
	var Place = Model.Place;


	module.index = function(req, res, next) {
		var id = req.body.id;

		Ribbon.findByIdAndRemove(id).exec(function(err) {
			if (err) return next(err);

			Place.update({ 'ribbon': id }, { $unset: { ribbon: 1 } }, { multi: true }).exec(function(err) {
				if (err) return next(err);

				rimraf(__glob_root + '/public/cdn/' + __app_name + '/ribbons/' + id, { glob: false }, function(err) {
					if (err) return next(err);

					res.send('ok');
				});
			});
		});

	};


	return module;
};