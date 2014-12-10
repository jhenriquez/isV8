var SiteChecker = require('./lib/SiteChecker'),
	SiteInfoProvider = require('./lib/SiteInfoProvider'),
	mongoClient = require('mongodb').MongoClient,
	dotenv = require('dotenv');

dotenv.load();

function onSuccess (clients) {
	var resolved = [];
	(function checkClient() {
		var client = clients.shift();
		SiteChecker.checkSites(client.bindings).then(
			function (resolvedBindings) {
				client.bindings = resolvedBindings;
				resolved.push(client);
				console.log(client);
				if (clients.length === 0) {
					mongoClient.connect(process.env.db, function (err, db) {
						if (err) {
							console.log('error connecting:', err);
							return;
						}
						var sites = db.collection('sites');
						sites.insert(resolved, {w:1}, function (err, r) {
							if (err) {
								console.log('error inserting:', err);
								return;
							}
							console.log('Persitence result:',r);
							console.log('Thank you! Have a nice one!');
							mongoClient.close();
						});
					});
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
}

function onError (reason) {
	console.log(reason);
}

SiteInfoProvider.getAllBindings().then(onSuccess,onError);