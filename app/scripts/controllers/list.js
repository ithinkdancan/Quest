'use strict';

angular.module('questApp')
  .controller('List', function ($scope, $state, $location, socket, RoomService) {

  	$scope.createRoom = function () {
  		RoomService.get('room:create', {name: $scope.roomName}, true).then(function(obj) {
  			$location.path('/room/' + obj._id);
  		});
  	};

  	$scope.$on('socket:room:list', function(event, obj){
  		$scope.rooms = obj;
  	});

  	$scope.rooms = RoomService.get('room:list', null, true);


  });