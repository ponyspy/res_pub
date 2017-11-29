var jade = require('jade');

module.exports = function(Model) {
	var module = {};

	var Ribbon = Model.Ribbon;


	module.index = function(req, res, next) {
		Ribbon.find().sort('-date').limit(10).exec(function(err, ribbons) {
			if (err) return next(err);

			Ribbon.count().exec(function(err, count) {
				if (err) return next(err);

				res.render('admin/ribbons', {ribbons: ribbons, count: Math.ceil(count / 10)});
			});
		});
	};


	module.get_list = function(req, res, next) {
		var post = req.body;

		var Query = (post.context.text && post.context.text !== '')
			? Ribbon.find({ $text : { $search : post.context.text } } )
			: Ribbon.find();

		if (post.context.status && post.context.status != 'all') {
			Query.where('status').equals(post.context.status);
		}

		Query.count(function(err, count) {
			if (err) return next(err);

			Query.find().sort('-date').skip(+post.context.skip).limit(+post.context.limit).exec(function(err, ribbons) {
				if (err) return next(err);

				if (ribbons.length > 0) {
					var opts = {
						ribbons: ribbons,
						load_list: true,
						count: Math.ceil(count / 10),
						skip: +post.context.skip,
						compileDebug: false, debug: false, cache: true, pretty: false
					};

					res.send(jade.renderFile(__app_root + '/views/admin/ribbons/_ribbons.jade', opts));
				} else {
					res.send('end');
				}
			});
		});
	};


	return module;
};