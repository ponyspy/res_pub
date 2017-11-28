var jade = require('jade');

module.exports = function(Model) {
	var module = {};

	var Place = Model.Place;


	module.index = function(req, res, next) {
		Place.find().sort('-date').limit(10).exec(function(err, Places) {
			if (err) return next(err);

			Place.count().exec(function(err, count) {
				if (err) return next(err);

				res.render('admin/Places', {Places: Places, count: Math.ceil(count / 10)});
			});
		});
	};


	module.get_list = function(req, res, next) {
		var post = req.body;

		var Query = (post.context.text && post.context.text !== '')
			? Place.find({ $text : { $search : post.context.text } } )
			: Place.find();

		if (post.context.status && post.context.status != 'all') {
			Query.where('status').equals(post.context.status);
		}

		Query.count(function(err, count) {
			if (err) return next(err);

			Query.find().sort('-date').skip(+post.context.skip).limit(+post.context.limit).exec(function(err, Places) {
				if (err) return next(err);

				if (places.length > 0) {
					var opts = {
						places: places,
						load_list: true,
						count: Math.ceil(count / 10),
						skip: +post.context.skip,
						compileDebug: false, debug: false, cache: true, pretty: false
					};

					res.send(jade.renderFile(__app_root + '/views/admin/places/_places.jade', opts));
				} else {
					res.send('end');
				}
			});
		});
	};


	return module;
};