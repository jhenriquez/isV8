var Q   = require('q'),
	Joi = require('joi'),
	sql = require('mssql');

var argumentSchema = Joi.alternatives().try(Joi.string().required(), Joi.array().includes(Joi.string()).required());
var sitesArray = Joi.array().includes(Joi.string()).required();

var config = {
	user: process.env.PL_DB_USER,
	password: process.env.PL_DB_PASSWORD,
	server: process.env.PL_DB_SERVER,
	database: process.env.PL_DB
};

function validateSchema(arg) {
	var deferred = Q.defer();
	argumentSchema.validate(arg, function (err, value) {
		if (err) {
			deferred.reject(err.toString());
			return;
		}

		if (Array.isArray(arg) && value.length === 0) {
			deferred.reject('An empty array is not a valid value.');
			return;
		}

		deferred.resolve(value);
	});
	return deferred.promise;
}

function DatabaseMetaModel() {
	this.connect = function (cfg) {
		cfg = cfg || config;
		var deferred = Q.defer();
		var cnn = new sql.Connection(cfg, function (err) {
			if (err) {
				deferred.reject(err);
				return;
			}
			deferred.resolve(cnn);
		});
		return deferred.promise;
	}
}

function ClientsMetaModel(site) {

	function reduceBindings(sites) {
		var group = sites.reduce(
			function (previousValue, site) {
				previousValue[site.SiteName] = previousValue[site.SiteName] || { name: site.SiteName, pool: site.WebPool, v8: site.NewUI, bindings: [] };
				previousValue[site.SiteName].bindings.push(site.Domain);
				return previousValue;
			}, 
		{});

		return Object.keys(group).map(function (key) { return group[key]; });
	}

	function unfilteredQuery(criteria, cnn) {
		var deferred = Q.defer();

		new sql.Request(cnn).query(criteria, function (err, result) {
			if (err) {
				deferred.reject(err);
				return;
			}

			deferred.resolve(result);

			cnn.close();
		});

		return deferred.promise;
	}

	this.getLegacySubscriptions = function (cnn) {
		return unfilteredQuery(process.env.SITE_LEGACY_SUBSCRIPTIONS, cnn);
	}

	this.findAll = function (cnn) {
		return unfilteredQuery(process.env.SITES_ALL, cnn);
	}

	this.getBindingsAll = function (cnn) {
		var deferred = Q.defer();

		unfilteredQuery(process.env.ALL_SITES_BINDINGS, cnn)
			.then(function (sites) { deferred.resolve(reduceBindings(sites)); }, function (fail) { deferred.reject(fail); });

		return deferred.promise;
	}

	this.getBindings = function (cnn) {
		var deferred = Q.defer();

		var statement = new sql.PreparedStatement(cnn);
		
		statement.input('SiteName', sql.NVarChar(100));

		statement.prepare(process.env.SITE_BINDINGS, function (err) {
			if (err) {
				deferred.reject(err);
				return;
			}

			statement.execute({ SiteName: site }, function (err, sites) {
				if (err) {
					deferred.reject(err);
					return;
				}

				deferred.resolve(reduceBindings(sites));

				cnn.close();
			});
		});

		return deferred.promise;	
	}
}

module.exports.getBindings = function (site) {
	var deferred = Q.defer();
	var clients = new ClientsMetaModel(site);
	var database = new DatabaseMetaModel();
	
	validateSchema(site)
	.then(database.connect)
	.then(clients.getBindings)
	.then(function (clients) {
		deferred.resolve(clients);
	})
	.catch(function (reason) {
		deferred.reject(reason);
	});

	return deferred.promise;
};

module.exports.getAllBindings = function () {
	var deferred = Q.defer();
	var clients = new ClientsMetaModel();
	var database = new DatabaseMetaModel();

	database.connect()
	.then(bindingModel.getBindingsAll)
	.then(function (clients) {
		deferred.resolve(clients);
	})
	.catch(function (reason) {
		deferred.reject(reason);
	});

	return deferred.promise;
};

module.exports.sites = function () {
	var deferred = Q.defer();
	var database = new DatabaseMetaModel();
	var clients = new ClientsMetaModel();

	database
		.connect()
		.then(clients.findAll)
		.then(deferred.resolve)
		.catch(function (err) {
			console.log(err);
			deferred.reject(err);
		});
	

	return deferred.promise;
}

module.exports.getLegacySubscriptions = function () {
	var deferred = Q.defer();
	var database = new DatabaseMetaModel();
	var clients = new ClientsMetaModel();

	database.connect()
		.then(clients.findAll)
		.then(
			function (sites) {
				var shallow_sites = sites.slice();
				var results = [];
				var bracketsRegex = /[\[\]]/g;

				(function getSubsAsync() {
					var site = shallow_sites.shift();

					database.connect({
						user: process.env.PL_DB_USER,
						password: process.env.PL_DB_PASSWORD,
						server: site.DBServer.replace(bracketsRegex,''),
						database: site.SiteName
					})
					.then(clients.getLegacySubscriptions)
					.then(function (subs) {
						site.LegacySubscriptions = subs;
						results.push(site);
					})
					.catch(function (err) {
						site.Error = err;
						results.push(site);						
					})
					.finally(function () {
						deferred.notify(site);
						if (shallow_sites.length === 0) {
							deferred.resolve(results);
						} else { getSubsAsync(); }
					});
				})();
			})
		.catch(function (err) {
			deferred.reject(err);
		});


  return deferred.promise;
}