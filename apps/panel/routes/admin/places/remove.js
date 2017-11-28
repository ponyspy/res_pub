module.exports = function(Model) {
	var module = {};

	var Place = Model.Place;


	module.index = function(req, res, next) {
		var id = req.body.id;

		Place.findByIdAndRemove(id).exec(function(err) {
			if (err) return next(err);

			res.send('ok');
		});

	};


	return module;
};