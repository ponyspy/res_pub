var mongoose = require('mongoose'),
		mongooseLocale = require('mongoose-locale'),
		mongooseBcrypt = require('mongoose-bcrypt');

var Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/res_pub');


// ------------------------
// *** Schema Block ***
// ------------------------


var userSchema = new Schema({
	login: String,
	password: String,
	email: String,
	status: String,
	date: {type: Date, default: Date.now, index: -1 },
});

var ribbonSchema = new Schema({
	title: { type: String, trim: true, locale: true },
	ad_colour: String,
	media: [{
		meta: {
			date_start: Date,
			date_end: Date,
			counter: Number
		},
		object: { type: ObjectId, ref: 'Media' }
	}],
	_short_id: { type: String, unique: true, index: true },
	status: String,
	date: { type: Date, default: Date.now, index: -1 },
});

var mediaSchema = new Schema({
	path: {
		main: String,
		preview: String
	},
	type: String, // video, image
	meta: {
		date_start: Date,
		date_end: Date,
		counter: Number
	},
	_short_id: { type: String, unique: true, index: true },
	date: { type: Date, default: Date.now, index: -1 },
});

var adSchema = new Schema({
	title: { type: String, trim: true, locale: true },
	meta: {
		date_start: Date,
		date_end: Date
	},
	places: [{ type: ObjectId, ref: 'Place' }],
	_short_id: { type: String, unique: true, index: true },
	status: String,
	date: { type: Date, default: Date.now, index: -1 },
});

var placeSchema = new Schema({
	title: { type: String, trim: true, locale: true },
	comment: { type: String, trim: true, locale: true },
	ribbon: { type: ObjectId, ref: 'Ribbon' },
	type: String, // city, shop, device
	inheritance: Boolean,
	meta: {
		parent: { type: ObjectId, ref: 'Place' },
		children: [{ type: ObjectId, ref: 'Place' }]
	},
	_short_id: { type: String, unique: true, index: true },
	status: String,
	date: { type: Date, default: Date.now, index: -1 },
});


// ------------------------
// *** Index Block ***
// ------------------------


placeSchema.index({'title.value': 'text', 'comment.value': 'text'}, {language_override: 'lg', default_language: 'ru'});
ribbonSchema.index({'title.value': 'text'}, {language_override: 'lg', default_language: 'ru'});
adSchema.index({'title.value': 'text'}, {language_override: 'lg', default_language: 'ru'});


// ------------------------
// *** Plugins Block ***
// ------------------------


userSchema.plugin(mongooseBcrypt, { fields: ['password'] });

ribbonSchema.plugin(mongooseLocale);
adSchema.plugin(mongooseLocale);
placeSchema.plugin(mongooseLocale);


// ------------------------
// *** Exports Block ***
// ------------------------


module.exports.User = mongoose.model('User', userSchema);
module.exports.Ribbon = mongoose.model('Ribbon', ribbonSchema);
module.exports.Media = mongoose.model('Media', mediaSchema);
module.exports.Ad = mongoose.model('Ad', adSchema);
module.exports.Place = mongoose.model('Place', placeSchema);