/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Directive: hoverSlide', function () {

    // load the directive's module
    beforeEach(module('xinyangApp.directives.HoverSlide'));

    var element,
      scope;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function ($compile) {
      element = angular.element('<hover-slide></hover-slide>');
      element = $compile(element)(scope);
      expect(element.text()).toBe('this is the hoverSlide directive');
    }));
  });
});
