var SiteChecker = require('./lib/SiteChecker'),
	SiteInfoProvider = require('./lib/SiteInfoProvider');

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
					console.log(resolved);
					console.log(resolved.length);
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