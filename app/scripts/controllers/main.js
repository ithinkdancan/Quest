'use strict';

angular.module('questApp')
  .controller('MainCtrl', function ($scope, socket) {

  	$scope.$on('socket:news', function(event, obj){
  		console.log('obj', obj);
  		$scope.awesomeThings = obj;
  	})

  	socket.emit('getThings');
   
    $scope.awesomeThings;

  });
