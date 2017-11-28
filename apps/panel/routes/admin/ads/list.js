var jade = require('jade');

module.exports = function(Model) {
	var module = {};

	var Ad = Model.Ad;


	module.index = function(req, res, next) {
		Ad.find().sort('-date').limit(10).exec(function(err, ads) {
			if (err) return next(err);

			Ad.count().exec(function(err, count) {
				if (err) return next(err);

				res.render('admin/ads', {ads: ads, count: Math.ceil(count / 10)});
			});
		});
	};


	module.get_list = function(req, res, next) {
		var post = req.body;

		var Query = (post.context.text && post.context.text !== '')
			? Ad.find({ $text : { $search : post.context.text } } )
			: Ad.find();

		if (post.context.status && post.context.status != 'all') {
			Query.where('status').equals(post.context.status);
		}

		Query.count(function(err, count) {
			if (err) return next(err);

			Query.find().sort('-date').skip(+post.context.skip).limit(+post.context.limit).exec(function(err, ads) {
				if (err) return next(err);

				if (ads.length > 0) {
					var opts = {
						ads: ads,
						load_list: true,
						count: Math.ceil(count / 10),
						skip: +post.context.skip,
						compileDebug: false, debug: false, cache: true, pretty: false
					};

					res.send(jade.renderFile(__app_root + '/views/admin/ads/_ads.jade', opts));
				} else {
					res.send('end');
				}
			});
		});
	};


	return module;
};