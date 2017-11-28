var rimraf = require('rimraf');

module.exports = function(Model) {
	var module = {};

	var Ad = Model.Ad;


	module.index = function(req, res, next) {
		var id = req.body.id;

		Ad.findByIdAndRemove(id).exec(function(err) {
			if (err) return next(err);

			res.send('ok');
		});

	};


	return module;
};