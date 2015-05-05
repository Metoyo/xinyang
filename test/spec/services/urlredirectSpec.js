/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Service: UrlRedirect', function () {

    // load the service's module
    beforeEach(module('xinyangApp.services.UrlRedirect'));

    // instantiate service
    var UrlRedirect;
    beforeEach(inject(function (_UrlRedirect_) {
      UrlRedirect = _UrlRedirect_;
    }));

    it('should do something', function () {
      expect(!!UrlRedirect).toBe(true);
    });

  });
});
