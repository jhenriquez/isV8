require('dotenv').load();

var SiteChecker = require('./lib/SiteChecker'),
	SiteInfoProvider = require('./lib/SiteInfoProvider'),
	mongoClient = require('mongodb').MongoClient;



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
					console.log(client);
					sites.insert(client, {w:1}, function (err, r) {
						if (err) {
							console.log('error inserting:', err);
							return;
						}
						console.log('Persisted.');
					});

					if (clients.length === 0) {
						mongoClient.close();
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


function PersistAllThisCrap(sites) {
	mongoClient.connect(process.env.db, function (err, db) {
		if (err) {
			console.log('error connecting:', err);
			return;
		}
		var subs = db.collection('LegacySubscriptions');
		subs.insert(sites, {w:1}, function (err, r) {
			if(err) throw err;
			console.log('persisted', r);
			db.close();
		});
	});
}		

		

		
			


SiteInfoProvider
	.getLegacySubscriptions()
	.then(PersistAllThisCrap,
		function (err) { console.log('Error:', err); },
		function (site) { console.log('Processed Site', site); }
	);


/*

var siteName = process.argv[2];


if (siteName) {
  console.log('Checking Bindings for:',siteName);
  SiteInfoProvider.getBindings(siteName).then(onSuccess,onError);
} else {
  SiteInfoProvider.getAllBindings().then(onSuccess, onError);
}

*/