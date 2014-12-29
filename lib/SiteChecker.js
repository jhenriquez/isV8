var Q   = require('q'),
	Joi = require('joi'),
	rq  = require('request'),
	dns = require('dns'),
	url = require('url');

var singleSiteSchema = Joi.string().regex(/(?:(http(?:s)?\:\/\/)?[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/i).required();
var multipleSiteSchema = Joi.array().includes(singleSiteSchema).required();

module.exports.checkSingleSite = function (site, selector) {
	selector = selector || '#ddLanguage';
	site = site.indexOf('http://') !== -1 ? site : 'http://'.concat(site.trim());
	var deferred = Q.defer();
	singleSiteSchema.validate(site, function (err, value) {
		if (err) {
			deferred.reject('Site url is invalid.');
			return;
		}

		dns.lookup(url.parse(site).host, function (err, addrs) {
			var binding = { binding: site, address: addrs, dnsError: err };

			tr = require('trumpet')();

			tr.setMaxListeners(15);

			tr.select(selector, function (data) {
				binding.isNewUI = true;
				deferred.resolve(binding);
			});

			tr.on('end', function () {
				binding.isNewUI = false;
				deferred.resolve(binding);
			});

			var rqStream = rq.get(site);

			rqStream.on('error', function (err) {
				binding.isNewUI = 'unknown';
				binding.Error = err;
				deferred.resolve(binding);
			});

			rqStream.setMaxListeners(15);

			rqStream.pipe(tr);
		});
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

		(function checkSites () {
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
		})();
	});
	return deferred.promise;
};