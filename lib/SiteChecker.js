var Q = require('q'),
	Joi = require('joi'),
	rq = require('request'),
	tr = require('trumpet')();

var singleSiteSchema = Joi.string().regex(/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/).required();
var multipleSiteSchema = Joi.array().includes(singleSiteSchema).required();

module.exports.checkSingleSite = function (site) {
	var deferred = Q.defer();
	singleSiteSchema.validate(site, function (err, value) {
		if (err) {
			deferred.reject('Site url is invalid.');
			return;
		}

		tr.select('#ddLanguage', function (data) {
			deferred.resolve({ binding: site, isNewUI: true });
		});

		tr.on('end', function () {
			deferred.resolve({ binding: site, isNewUI: false });
		});

		rq.get(site).pipe(tr);
	});
	return deferred.promise;
};

module.exports.checkSites = function (sites) {
	var deferred = Q.defer();
	return deferred.promise;
};