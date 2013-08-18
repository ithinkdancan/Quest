'use strict';

angular.module('questApp')
  .controller('List', function ($scope, $state, $location, socket, QuestService) {

  	$scope.createRoom = function () {
  		QuestService.get('room:create', {name: $scope.roomName}, true).then(function(obj) {
  			$location.path('/room/' + obj._id);
  		});
  	};

  	$scope.$on('socket:room:list', function(event, obj){
  		$scope.rooms = obj;
  	});

  	$scope.rooms = QuestService.get('room:list', null, true);


  });