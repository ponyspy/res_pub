var pug = require('pug');

module.exports = function(Model) {
	var module = {};

	var Place = Model.Place;


	module.index = function(req, res, next) {
		var query = req.query;

		var Query = (query.type && query.parent)
			? Place.find({ 'type': query.type, 'meta.parent': query.parent })
			: Place.find({ 'type': 'city' });

		Query.sort('-date').limit(10).exec(function(err, places) {
			if (err) return next(err);

			Query.count().exec(function(err, count) {
				if (err) return next(err);

				res.render('admin/places', {places: places, type: query.type, parent: query.parent, count: Math.ceil(count / 10)});
			});
		});
	};


	module.get_list = function(req, res, next) {
		var post = req.body;
		var query = req.query;

		var QueryPlace = (query.type && query.parent)
			? Place.find({ 'type': query.type, 'meta.parent': query.parent })
			: Place.find({ 'type': 'city' });

		var Query = (post.context.text && post.context.text !== '')
			? Place.find({ $text : { $search : post.context.text } } )
			: QueryPlace;

		if (post.context.status && post.context.status != 'all') {
			Query.where('status').equals(post.context.status);
		}

		Query.count(function(err, count) {
			if (err) return next(err);

			Query.find().sort('-date').skip(+post.context.skip).limit(+post.context.limit).exec(function(err, places) {
				if (err) return next(err);

				if (places.length > 0) {
					var opts = {
						type: query.type,
						places: places,
						count: Math.ceil(count / 10),
						skip: +post.context.skip,
						compileDebug: false, debug: false, cache: true, pretty: false
					};

					res.send(pug.renderFile(__app_root + '/views/admin/places/_places.pug', opts));
				} else {
					res.send('end');
				}
			});
		});
	};


	return module;
};