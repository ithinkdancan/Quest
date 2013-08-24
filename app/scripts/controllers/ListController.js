'use strict';

angular.module('questApp')
  .controller('List', function ($scope, $state, $location, socket, QuestService) {

    $scope.list = {};
    $scope.quest = {};

  	$scope.createQuest = function () {
  		QuestService.get('quest:create', {name: $scope.quest.name}, true).then(function(obj) {
  			$location.path('/quest/' + obj._id);
  		});
  	};

  	$scope.$on('socket:quest:list', function(event, obj){
  		$scope.quests = obj;
  	});

  	$scope.quests = QuestService.get('quest:list', null, true);


  });