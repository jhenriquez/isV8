var chai = require('chai'),
	SiteChecker = require('../lib/SiteChecker');

chai.should();

describe('SiteChecker', function () {
	describe('checkSingleSite', function () {
		it('should return a promise', function () {
			var promise = SiteChecker.checkSingleSite('someSite');
			promise.constructor.name.should.be.eql('Promise');
		});
		it('should reject a non valid url.', function (done) {
			SiteChecker.checkSingleSite('nonValidUrlString').then(
			function () {
				done(new Error('Failed because it should not have validated the string.'));
			},
			function (reason) {
				reason.should.be.ok();
				done();
			});
		});
		it('should resolve when a valid url passed.', function (done) {
			this.timeout(10000);
			SiteChecker.checkSingleSite('http://stagesite.positionlogic.com').then(
			function (value) {
				value.should.be.ok();
				done();
			},
			function (reason) {
				done(new Error('Failed because it should not have rejected the string.'));
			});
		});
		it('should resolve to: { binding: "http://www.google.com", isNewUI: false } for checkSite("http://www.google.com")', function (done) {
			this.timeout(10000);
			SiteChecker.checkSingleSite('http://www.google.com').then(
			function (value) {				
				try {
					value.binding.should.be.ok();
					value.binding.should.eql('http://www.google.com');
					value.isNewUI.should.not.be.ok();
					done();
				} catch (x) {
					done(x);
				}
			},
			function (reason) {
				done(new Error('Failed because it should not have rejected the string.'));
			});
		});

		it('should resolve to: { binding: "http://track.positionlogic.com", isNewUI: true } for checkSite("http://track.positionlogic.com")', function (done) {
			this.timeout(10000);
			SiteChecker.checkSingleSite('http://track.positionlogic.com').then(
				function (value) {				
					try {
						value.binding.should.be.ok();
						value.binding.should.eql('http://track.positionlogic.com');
						value.isNewUI.should.be.ok();
						done();
					} catch (x) {
						done(x);
					}
				},
				function (reason) {
					done(new Error('Failed because it should not have rejected the string.'));
				});
		});
	});

	describe('checkSites', function () {
		it('should return a promise', function () {
			var promise = SiteChecker.checkSites([]);
			promise.constructor.name.should.be.eql('Promise');
		});
		it('complains if an array of sites is not provided. checkSites(["site","site"]).', function (done) {
			SiteChecker.checkSites(["site","site"]).then(
				function () {
					done(new Error("Failed because it didn't complain about the arguments."));
				},
				function (reason) {
					try {
						reason.should.be.ok();
						reason.should.eql('The provided argument was not a valid array.');
						done();
					} catch(x) {
						done(x);
					}
				});
		});
		it('fails if any of the sites in the array is invalid', function (done) {
			SiteChecker.checkSites(["www.google.com","site","www.positionlogic.com"]).then(
				function () {
					done(new Error("Failed because it didn't complain about the arguments."));
				},
				function (reason) {
					try {
						reason.should.be.ok();
						reason.should.eql('The provided argument was not a valid array.');
						done();
					} catch(x) {
						done(x);
					}
				});
		});
		it('allows the empty array and resolves to an empty array.', function (done) {
			SiteChecker.checkSites([]).then(
				function (value) {
					try {
						value.should.be.ok();
						value.should.be.a('Array').with.length(0);
						done();
					} catch(x) {
						done(x);
					}
				},
				function () {
					done(new Error("Failed because it did complain about the arguments."));
				});
		});
		it('resolves every site passed on the array', function (done) {
			this.timeout(20000);
			var sites = ['http://www.google.com', 'http://track.positionlogic.com'];

			SiteChecker.checkSites(sites).then(
				function (value) {
					try {
						value.should.be.ok();
						value.should.be.a('Array').and.have.length(2);
						done();
					} catch(x) {
						done(x);
					}
				},
				function () {
					done(new Error("Failed because it did complain about the arguments."));
				});

		});
		it('accepts urls without protocol', function (done) {
			this.timeout(20000);
			var sites = ['google.com'];

			SiteChecker.checkSites(sites).then(
				function (value) {
					try {
						value.should.be.ok();
						value.should.be.a('Array').with.length(1);
						done();
					} catch(x) {
						done(x);
					}
				},
				function () {
					done(new Error("Failed because it did complain about the arguments."));
				});
		});

		it('accepts urls with trailing spaces', function (done) {
			this.timeout(20000);
			var sites = ['  google.com'];

			SiteChecker.checkSites(sites).then(
				function (value) {
					try {
						value.should.be.ok();
						value.should.be.a('Array').with.length(1);
						done();
					} catch(x) {
						done(x);
					}
				},
				function (reason) {
					done(new Error("Failed because it did complain about the arguments."));
				});
		});

		it('it continues even if some of provided sites fail.', function (done) {
			this.timeout(20000);
			var sites = ['  google.com','labasuradesite.com','track.positionlogic.com'];

			SiteChecker.checkSites(sites).then(
				function (value) {
					try {
						value.should.be.ok();
						value.should.be.a('Array').with.length(3);
						value[1].isNewUI.should.eql('unknown');
						done();
					} catch(x) {
						done(x);
					}
				},
				function (reason) {
					done(new Error("Failed because it did complain about the arguments."));
				});
		});
	});
});