var rq = require('request'),
	tr = require('trumpet')();

console.log('Checking...',process.argv[2]);

var newUI = false;
rq.get(process.argv[2]).pipe(tr);

tr.select('#ddLanguage', function (data) {
	console.log('Is the new UI.');
	newUI = true;
});

tr.on('end', function () {
	if (!newUI) {
		console.log('Is not the new UI.');
	}
});