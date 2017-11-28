var jade = require('jade');

module.exports = function(Model) {
	var module = {};

	var People = Model.People;


	module.index = function(req, res, next) {
		People.find().sort('-date').limit(10).exec(function(err, peoples) {
			if (err) return next(err);

			People.count().exec(function(err, count) {
				if (err) return next(err);

				res.render('admin/peoples', {peoples: peoples, count: Math.ceil(count / 10)});
			});
		});
	};


	module.get_list = function(req, res, next) {
		var post = req.body;

		var Query = (post.context.text && post.context.text !== '')
			? People.find({ $text : { $search : post.context.text } } )
			: People.find();

		if (post.context.type && post.context.type != 'all') {
			Query.where('type').equals(post.context.type);
		}

		if (post.context.status && post.context.status != 'all') {
			Query.where('status').equals(post.context.status);
		}

		Query.count(function(err, count) {
			if (err) return next(err);

			Query.find().sort('-date').skip(+post.context.skip).limit(+post.context.limit).exec(function(err, peoples) {
				if (err) return next(err);

				if (peoples.length > 0) {
					var opts = {
						peoples: peoples,
						load_list: true,
						count: Math.ceil(count / 10),
						skip: +post.context.skip,
						compileDebug: false, debug: false, cache: true, pretty: false
					};

					res.send(jade.renderFile(__app_root + '/views/admin/peoples/_peoples.jade', opts));
				} else {
					res.send('end');
				}
			});
		});
	};


	return module;
};