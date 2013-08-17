'use strict';

angular.module('questApp')
  .controller('MainCtrl', function ($scope) {

  	$scope.$on('socket:news', function(){
  		console.log(arguments)
  	})
   
    $scope.awesomeThings = [
      'Esmeralda',
      'Daniel',
      'Kingsley',
      'Roxy'
    ];

  });
