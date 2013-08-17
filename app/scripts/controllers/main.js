'use strict';

angular.module('questApp')
  .controller('MainCtrl', function ($scope) {

  	$scope.$on('socket:news', function(event, obj){
  		$scope.awesomeThings = obj;
  	})
   
    $scope.awesomeThings;

  });
