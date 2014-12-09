var Q   = require('q'),
	Joi = require('joi'),
	sql = require('mssql');

var getBindingsSchema = Joi.alternatives().try(Joi.string().required(), Joi.array().includes(Joi.string()).required());
var selectAllQuery = "SELECT S.SiteName, S.WebPool, S.NewUI, sb.Domain FROM [Site] S WITH(NOLOCK) LEFT JOIN Config.SiteBinding sb ON S.SiteID = sb.SiteID AND sb.[Status] = 'A' WHERE S.[Status] = 'A' ORDER BY S.SiteName";
var selectSingleQuery = "SELECT S.SiteName, S.WebPool, S.NewUI, sb.Domain FROM [Site] S WITH(NOLOCK) LEFT JOIN Config.SiteBinding sb ON S.SiteID = sb.SiteID AND sb.[Status] = 'A' WHERE S.[Status] = 'A' AND S.SiteName = @SiteName ORDER BY S.SiteName";

var config = {
	user: 'logictrack',
	password: '#2show!t',
	server: '10.0.7.27',
	database: 'PositionLogic'
};

function validateSchema(arg) {
	var deferred = Q.defer();
	getBindingsSchema.validate(arg, function (err, value) {
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

function BindingsMetaModel(site) {

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

	this.connectToDB = function () {
		var deferred = Q.defer();
		var cnn = new sql.Connection(config, function (err) {
			if (err) {
				deferred.reject(err);
				return;
			}
			deferred.resolve(cnn);
		});
		return deferred.promise;
	}

	this.queryAllClients = function (cnn) {
		var deferred = Q.defer();
		new sql.Request(cnn).query(selectAllQuery, function (err, sites) {
			if (err) {
				deferred.reject(err);
				return;
			}

			deferred.resolve(reduceBindings(sites));

			cnn.close();
		});
		return deferred.promise;
	}

	this.querySingleClient = function (cnn) {
		var deferred = Q.defer();

		var statement = new sql.PreparedStatement(cnn);
		
		statement.input('SiteName', sql.NVarChar(100));

		statement.prepare(selectSingleQuery, function (err) {
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
	var bindingModel = new BindingsMetaModel(site);
	
	validateSchema(site)
	.then(bindingModel.connectToDB)
	.then(bindingModel.querySingleClient)
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
	var bindingModel = new BindingsMetaModel();

	bindingModel.connectToDB()
	.then(bindingModel.queryAllClients)
	.then(function (clients) {
		deferred.resolve(clients);
	})
	.catch(function (reason) {
		deferred.reject(reason);
	});

	return deferred.promise;
};