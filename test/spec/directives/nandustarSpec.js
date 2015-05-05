/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Directive: nanDuStar', function () {

    // load the directive's module
    beforeEach(module('xinyangApp.directives.NanDuStar'));

    var element,
      scope;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function ($compile) {
      element = angular.element('<nan-du-star></nan-du-star>');
      element = $compile(element)(scope);
      expect(element.text()).toBe('this is the nanDuStar directive');
    }));
  });
});
