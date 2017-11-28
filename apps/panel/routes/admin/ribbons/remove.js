var rimraf = require('rimraf');

module.exports = function(Model) {
	var module = {};

	var Ribbon = Model.Ribbon;


	module.index = function(req, res, next) {
		var id = req.body.id;

		Ribbon.findByIdAndRemove(id).exec(function(err) {
			if (err) return next(err);

			res.send('ok');
		});

	};


	return module;
};