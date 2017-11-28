module.exports = function(Model) {
	var module = {};

	var Award = Model.Award;


	module.index = function(req, res, next) {
		var id = req.body.id;

		Award.findByIdAndRemove(id).exec(function(err) {
			if (err) return next(err);

			res.send('ok');
		});

	};


	return module;
};