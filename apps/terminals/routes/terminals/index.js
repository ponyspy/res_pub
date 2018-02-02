module.exports = function(Model) {
	var Place = Model.Place;
	var module = {};

	module.index = function(req, res) {
		Place.find({ 'type': 'city' }).exec(function(err, places) {
			res.render('terminals', { places: places });
		});
	};

	return module;
};