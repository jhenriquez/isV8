var SiteChecker = require('./lib/SiteChecker');

console.log('Checking...',process.argv[2]);

SiteChecker.checkSingleSite(process.argv[2]).then(
	function (site) {
		console.log(site);
	},
	function (reason) {
		console.log(reason);
	});