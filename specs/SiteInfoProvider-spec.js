var chai = require('chai');

require('dotenv').load();

chai.should();

 describe('SiteInfoProvider', function () {
  
  var SiteInfoProvider;

  before(function () {
    SiteInfoProvider = require('../lib/SiteInfoProvider');
  });

 	describe('getBindings', function () {
 		it('it returns a promise.', function () {
 			SiteInfoProvider.getBindings().constructor.name.should.be.eql('Promise');
 		});
 	});

  describe('getLegacySubscriptions', function () {
    it('should return an array of subscriptions if available', function (done) {
      this.timeout(20000);
      SiteInfoProvider.getLegacySubscriptions().then(
        function (sites) {
          try {
            sites.LegacySubscriptions.should.be.ok.and.be.instanceof(Array);
            done();
          } catch (x) {
            done(x);
          }
        },
        function (fail) {
          done(fail);
        });
    });
  });

  describe('sites', function () {
    it('should return all sites when called with no parameters', function (done) {
      this.timeout(20000);
      SiteInfoProvider.sites().then(function (sites) {
        try {
         sites.should.be.instanceof(Array);
         done();
        }  catch(x) {
          done(x);
        }
      },
      function (fail) {
        console.log('Error log: ', fail);
        done(new Error('Oops. Something went wrong. Please, read the console log.'));
      });
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