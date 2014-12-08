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
	});

	describe('checkSites', function () {
		it('should return a promise', function () {
			var promise = SiteChecker.checkSites([]);
			promise.constructor.name.should.be.eql('Promise');
		});
	});
});