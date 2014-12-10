var SiteChecker = require('./lib/SiteChecker'),
	SiteInfoProvider = require('./lib/SiteInfoProvider'),
	mongoClient = require('mongodb').MongoClient,
	dotenv = require('dotenv');

dotenv.load();

function onSuccess (clients) {
	var resolved = [];
	mongoClient.connect(process.env.db, function (err, db) {
		if (err) {
			console.log('error connecting:', err);
			return;
		}
		var sites = db.collection('sites');

		(function checkClient() {
			var client = clients.shift();
			SiteChecker.checkSites(client.bindings).then(
				function (resolvedBindings) {
					client.bindings = resolvedBindings;
					sites.insert(client, {w:1}, function (err, r) {
						if (err) {
							console.log('error inserting:', err);
							return;
						}
						console.log('resulted:', r);
					});

					if (clients.length === 0) {
						mongoClient.close();
						return;
					} else {
						checkClient();
					}
					
				}, function (reason) {
					console.log(reason);
					console.log(client);				
					if (clients.length > 0) {
						checkClient();
					}
				});
		})();
	});
}

function onError (reason) {
	console.log(reason);
}

SiteInfoProvider.getAllBindings().then(onSuccess,onError);