var Q   = require('q'),
	Joi = require('joi'),
	rq  = require('request');

var singleSiteSchema = Joi.string().regex(/^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/).required();
var multipleSiteSchema = Joi.array().includes(singleSiteSchema).required();

module.exports.checkSingleSite = function (site, selector) {
	selector = selector || '#ddLanguage';
	var deferred = Q.defer();
	singleSiteSchema.validate(site, function (err, value) {
		if (err) {
			deferred.reject('Site url is invalid.');
			return;
		}

		tr = require('trumpet')();

		tr.select(selector, function (data) {
			deferred.resolve({ binding: site, isNewUI: true });
		});

		tr.on('end', function () {
			deferred.resolve({ binding: site, isNewUI: false });
		});

		rq.get(site).pipe(tr);
	});

	return deferred.promise;
};

module.exports.checkSites = function (sites, selector) {
	var deferred = Q.defer();
	var resolvedSites = [];
	selector = selector || '#ddLanguage';
	multipleSiteSchema.validate(sites, function (err, value) {
		if(err) {
			deferred.reject('The provided argument was not a valid array.');
			return;
		}

		if (sites.length === 0) {
			deferred.resolve([]);
			return;
		}

		function checkSites () {
			var site = sites.shift();
			module.exports.checkSingleSite(site).then(
				function (resolvedSite) {
					resolvedSites.push(resolvedSite);
					if (sites.length > 0) {
						checkSites();
					} else {
						deferred.resolve(resolvedSites);
					}
				},
				function (reason) {
					console.log('Oops!', reason);
				}
			);
		}

		checkSites();
	});
	return deferred.promise;
};