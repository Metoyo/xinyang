/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Filter: myLocalDate', function () {

    // load the filter's module
    beforeEach(module('xinyangApp.filters.MyLocalDate'));

    // initialize a new instance of the filter before each test
    var myLocalDate;
    beforeEach(inject(function ($filter) {
      myLocalDate = $filter('myLocalDate');
    }));

    it('should return the input prefixed with "myLocalDate filter:"', function () {
      var text = 'angularjs';
      expect(myLocalDate(text)).toBe('myLocalDate filter: ' + text);
    });

  });
});
