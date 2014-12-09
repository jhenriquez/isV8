var chai = require('chai'),
 	SiteInfoProvider = require('../lib/SiteInfoProvider');

 chai.should();

 describe('SiteInfoProvider', function () {
 	describe('getBindings', function () {
 		it('it returns a promise.', function () {
 			SiteInfoProvider.getBindings().constructor.name.should.be.eql('Promise');
 		});
 	});

 	describe('getBindings Validations', function (done) {
 		it('would reject an empty string.', function (done) {
 			SiteInfoProvider.getBindings('').then(
 				function () {
 					done(new Error('Failed because the promise should have been rejected.'));
 				},
 				function (reason) {
 					try {
	 					reason.should.be.ok();
	 					done();
 					}  catch(x) {
 						done(x);
 					}
 				});
 		});

 		it('would reject an empty array.', function (done) {
 			SiteInfoProvider.getBindings([]).then(
 				function () {
 					done(new Error('Failed because the promise should have been rejected.'));
 				},
 				function (reason) {
 					try {
	 					reason.should.be.ok();
	 					reason.should.eql('An empty array is not a valid value.');
	 					done();
 					}  catch(x) {
 						done(x);
 					}
 				});
 		});

 		it('would reject a single value that is not a string.', function (done) {
 			SiteInfoProvider.getBindings(1).then(
 				function () {
 					done(new Error('Failed because the promise should have been rejected.'));
 				},
 				function (reason) {
 					try {
	 					reason.should.be.ok();
	 					done();
 					}  catch(x) {
 						done(x);
 					}
 				});
 		});

 		it('would reject an array that does not contain only strings.', function (done) {
 			SiteInfoProvider.getBindings(['pablo','batida', 'no',1,'dos']).then(
 				function () {
 					done(new Error('Failed because the promise should have been rejected.'));
 				},
 				function (reason) {
 					try {
	 					reason.should.be.ok();
	 					done();
 					}  catch(x) {
 						done(x);
 					}
 				});
 		});
 	});
 });