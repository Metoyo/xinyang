/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Filter: myLocalDateWithWeek', function () {

    // load the filter's module
    beforeEach(module('xinyangApp.filters.MyLocalDateWithWeek'));

    // initialize a new instance of the filter before each test
    var myLocalDateWithWeek;
    beforeEach(inject(function ($filter) {
      myLocalDateWithWeek = $filter('myLocalDateWithWeek');
    }));

    it('should return the input prefixed with "myLocalDateWithWeek filter:"', function () {
      var text = 'angularjs';
      expect(myLocalDateWithWeek(text)).toBe('myLocalDateWithWeek filter: ' + text);
    });

  });
});
