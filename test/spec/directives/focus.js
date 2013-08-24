'use strict';

describe('Directive: focus', function () {
  beforeEach(module('questApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<focus></focus>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the focus directive');
  }));
});
